// backend/controllers/authController.js
const pgPool = require('../database/pg_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ---------- REGISTER ----------
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, birthdate, password, confirmPassword, about } = req.body;

    if (!firstName || !lastName || !phone || !password || !confirmPassword)
      return res.status(400).json({ message: 'Missing required fields.' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match.' });

    // ensure phone unique and optionally email unique
    const { rows: existingPhone } = await pgPool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingPhone.length > 0)
      return res.status(409).json({ message: 'Phone number already registered.' });

    if (email) {
      const { rows: existingEmail } = await pgPool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingEmail.length > 0)
        return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, birthdate, hashed_password, phone, about)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, first_name, last_name, email, phone, birthdate, about, verified, created_at;
    `;
    const values = [firstName, lastName, email || null, birthdate || null, hashed, phone, about || null];
    const { rows } = await pgPool.query(insertQuery, values);
    const user = rows[0];

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: 'Missing phone or password' });

    const { rows } = await pgPool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    delete user.hashed_password;

    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- ME ----------
exports.me = async (req, res) => {
  try {
    const userId = req.userId;
    const { rows } = await pgPool.query(
      'SELECT id, first_name, last_name, email, phone, birthdate, about, verified, created_at FROM users WHERE id = $1',
      [userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
