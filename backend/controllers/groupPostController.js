const pgPool = require('../database/pg_connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// List posts for a group. By default only approved posts are returned.
exports.listPosts = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    // If requester is owner/admin allow seeing pending posts
    // Try to find current user id from auth middleware or Authorization header
    let currentUserId = req.userId || null;
    if (!currentUserId) {
      const header = req.headers && req.headers.authorization;
      if (header && typeof header === 'string' && header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded && decoded.userId) currentUserId = decoded.userId;
        } catch (e) {
          // ignore invalid token
        }
      }
    }

    let isPrivileged = false;
    if (currentUserId) {
      const ownerRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
      if (ownerRes.rows.length && ownerRes.rows[0].created_by === currentUserId) isPrivileged = true;
      const adminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, currentUserId, 'owner', 'admin']);
      if (adminRes.rows.length) isPrivileged = true;
    }

    const params = [groupId];
    let statusWhere = "AND gp.status = 'approved'";
    if (isPrivileged) statusWhere = ''; // show all

    const q = `
      SELECT gp.id, gp.type, gp.status, gp.created_at, gp.author_id,
        u.first_name AS author_name, u.avatar AS author_avatar,
        b.title, b.description, b.image, b.end_time,
        (SELECT COUNT(*) FROM group_post_votes v WHERE v.post_id = gp.id) AS votes,
        (SELECT COUNT(*) FROM group_post_comments c WHERE c.post_id = gp.id) AS comments
      FROM group_posts gp
      JOIN group_post_body b ON gp.id = b.post_id
      LEFT JOIN users u ON gp.author_id = u.id
      WHERE gp.group_id = $1 ${statusWhere}
      ORDER BY gp.created_at DESC
    `;

    const result = await pgPool.query(q, params);
    res.status(200).json({ posts: result.rows });
  } catch (err) {
    console.error('Error listing group posts:', err);
    res.status(500).json({ error: 'Server error listing group posts', detail: err.message });
  }
};

// Create a new group post (discussion or poll). Author derived from token (req.userId).
exports.createPost = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  const { type, title, description, image, end_time, options } = req.body || {};
  if (!type || !title || !description) return res.status(400).json({ error: 'Missing required fields' });

  try {
    // ensure group exists
    const gRes = await pgPool.query('SELECT id, post_moderation, created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });

    // determine post status depending on group moderation settings and author role
    const postModeration = gRes.rows[0].post_moderation === true;
    // check if author is owner/admin
    let isPrivileged = false;
    if (userId) {
      if (gRes.rows[0].created_by === userId) isPrivileged = true;
      const adminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
      if (adminRes.rows.length) isPrivileged = true;
    }

    const status = postModeration && !isPrivileged ? 'pending' : 'approved';

    const postRes = await pgPool.query(
      `INSERT INTO group_posts (group_id, type, author_id, status, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id`,
      [groupId, type, userId, status]
    );
    const postId = postRes.rows[0].id;

    await pgPool.query(
      `INSERT INTO group_post_body (post_id, title, description, image, end_time) VALUES ($1,$2,$3,$4,$5)`,
      [postId, title, description || null, image || null, end_time || null]
    );

    if (type === 'poll' && Array.isArray(options) && options.length >= 2) {
      const optQueries = options.map(opt => pgPool.query('INSERT INTO group_post_options (post_id, option_text) VALUES ($1,$2)', [postId, opt.text]));
      await Promise.all(optQueries);
    }

    const respMessage = status === 'pending' ? 'Group post submitted for approval' : 'Group post created';
    res.status(201).json({ message: respMessage, postId, status });
  } catch (err) {
    console.error('Error creating group post:', err);
    res.status(500).json({ error: 'Server error creating group post', detail: err.message });
  }
};

// Get options for a poll (with vote counts)
exports.getOptions = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const postId = parseInt(req.params.postId, 10);
  if (Number.isNaN(groupId) || Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const q = `
      SELECT o.id, o.option_text AS text, COALESCE(v.cnt,0) AS votes
      FROM group_post_options o
      LEFT JOIN (
        SELECT option_id, COUNT(*) AS cnt FROM group_post_votes WHERE post_id = $1 GROUP BY option_id
      ) v ON o.id = v.option_id
      WHERE o.post_id = $1
      ORDER BY o.id
    `;
    const r = await pgPool.query(q, [postId]);
    // determine if requester already voted (optional auth)
    let currentUserId = req.userId || null;
    if (!currentUserId) {
      const header = req.headers && req.headers.authorization;
      if (header && typeof header === 'string' && header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded && decoded.userId) currentUserId = decoded.userId;
        } catch (e) {
          // ignore invalid token
        }
      }
    }

    let user_vote = null;
    if (currentUserId) {
      const vr = await pgPool.query('SELECT option_id FROM group_post_votes WHERE post_id=$1 AND user_id=$2 LIMIT 1', [postId, currentUserId]);
      if (vr.rows.length) user_vote = vr.rows[0].option_id;
    }

    res.status(200).json({ options: r.rows, user_vote });
  } catch (err) {
    console.error('Error fetching poll options:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Cast or change a vote
exports.vote = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const postId = parseInt(req.params.postId, 10);
  const userId = req.userId;
  const { option_id } = req.body || {};
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId) || Number.isNaN(postId) || !option_id) return res.status(400).json({ error: 'Invalid data' });

  try {
    // ensure option belongs to post
    const optRes = await pgPool.query('SELECT id FROM group_post_options WHERE id=$1 AND post_id=$2', [option_id, postId]);
    if (!optRes.rows.length) return res.status(400).json({ error: 'Option not found for this post' });

    const existing = await pgPool.query('SELECT id FROM group_post_votes WHERE post_id=$1 AND user_id=$2', [postId, userId]);
    if (existing.rows.length) {
      return res.status(403).json({ error: 'You have already voted on this poll' });
    }
    await pgPool.query('INSERT INTO group_post_votes (post_id, option_id, user_id) VALUES ($1,$2,$3)', [postId, option_id, userId]);

    // return updated option counts
    const q = `
      SELECT o.id, o.option_text AS text, COALESCE(v.cnt,0) AS votes
      FROM group_post_options o
      LEFT JOIN (
        SELECT option_id, COUNT(*) AS cnt FROM group_post_votes WHERE post_id = $1 GROUP BY option_id
      ) v ON o.id = v.option_id
      WHERE o.post_id = $1
      ORDER BY o.id
    `;
    const r = await pgPool.query(q, [postId]);
    res.status(200).json({ options: r.rows });
  } catch (err) {
    console.error('Error voting on poll:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// List comments for a group post
exports.listComments = async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if (Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

  try {
    const q = `
      SELECT c.id, c.comment, c.created_at, c.user_id, u.first_name AS author_name, u.avatar AS author_avatar
      FROM group_post_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
    `;
    const r = await pgPool.query(q, [postId]);
    res.status(200).json({ comments: r.rows });
  } catch (err) {
    console.error('Error listing comments:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Add a comment to a group post
exports.addComment = async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const userId = req.userId;
  const { comment } = req.body || {};
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(postId) || !comment) return res.status(400).json({ error: 'Invalid data' });

  try {
    const r = await pgPool.query('INSERT INTO group_post_comments (post_id, user_id, comment) VALUES ($1,$2,$3) RETURNING id, created_at', [postId, userId, comment]);
    res.status(201).json({ comment: { id: r.rows[0].id, comment, created_at: r.rows[0].created_at, user_id: userId } });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Get single group post
exports.getPost = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const postId = parseInt(req.params.postId, 10);
  if (Number.isNaN(groupId) || Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const q = `
      SELECT gp.id, gp.type, gp.status, gp.created_at, gp.author_id,
        u.first_name AS author_name, u.avatar AS author_avatar,
        b.title, b.description, b.image, b.end_time
      FROM group_posts gp
      JOIN group_post_body b ON gp.id = b.post_id
      LEFT JOIN users u ON gp.author_id = u.id
      WHERE gp.group_id=$1 AND gp.id=$2
    `;
    const r = await pgPool.query(q, [groupId, postId]);
    if (!r.rows.length) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json({ post: r.rows[0] });
  } catch (err) {
    console.error('Error fetching group post:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Approve a post (owner/admin)
exports.approvePost = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const postId = parseInt(req.params.postId, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId) || Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    const isOwner = gRes.rows[0].created_by === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized' });

    await pgPool.query("UPDATE group_posts SET status='approved' WHERE id=$1 AND group_id=$2", [postId, groupId]);
    res.status(200).json({ message: 'Post approved' });
  } catch (err) {
    console.error('Error approving post:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Reject a post
exports.rejectPost = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const postId = parseInt(req.params.postId, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId) || Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    const isOwner = gRes.rows[0].created_by === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized' });

    await pgPool.query("UPDATE group_posts SET status='rejected' WHERE id=$1 AND group_id=$2", [postId, groupId]);
    res.status(200).json({ message: 'Post rejected' });
  } catch (err) {
    console.error('Error rejecting post:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};