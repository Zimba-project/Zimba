const pgPool = require('../database/pg_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../lib/mailer');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, birthdate, password, confirmPassword, about } = req.body;

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'Missing required fields.' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match.' });

    const { rows: existingPhone } = await pgPool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingPhone.length > 0)
      return res.status(409).json({ message: 'Phone number already registered.' });

    const { rows: existingEmail } = await pgPool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.length > 0)
      return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, birthdate, hashed_password, phone, about)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, first_name, last_name, email, phone, birthdate, about, verified, created_at;
    `;
    const values = [firstName, lastName, email || null, birthdate || null, hashed, phone, about || null];
    const { rows } = await pgPool.query(insertQuery, values);
    const user = rows[0];

    if (user.email) {
      const vToken = jwt.sign({ type: 'verify_email', userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
      const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${vToken}`;
      try {
        const html = `<p>Hi ${user.first_name || ''},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify email</a></p>`;
        await sendMail({ to: user.email, subject: 'Verify your Zimba account', html, text: `Verify your account: ${verifyUrl}` });
      } catch (e) {
        console.error('Error sending verification email:', e);
      }
    }

    res.status(201).json({ user, message: 'Account created. Please verify your email if provided.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    let { identifier, password } = req.body;
    if (!identifier && req.body.phone) identifier = req.body.phone;
    if (!identifier && req.body.email) identifier = req.body.email;
    if (!identifier || !password)
      return res.status(400).json({ message: 'Missing identifier or password' });

    let rows;
    if (identifier.includes('@')) {
      rows = await pgPool.query('SELECT * FROM users WHERE email = $1', [identifier]);
    } else {
      rows = await pgPool.query('SELECT * FROM users WHERE phone = $1', [identifier]);
    }
    const user = rows.rows ? rows.rows[0] : rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.email && !user.verified) {
      return res.status(403).json({ message: 'Email not verified. Please check your email for verification link.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    delete user.hashed_password;

    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send('Missing token');
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.error('Invalid/expired email verification token', e);
      return res.status(400).send('Invalid or expired token');
    }
    if (!payload || payload.type !== 'verify_email' || !payload.userId) return res.status(400).send('Invalid token');

    const userId = payload.userId;
    await pgPool.query('UPDATE users SET verified = true WHERE id = $1', [userId]);

    const frontendLink = FRONTEND_URL ? `${FRONTEND_URL.replace(/\/$/, '')}/login?verified=1` : null;
    const page = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Email verified</title>
          <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;margin:0;padding:24px;background:#f7fafc;color:#111} .card{max-width:720px;margin:48px auto;padding:24px;background:#fff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06)} a.button{display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none}</style>
        </head>
        <body>
          <div class="card">
            <h2>Email verified</h2>
            <p>Thanks — we verified your email address successfully. You can now return to the app and sign in.</p>
            ${frontendLink ? `<p><a class="button" href="${frontendLink}">Open login page</a></p>` : ''}
            <p>If the login link doesn't work, open your app and sign in with your phone and password.</p>
          </div>
        </body>
      </html>
    `;

    return res.status(200).send(page);
  } catch (err) {
    console.error('verifyEmail error:', err);
    return res.status(500).send('Server error');
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const { rows } = await pgPool.query('SELECT id, first_name, verified FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verified) return res.status(400).json({ message: 'Email already verified' });

    const vToken = jwt.sign({ type: 'verify_email', userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${vToken}`;
    try {
      const html = `<p>Hi ${user.first_name || ''},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify email</a></p>`;
      await sendMail({ to: email, subject: 'Verify your Zimba account', html, text: `Verify your account: ${verifyUrl}` });
    } catch (e) {
      console.error('Error sending verification email (resend):', e);
    }
    return res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('resendVerification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

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
