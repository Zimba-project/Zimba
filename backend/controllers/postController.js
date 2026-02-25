const pgPool = require('../database/pg_connection');

// ---------- GET ALL POSTS ----------
exports.getAllPosts = async (req, res) => {
  const { type } = req.query;

  try {
    let query = `
      SELECT 
        p.id, p.type, p.topic, p.created_at, p.author_id,
        u.first_name AS author_name, u.avatar AS author_avatar, u.verified AS author_verified,
        b.title, b.description, b.image, b.end_time,
        COALESCE(v.total_votes, 0) AS votes,
        COALESCE(c.total_comments, 0) AS comments
      FROM posts p
      JOIN post_body b ON p.id = b.post_id
      JOIN users u ON p.author_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_votes
        FROM poll_votes
        GROUP BY post_id
      ) v ON p.id = v.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_comments
        FROM post_comments
        GROUP BY post_id
      ) c ON p.id = c.post_id
    `;

    const params = [];
    if (type) {
      query += ` WHERE p.type = $1`;
      params.push(type);
    }

    query += ` ORDER BY p.created_at DESC;`;

    const result = await pgPool.query(query, params);

    res.status(200).json({
      message: result.rows.length ? "Posts fetched successfully" : "No posts found",
      count: result.rows.length,
      posts: result.rows,
    });

  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Internal server error fetching posts", detail: err.message });
  }
};

// ---------- GET SINGLE POST BY ID ----------
exports.getPostById = async (req, res) => {
  const postIdParam = req.params.postId ?? req.params.id;
  const postId = parseInt(postIdParam, 10);

  if (!postId || isNaN(postId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    const result = await pgPool.query(`
      SELECT 
        p.id, p.type, p.topic, p.created_at, p.author_id,
        u.first_name AS author_name, u.avatar AS author_avatar, u.verified AS author_verified,
        b.title, b.description, b.image, b.end_time,
        COALESCE(v.total_votes, 0) AS votes,
        COALESCE(c.total_comments, 0) AS comments
      FROM posts p
      JOIN post_body b ON p.id = b.post_id
      JOIN users u ON p.author_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_votes
        FROM poll_votes
        GROUP BY post_id
      ) v ON p.id = v.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_comments
        FROM post_comments
        GROUP BY post_id
      ) c ON p.id = c.post_id
      WHERE p.id = $1
    `, [postId]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ post: result.rows[0] });

  } catch (err) {
    console.error("Error fetching post by ID:", err);
    res.status(500).json({ error: "Server error fetching post", detail: err.message });
  }
};

// ---------- CREATE A NEW POST ----------
exports.createPost = async (req, res) => {
  const { type, topic, title, description, image, end_time, author_id, questions } = req.body;
  const authorId = parseInt(author_id, 10);

  if (!type || !topic || !authorId) {
    return res.status(400).json({ error: "Missing required fields: type, topic, or author_id" });
  }
  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description" });
  }

  try {
    // Insert post
    const postRes = await pgPool.query(
      `INSERT INTO posts (type, topic, author_id, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id;`,
      [type, topic, authorId]
    );
    const postId = postRes.rows[0].id;

    // Insert post body
    await pgPool.query(
      `INSERT INTO post_body (post_id, title, description, image, end_time)
       VALUES ($1, $2, $3, $4, $5);`,
      [postId, title, description, image || null, end_time || null]
    );

    // Handle multi-question polls
    if (type === 'poll' && Array.isArray(questions) && questions.length) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text || !Array.isArray(q.options) || q.options.length < 2) continue;

        // Accept either snake_case or camelCase from clients: allow_multiple or allowMultiple
        const allowMultipleValue = (q.allow_multiple ?? q.allowMultiple) === true || (q.allow_multiple ?? q.allowMultiple) === 'true' || (q.allow_multiple ?? q.allowMultiple) === 't' || (q.allow_multiple ?? q.allowMultiple) === 1 || (q.allow_multiple ?? q.allowMultiple) === '1';

        const questionRes = await pgPool.query(
          `INSERT INTO poll_questions (post_id, text, allow_multiple, position)
           VALUES ($1, $2, $3, $4) RETURNING id;`,
          [postId, q.text, allowMultipleValue, i + 1]
        );
        const questionId = questionRes.rows[0].id;

        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await pgPool.query(
            `INSERT INTO poll_options (question_id, text, position)
             VALUES ($1, $2, $3);`,
            [questionId, opt.text, j + 1]
          );
        }
      }
    }

    res.status(201).json({ message: "Post created successfully", postId });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error creating post", detail: err.message });
  }
};

// ---------- GET POLL BY ID ----------

exports.getPollOptions = async (req, res) => {
  const postId = parseInt(req.params.postId ?? req.params.id, 10);
  if (isNaN(postId)) return res.status(400).json({ error: "Invalid post ID" });

  try {
    const result = await pgPool.query(`
     SELECT 
        pq.id AS question_id,
        pq.text AS question_text,
        pq.allow_multiple,
        pq.position AS question_position,
        po.id AS option_id,
        po.text AS option_text,
        po.position AS option_position,
        COALESCE(v.vote_count, 0) AS votes
      FROM poll_questions pq
      JOIN poll_options po ON pq.id = po.question_id
      LEFT JOIN (
        SELECT option_id, COUNT(*) AS vote_count
        FROM poll_votes
        GROUP BY option_id
      ) v ON po.id = v.option_id
      WHERE pq.post_id = $1
      ORDER BY pq.position ASC, po.position ASC;
    `, [postId]);

    if (!result.rows.length) return res.status(404).json({ error: "No poll found" });

    // Group by questions
    const questions = [];
    const map = {};
    for (const row of result.rows) {
      if (!map[row.question_id]) {
        map[row.question_id] = {
          id: row.question_id,
          text: row.question_text,
          allow_multiple: row.allow_multiple,
          position: row.question_position,
          options: []
        };
        questions.push(map[row.question_id]);
      }
      map[row.question_id].options.push({
        id: row.option_id,
        text: row.option_text,
        votes: row.votes
      });
    }

    res.status(200).json({ questions });
  } catch (err) {
    console.error("Error fetching poll options:", err);
    res.status(500).json({ error: "Server error fetching poll options", detail: err.message });
  }
};

// ---------- VOTE ----------

exports.votePoll = async (req, res) => {
  // Accept camelCase and snake_case payloads. Also allow the question id to come from the URL param as a fallback.
  const rawQuestion = req.body.questionId ?? req.body.question_id ?? req.params.id ?? req.params.questionId;
  const rawUser = req.body.userId ?? req.body.user_id ?? req.body.user ?? req.body.user_id;
  let rawOptions = req.body.optionIds ?? req.body.option_ids ?? req.body.option_ids_list ?? req.body.optionIds;

  // Normalize option IDs: allow arrays, JSON-encoded strings, or comma-separated strings
  if (!Array.isArray(rawOptions) && typeof rawOptions === 'string') {
    try {
      rawOptions = JSON.parse(rawOptions);
    } catch (e) {
      rawOptions = rawOptions.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // --- Basic input validation ---
  if (!rawQuestion) return res.status(400).json({ error: "Missing questionId" });
  if (!rawUser) return res.status(400).json({ error: "Missing userId" });
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
    return res.status(400).json({ error: "Missing optionIds or empty array" });
  }

  const qId = parseInt(rawQuestion, 10);
  const uId = parseInt(rawUser, 10);
  const optionIdsInt = rawOptions.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

  if (isNaN(qId)) return res.status(400).json({ error: "Invalid questionId" });
  if (isNaN(uId)) return res.status(400).json({ error: "Invalid userId" });
  if (!optionIdsInt.length) return res.status(400).json({ error: "No valid optionIds" });

  try {
    // --- Check if question exists ---
    const qRes = await pgPool.query(
      'SELECT allow_multiple, post_id FROM poll_questions WHERE id = $1',
      [qId]
    );
    if (!qRes.rows.length) return res.status(404).json({ error: `Question with ID ${qId} not found` });

    const { allow_multiple: allowMultiple, post_id: postId } = qRes.rows[0];

    // --- Check multiple selection rules ---
    if (!allowMultiple && optionIdsInt.length > 1) {
      return res.status(400).json({
        error: "Multiple choices not allowed for this question",
        questionId: qId,
        attemptedOptionCount: optionIdsInt.length
      });
    }

    // --- Check user has already voted ---
    const existingVote = await pgPool.query(
      'SELECT 1 FROM poll_votes WHERE question_id = $1 AND user_id = $2 LIMIT 1',
      [qId, uId]
    );
    if (existingVote.rows.length > 0) {
      return res.status(409).json({ error: 'already_voted', message: `User ${uId} has already voted for question ${qId}`, userId: uId, questionId: qId });
    }

    // --- Validate option IDs belong to this question ---
    const validOptionsRes = await pgPool.query(
      'SELECT id FROM poll_options WHERE question_id = $1 AND id = ANY($2::int[])',
      [qId, optionIdsInt]
    );
    const validOptionIds = validOptionsRes.rows.map(r => r.id);
    const invalidOptions = optionIdsInt.filter(id => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      return res.status(400).json({
        error: "Invalid optionIds for this question",
        questionId: qId,
        invalidOptionIds: invalidOptions
      });
    }

    // --- Insert votes ---
    for (const optionId of validOptionIds) {
      await pgPool.query(
        `INSERT INTO poll_votes (post_id, question_id, option_id, user_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [postId, qId, optionId, uId]
      );

      await pgPool.query(
        'UPDATE poll_options SET votes = votes + 1 WHERE id = $1',
        [optionId]
      );
    }

    res.status(200).json({ message: "Vote recorded", questionId: qId, optionIds: validOptionIds });

  } catch (err) {
    console.error("Error recording vote:", err);
    res.status(500).json({
      error: "Server error recording vote",
      detail: err.message,
      stack: err.stack
    });
  }
};

// ---------- GET COMMENTS FOR A POST ----------
exports.getPostComments = async (req, res) => {
    const postIdParam = req.params.postId ?? req.params.id;
    const postId = parseInt(postIdParam, 10);

    if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
    }

    try {
        // Fetch comments for the post
        const commentsRes = await pgPool.query(`
          SELECT c.id, c.comment, c.created_at,
          u.id AS user_id, u.first_name AS user_name, u.avatar AS user_avatar
          FROM post_comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.post_id = $1
          ORDER BY c.created_at ASC
        `, [postId]);

        const comments = commentsRes.rows || [];

        // If there are comments, try to fetch replies from post_comment_replies table
        let repliesByComment = {};
        if (comments.length) {
          const commentIds = comments.map(c => c.id);
          try {
            const repliesRes = await pgPool.query(`
              SELECT r.id, r.comment_id, r.reply, r.created_at,
                   u.id AS user_id, u.first_name AS user_name, u.avatar AS user_avatar
              FROM post_comment_replies r
              JOIN users u ON r.user_id = u.id
              WHERE r.comment_id = ANY($1::int[])
              ORDER BY r.created_at ASC;
            `, [commentIds]);

            for (const r of repliesRes.rows || []) {
              const key = r.comment_id;
              if (!repliesByComment[key]) repliesByComment[key] = [];
              repliesByComment[key].push({
                id: r.id,
                text: r.reply,
                created_at: r.created_at,
                user_id: r.user_id,
                user_name: r.user_name,
                user_avatar: r.user_avatar,
              });
            }
          } catch (err) {
            // If table doesn't exist or other error, continue without replies
            console.warn('Replies unavailable:', err.message);
          }
        }

        const merged = comments.map(c => ({
          ...c,
          replies: repliesByComment[c.id] || []
        }));

        res.status(200).json({ comments: merged });
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ error: "Server error fetching comments", detail: err.message });
    }
};
// ---------- ADD A COMMENT TO A POST ----------
exports.addPostComment = async (req, res) => {
    const postIdParam = req.params.postId ?? req.params.id;
    const postId = parseInt(postIdParam, 10);
    const { user_id, comment } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "Missing postId" });
    }

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id / log in" });
    }

    if (!comment) {
      return res.status(400).json({ error: "Missing comment" });
    }

    try {
        const result = await pgPool.query(`
            INSERT INTO post_comments (post_id, user_id, comment)
            VALUES ($1, $2, $3)
            RETURNING id, post_id, user_id, comment, created_at
        `, [postId, user_id, comment]);

        res.status(201).json({ comment: result.rows[0] });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: "Server error adding comment", detail: err.message });
    }
};

  // ---------- ADD A REPLY TO A COMMENT ----------
  exports.addCommentReply = async (req, res) => {
    const postIdParam = req.params.postId ?? req.params.id;
    const postId = parseInt(postIdParam, 10);
    const commentIdParam = req.params.commentId;
    const commentId = parseInt(commentIdParam, 10);
    const { user_id, reply } = req.body;

    if (!postId || Number.isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }
    if (!commentId || Number.isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid commentId' });
    }
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id / log in' });
    }
    if (!reply || !String(reply).trim()) {
      return res.status(400).json({ error: 'Missing reply text' });
    }

    try {
      // Ensure the comment belongs to the given post
      const commentRes = await pgPool.query(
        'SELECT id FROM post_comments WHERE id = $1 AND post_id = $2',
        [commentId, postId]
      );
      if (!commentRes.rows.length) {
        return res.status(404).json({ error: 'Comment not found for this post' });
      }

      // Create replies table if it doesn't exist
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS post_comment_replies (
          id SERIAL PRIMARY KEY,
          comment_id INT NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reply TEXT NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );
      `);

      // Insert reply
      const insertRes = await pgPool.query(`
        INSERT INTO post_comment_replies (comment_id, user_id, reply)
        VALUES ($1, $2, $3)
        RETURNING id, comment_id, user_id, reply, created_at;
      `, [commentId, user_id, reply]);

      const r = insertRes.rows[0];

      // Enrich with user details for convenience
      const userRes = await pgPool.query(
        'SELECT first_name AS user_name, avatar AS user_avatar FROM users WHERE id = $1',
        [r.user_id]
      );

      res.status(201).json({
        reply: {
          id: r.id,
          comment_id: r.comment_id,
          user_id: r.user_id,
          text: r.reply,
          created_at: r.created_at,
          user_name: userRes.rows[0]?.user_name,
          user_avatar: userRes.rows[0]?.user_avatar,
        }
      });
    } catch (err) {
      console.error('Error adding comment reply:', err);
      res.status(500).json({ error: 'Server error adding reply', detail: err.message });
    }
  };