const pgPool = require('../database/pg_connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Create a new group (authenticated)
exports.createGroup = async (req, res) => {
  const { name, description, privacy } = req.body || {};
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!name) return res.status(400).json({ error: 'Missing group name' });

  try {
    const insertRes = await pgPool.query(
      `INSERT INTO groups (name, description, created_by, privacy, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, description, created_by, privacy, created_at;`,
      [name, description || null, userId, privacy ?? 0]
    );

    const group = insertRes.rows[0];

    // add creator as owner in members (role: 'owner')
    await pgPool.query(
      `INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES ($1, $2, $3, NOW())`,
      [group.id, userId, 'owner']
    );

    res.status(201).json({ message: 'Group created', group });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Server error creating group', detail: err.message });
  }
};

// List groups (public) - optional query: q
exports.listGroups = async (req, res) => {
  const q = req.query.q || '';
  try {
    const result = await pgPool.query(
      `SELECT g.id, g.name, g.description, g.created_by, g.privacy, g.created_at,
        COALESCE(m.count,0) AS member_count,
        u.first_name AS owner_name, u.avatar AS owner_avatar
       FROM groups g
       LEFT JOIN (
         SELECT group_id, COUNT(*) AS count FROM group_members GROUP BY group_id
       ) m ON g.id = m.group_id
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.name ILIKE $1
       ORDER BY g.created_at DESC
       LIMIT 200;`,
      [`%${q}%`]
    );

    res.status(200).json({ groups: result.rows });
  } catch (err) {
    console.error('Error listing groups:', err);
    res.status(500).json({ error: 'Server error listing groups', detail: err.message });
  }
};

// Get single group by id with members
exports.getGroup = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    const gRes = await pgPool.query(
      `SELECT g.id, g.name, g.description, g.created_by, g.privacy, g.post_moderation, g.created_at, u.first_name AS owner_name
       FROM groups g LEFT JOIN users u ON g.created_by = u.id WHERE g.id = $1`,
      [groupId]
    );

    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });

    const membersRes = await pgPool.query(
      `SELECT gm.user_id, gm.role, gm.joined_at, u.first_name, u.avatar
       FROM group_members gm JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1 ORDER BY gm.joined_at ASC`,
      [groupId]
    );

    // If request has Authorization (auth middleware sets req.userId), include membership and pending info
    let extra = {};
    // allow optional token parsing for public route: if auth middleware wasn't used, try to parse Bearer token
    let currentUserId = req.userId || null;
    if (!currentUserId) {
      const header = req.headers && req.headers.authorization;
      if (header && typeof header === 'string' && header.startsWith('Bearer ')) {
        const token = header.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded && decoded.userId) currentUserId = decoded.userId;
        } catch (e) {
          // ignore invalid token; treat as unauthenticated
        }
      }
    }

    if (currentUserId) {
      const mem = await pgPool.query('SELECT role FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, currentUserId]);
      const pending = await pgPool.query("SELECT 1 FROM group_join_requests WHERE group_id=$1 AND user_id=$2 AND status='pending'", [groupId, currentUserId]);
      extra.is_member = mem.rows.length > 0;
      extra.has_pending_request = pending.rows.length > 0;
      if (mem.rows.length) extra.my_role = mem.rows[0].role;
    }

    res.status(200).json({ group: gRes.rows[0], members: membersRes.rows, ...extra });
  } catch (err) {
    console.error('Error fetching group:', err);
    res.status(500).json({ error: 'Server error fetching group', detail: err.message });
  }
};

// Join a group (authenticated)
exports.joinGroup = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    const g = await pgPool.query('SELECT id, privacy, created_by FROM groups WHERE id=$1', [groupId]);
    if (!g.rows.length) return res.status(404).json({ error: 'Group not found' });

    const privacy = g.rows[0].privacy;

    const already = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, userId]);
    if (already.rows.length) return res.status(400).json({ error: 'Already a member' });

    if (privacy === 1) {
      // private group -> create join request if not exists
      const existReq = await pgPool.query('SELECT 1 FROM group_join_requests WHERE group_id=$1 AND user_id=$2 AND status=$3', [groupId, userId, 'pending']);
      if (existReq.rows.length) return res.status(400).json({ error: 'Join request already pending' });
      const { message } = req.body || {};
      await pgPool.query('INSERT INTO group_join_requests (group_id, user_id, message, status, created_at) VALUES ($1,$2,$3,$4,NOW())', [groupId, userId, message || null, 'pending']);
      return res.status(200).json({ message: 'Join request sent' });
    }

    // public group
    await pgPool.query('INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES ($1,$2,$3,NOW())', [groupId, userId, 'member']);
    res.status(200).json({ message: 'Joined group' });
  } catch (err) {
    console.error('Error joining group:', err);
    res.status(500).json({ error: 'Server error joining group', detail: err.message });
  }
};

// Get join requests for a group (owner/admin only)
exports.listJoinRequests = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    const isOwner = gRes.rows[0].created_by === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized' });

    const reqs = await pgPool.query(
      `SELECT r.id, r.user_id, r.message, r.status, r.created_at, u.first_name, u.avatar
       FROM group_join_requests r JOIN users u ON r.user_id = u.id
       WHERE r.group_id = $1 AND r.status = 'pending' ORDER BY r.created_at ASC`,
      [groupId]
    );

    res.status(200).json({ requests: reqs.rows });
  } catch (err) {
    console.error('Error listing join requests:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Approve a join request (owner/admin)
exports.approveRequest = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const requestId = parseInt(req.params.reqId, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId) || Number.isNaN(requestId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    const isOwner = gRes.rows[0].created_by === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized' });

    const r = await pgPool.query('SELECT id, user_id, status FROM group_join_requests WHERE id=$1 AND group_id=$2', [requestId, groupId]);
    if (!r.rows.length) return res.status(404).json({ error: 'Request not found' });
    if (r.rows[0].status !== 'pending') return res.status(400).json({ error: 'Request not pending' });

    const memberUserId = r.rows[0].user_id;
    // add to members
    await pgPool.query('INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES ($1,$2,$3,NOW())', [groupId, memberUserId, 'member']);
    // update request
    await pgPool.query("UPDATE group_join_requests SET status='approved' WHERE id=$1", [requestId]);

    res.status(200).json({ message: 'Request approved' });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Reject a join request (owner/admin)
exports.rejectRequest = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const requestId = parseInt(req.params.reqId, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId) || Number.isNaN(requestId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    const isOwner = gRes.rows[0].created_by === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized' });

    const r = await pgPool.query('SELECT id, status FROM group_join_requests WHERE id=$1 AND group_id=$2', [requestId, groupId]);
    if (!r.rows.length) return res.status(404).json({ error: 'Request not found' });
    if (r.rows[0].status !== 'pending') return res.status(400).json({ error: 'Request not pending' });

    await pgPool.query("UPDATE group_join_requests SET status='rejected' WHERE id=$1", [requestId]);
    res.status(200).json({ message: 'Request rejected' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// List groups for current user (created or member)
exports.listMyGroups = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await pgPool.query(
      `SELECT g.id, g.name, g.description, g.created_by, g.privacy, g.created_at,
        COALESCE(m.count,0) AS member_count,
        u.first_name AS owner_name
       FROM groups g
       LEFT JOIN (
         SELECT group_id, COUNT(*) AS count FROM group_members GROUP BY group_id
       ) m ON g.id = m.group_id
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.created_by = $1 OR g.id IN (SELECT group_id FROM group_members WHERE user_id = $1)
       ORDER BY g.created_at DESC;`,
      [userId]
    );

    res.status(200).json({ groups: result.rows });
  } catch (err) {
    console.error('Error listing my groups:', err);
    res.status(500).json({ error: 'Server error listing my groups', detail: err.message });
  }
};

// Leave a group (authenticated)
exports.leaveGroup = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    await pgPool.query('DELETE FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, userId]);
    res.status(200).json({ message: 'Left group' });
  } catch (err) {
    console.error('Error leaving group:', err);
    res.status(500).json({ error: 'Server error leaving group', detail: err.message });
  }
};

// Update group (only owner)
exports.updateGroup = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;
  const { name, description, privacy, post_moderation } = req.body || {};

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    const isOwner = gRes.rows[0].created_by === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized to update group' });

    // preserve existing values when null/undefined
    const existing = await pgPool.query('SELECT name, description, privacy, post_moderation FROM groups WHERE id=$1', [groupId]);
    const cur = existing.rows[0];

    await pgPool.query(
      `UPDATE groups SET name=$1, description=$2, privacy=$3, post_moderation=$4 WHERE id=$5`,
      [name || cur.name, description ?? cur.description, privacy ?? cur.privacy, typeof post_moderation === 'boolean' ? post_moderation : cur.post_moderation, groupId]
    );

    res.status(200).json({ message: 'Group updated' });
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ error: 'Server error updating group', detail: err.message });
  }
};

// Delete a group (only owner)
exports.deleteGroup = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (gRes.rows[0].created_by !== userId) return res.status(403).json({ error: 'Only owner can delete group' });

    await pgPool.query('DELETE FROM groups WHERE id=$1', [groupId]);

    res.status(200).json({ message: 'Group deleted' });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: 'Server error deleting group', detail: err.message });
  }
};