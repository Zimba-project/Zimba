const pgPool = require('../database/pg_connection');
const bcrypt = require('bcrypt');

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });

    const { rows } = await pgPool.query('SELECT id, hashed_password FROM users WHERE id = $1', [userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) return res.status(403).json({ message: 'Invalid password' });

    await pgPool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('deleteAccount error', err);
    return res.status(500).json({ message: 'Failed to delete account' });
  }
};
