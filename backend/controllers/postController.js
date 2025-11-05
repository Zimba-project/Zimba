const pgPool = require('../database/pg_connection');

// ---------- GET ALL POSTS (polls + discussions) ----------
exports.getAllPosts = async (req, res) => {
  const { type } = req.query; // optional ?type=poll or ?type=discussion

  try {
    let query = `
      SELECT 
        p.id,
        p.type,
        p.topic,
        p.created_at,
        p.author_id,
        u.first_name AS author_name,
        u.avatar AS author_avatar,
        b.title,
        b.description,
        b.image,
        b.end_time,
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

    // Debug info for developers
    console.log("🧠 Executing getAllPosts query:", query);
    console.log("📦 With params:", params);

    const result = await pgPool.query(query, params);

    // Empty check
    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({
        message: "No posts found",
        posts: [],
      });
    }

    return res.status(200).json({
      message: "Posts fetched successfully",
      count: result.rows.length,
      posts: result.rows,
    });

  } catch (err) {
    console.error("🚨 Error in getAllPosts:");
    console.error("❌ Message:", err.message);
    console.error("📜 Stack:", err.stack);

    // Detect common Postgres errors for better clarity
    if (err.code === "42703") {
      // Undefined column
      return res.status(500).json({
        error: "Database column missing. Check your schema and query.",
        detail: err.message,
      });
    } else if (err.code === "42P01") {
      // Undefined table
      return res.status(500).json({
        error: "Database table not found. Verify your table names.",
        detail: err.message,
      });
    } else if (err.code === "42601") {
      // Syntax error
      return res.status(500).json({
        error: "SQL syntax error. Check your query structure.",
        detail: err.message,
      });
    }

    // Generic fallback
    return res.status(500).json({
      error: "Internal server error fetching posts.",
      detail: err.message,
    });
  }
};

// ---------- KEEP EXISTING POLL + DISCUSSION FUNCTIONS (optional) ----------
exports.getPolls = async (req, res) => {
  req.query.type = 'poll';
  return exports.getAllPosts(req, res);
};

exports.getDiscussions = async (req, res) => {
  req.query.type = 'discussion';
  return exports.getAllPosts(req, res);
};

// ---------- CREATE A NEW POST ----------
exports.createPost = async (req, res) => {
  console.log("Request body:", req.body);
  const { type, topic, title, description, image, end_time } = req.body;
  const author_id = parseInt(req.body.author_id, 10); 
  
  if (!type || !topic || !author_id || !title || !description)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // 1️⃣ Insert into posts table
    const postRes = await pgPool.query(
      `INSERT INTO posts (type, topic, author_id, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id;`,
      [type, topic, author_id]
    );

    const postId = postRes.rows[0].id;

    // 2️⃣ Insert into post_body
    await pgPool.query(
      `INSERT INTO post_body (post_id, title, description, image, end_time)
       VALUES ($1, $2, $3, $4, $5);`,
      [postId, title, description, image, end_time]
    );

    res.status(201).json({ message: "Post created successfully", postId });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error creating post" });
  }
};
