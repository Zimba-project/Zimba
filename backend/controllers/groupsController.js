const pgPool = require('../database/pg_connection');

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
      `SELECT g.id, g.name, g.description, g.created_by, g.privacy, g.created_at, u.first_name AS owner_name
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

    res.status(200).json({ group: gRes.rows[0], members: membersRes.rows });
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
    const exists = await pgPool.query('SELECT 1 FROM groups WHERE id=$1', [groupId]);
    if (!exists.rows.length) return res.status(404).json({ error: 'Group not found' });

    const already = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2', [groupId, userId]);
    if (already.rows.length) return res.status(400).json({ error: 'Already a member' });

    await pgPool.query('INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES ($1,$2,$3,NOW())', [groupId, userId, 'member']);
    res.status(200).json({ message: 'Joined group' });
  } catch (err) {
    console.error('Error joining group:', err);
    res.status(500).json({ error: 'Server error joining group', detail: err.message });
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
  const { name, description, privacy } = req.body || {};

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId)) return res.status(400).json({ error: 'Invalid group id' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (gRes.rows[0].created_by !== userId) return res.status(403).json({ error: 'Only owner can update group' });

    await pgPool.query(
      `UPDATE groups SET name=$1, description=$2, privacy=$3 WHERE id=$4`,
      [name || gRes.rows[0].name, description || null, privacy ?? 0, groupId]
    );

    res.status(200).json({ message: 'Group updated' });
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ error: 'Server error updating group', detail: err.message });
  }
};
