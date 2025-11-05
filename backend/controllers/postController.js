const pgPool = require('../database/pg_connection');

// ---------- GET ALL POSTS ----------
exports.getAllPosts = async (req, res) => {
  const { type } = req.query;

  try {
    let query = `
      SELECT 
        p.id, p.type, p.topic, p.created_at, p.author_id,
        u.first_name AS author_name, u.avatar AS author_avatar,
        b.title, b.description, b.image, b.end_time,
        COALESCE(v.total_votes, 0) AS votes,
        COALESCE(c.total_comments, 0) AS comments,
        COALESCE(w.total_views, 0) AS views
      FROM posts p
      JOIN post_body b ON p.id = b.post_id
      JOIN users u ON p.author_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS total_votes
        FROM post_reactions
        WHERE reaction_type = 'vote'
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

// ---------- CREATE A NEW POST ----------
exports.createPost = async (req, res) => {
  const { type, topic, title, description, image, end_time, author_id } = req.body;
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

    res.status(201).json({ message: "Post created successfully", postId });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error creating post", detail: err.message });
  }
};
