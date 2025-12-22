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
      COALESCE(c.total_comments, 0) AS comments,
      COALESCE(w.total_views, 0) AS views
    FROM posts p
    JOIN post_body b ON p.id = b.post_id
    JOIN users u ON p.author_id = u.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS total_votes
      FROM post_votes
      GROUP BY post_id
    ) v ON p.id = v.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS total_comments
      FROM post_comments
      GROUP BY post_id
    ) c ON p.id = c.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS total_views
      FROM post_reactions
      WHERE reaction_type = 'view'
      GROUP BY post_id
    ) w ON p.id = w.post_id
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
        COALESCE(c.total_comments, 0) AS comments,
        COALESCE(w.total_views, 0) AS views
      FROM posts p
      JOIN post_body b ON p.id = b.post_id
      JOIN users u ON p.author_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_votes
        FROM post_votes
        GROUP BY post_id
      ) v ON p.id = v.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_comments
        FROM post_comments
        GROUP BY post_id
      ) c ON p.id = c.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_views
        FROM post_reactions
        WHERE reaction_type = 'view'
        GROUP BY post_id
      ) w ON p.id = w.post_id
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
  const { type, topic, title, description, image, end_time, author_id, options } = req.body;
  const authorId = parseInt(author_id, 10);

  if (!type || !topic || !authorId || !title || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const postResponse = await pgPool.query(
      `INSERT INTO posts (type, topic, author_id, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id;`,
      [type, topic, authorId]
    );

    const postId = postResponse.rows[0].id;

    await pgPool.query(
      `INSERT INTO post_body (post_id, title, description, image, end_time)
       VALUES ($1, $2, $3, $4, $5);`,
      [postId, title, description, image, end_time]
    );

    if (type === 'poll' && Array.isArray(options) && options.length >= 2) {
      const optionQueries = options.map(opt => 
        pgPool.query(
          `INSERT INTO post_options (post_id, option_text) VALUES ($1, $2)`,
          [postId, opt.text]
        )
      );
      await Promise.all(optionQueries);
    }

    res.status(201).json({ message: "Post created successfully", postId });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error creating post", detail: err.message });
  }
};


// ---------- GET POLL BY ID ----------

exports.getPollOptions = async (req, res) => {
  const postIdParam = req.params.postId ?? req.params.id;
  const postId = parseInt(postIdParam, 10);

  try {
    const optionsRes = await pgPool.query(
      `SELECT id, option_text AS text, votes
       FROM post_options
       WHERE post_id = $1
       ORDER BY id ASC`,
      [postId]
    );

    if (!optionsRes.rows.length) {
      return res.status(404).json({ error: "No options found for this poll" });
    }

    res.status(200).json({ options: optionsRes.rows });
  } catch (err) {
    console.error("Error fetching poll options:", err);
    res.status(500).json({ error: "Server error fetching poll options", detail: err.message });
  }
};


// ---------- VOTE ----------

exports.votePoll = async (req, res) => {
  const postIdParam = req.params.postId ?? req.params.id;
  const postId = parseInt(postIdParam, 10);
  const { user_id, option_id } = req.body || {};

  if (!postId || Number.isNaN(postId)) {
    return res.status(400).json({ error: 'Missing or invalid post id', details: { postIdParam } });
  }
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in request body' });
  }
  if (!option_id) {
    return res.status(400).json({ error: 'Missing option_id in request body' });
  }

  const userId = parseInt(user_id, 10);
  const optionId = parseInt(option_id, 10);
  if (Number.isNaN(userId) || Number.isNaN(optionId)) {
    return res.status(400).json({ error: 'user_id and option_id must be integers' });
  }

  try {
    const opt = await pgPool.query('SELECT id, post_id FROM post_options WHERE id = $1', [optionId]);
    if (!opt.rows.length || opt.rows[0].post_id !== postId) {
      return res.status(400).json({ error: 'Option not found or does not belong to post' });
    }

    const existing = await pgPool.query(
      'SELECT 1 FROM post_votes WHERE post_id=$1 AND user_id=$2',
      [postId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already voted!' });
    }

    await pgPool.query(
      `INSERT INTO post_votes (post_id, option_id, user_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [postId, optionId, userId]
    );

    await pgPool.query(
      'UPDATE post_options SET votes = votes + 1 WHERE id = $1',
      [optionId]
    );

    return res.status(200).json({ message: 'Vote recorded' });
  } catch (err) {
    console.error('Error voting:', err);
    return res.status(500).json({ error: 'Server error recording vote', detail: err.message });
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