const pgPool = require('../database/pg_connection');

// Remove a member from a group (owner or admin only)
exports.removeMember = async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const memberId = parseInt(req.params.memberId, 10);
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (Number.isNaN(groupId) || Number.isNaN(memberId)) return res.status(400).json({ error: 'Invalid ids' });

  try {
    const gRes = await pgPool.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!gRes.rows.length) return res.status(404).json({ error: 'Group not found' });

    const ownerId = gRes.rows[0].created_by;

    // owner can remove anyone except themselves; admins can remove members (not owner)
    const isOwner = ownerId === userId;
    const isAdminRes = await pgPool.query('SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ($3,$4)', [groupId, userId, 'owner', 'admin']);
    if (!isOwner && !isAdminRes.rows.length) return res.status(403).json({ error: 'Not authorized' });

    // Prevent removing the owner
    if (memberId === ownerId) return res.status(400).json({ error: 'Cannot remove group owner' });

    // Perform deletion
    const delRes = await pgPool.query('DELETE FROM group_members WHERE group_id=$1 AND user_id=$2 RETURNING *', [groupId, memberId]);
    if (!delRes.rows.length) return res.status(404).json({ error: 'Member not found in group' });

    res.status(200).json({ message: 'Member removed' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Server error removing member', detail: err.message });
  }
};

// Future: add promote/demote endpoints here