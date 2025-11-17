// backend/controllers/authController.js
const pgPool = require('../database/pg_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const { sendMail } = require('../lib/mailer');

const FRONTEND_URL = process.env.FRONTEND_URL 
const BACKEND_URL = process.env.BACKEND_URL 

// ---------- REGISTER ----------
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, birthdate, password, confirmPassword, about } = req.body;

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'Missing required fields.' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match.' });

    // ensure phone unique and optionally email unique
    const { rows: existingPhone } = await pgPool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingPhone.length > 0)
      return res.status(409).json({ message: 'Phone number already registered.' });

    // email is required and must be unique
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

    // generate email verification token and send verification email if email provided
    if (user.email) {
      const vToken = jwt.sign({ type: 'verify_email', userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
      const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${vToken}`;
      try {
        const html = `<p>Hi ${user.first_name || ''},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify email</a></p>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${verifyUrl}</p>
        `;
        await sendMail({ to: user.email, subject: 'Verify your Zimba account', html, text: `Verify your account: ${verifyUrl}` });
      } catch (e) {
        console.error('Error sending verification email:', e);
        // don't fail registration because email failed to send; inform client
      }
    }

    // Do not auto-login on register. Return user record and instruct to verify email.
    res.status(201).json({ user, message: 'Account created. Please verify your email if provided.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    // allow identifier to be either email or phone
    // also accept legacy 'phone' key for compatibility
    let { identifier, password } = req.body;
    // fallback to phone or email if client still sends those fields
    if (!identifier && req.body.phone) identifier = req.body.phone;
    if (!identifier && req.body.email) identifier = req.body.email;
    if (!identifier || !password)
      return res.status(400).json({ message: 'Missing identifier or password' });

    console.log('Login attempt, identifier:', identifier);
    let rows;
    if (identifier.includes('@')) {
      rows = await pgPool.query('SELECT * FROM users WHERE email = $1', [identifier]);
    } else {
      rows = await pgPool.query('SELECT * FROM users WHERE phone = $1', [identifier]);
    }
    console.log('DB lookup rows count:', rows.rows ? rows.rows.length : 0);
    const user = rows.rows ? rows.rows[0] : rows[0];
    if (user) console.log('Found user id:', user.id, 'email:', user.email, 'phone:', user.phone, 'verified:', user.verified);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.hashed_password);
  console.log('bcrypt.compare result:', valid);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    // If user provided email, require verification before allowing login
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

// ---------- VERIFY EMAIL ----------
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

    // redirect user to frontend login page with success flag
    // Serve a simple confirmation page so the user sees a confirmation even if FRONTEND_URL is not reachable
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

// ---------- RESEND VERIFICATION ----------
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
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify email</a></p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${verifyUrl}</p>
      `;
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

// ---------- DELETE ACCOUNT ----------
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

    // Delete user and related data as appropriate. Here we remove the user row.
    await pgPool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('deleteAccount error', err);
    return res.status(500).json({ message: 'Failed to delete account' });
  }
};

// ---------- REQUEST PASSWORD RESET ----------
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const { rows } = await pgPool.query('SELECT id, first_name FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });

    // create reset token
    const rToken = jwt.sign({ type: 'reset_password', userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Prefer an HTTP(S) frontend URL (so email clients can open it). If FRONTEND_URL is a custom scheme (e.g. exp://),
    // fall back to BACKEND_URL which serves a simple HTML reset form.
    const isHttpFrontend = FRONTEND_URL && /^https?:\/\//i.test(FRONTEND_URL);
    const frontendResetLink = isHttpFrontend ? `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${rToken}` : null;
    const backendResetLink = `${BACKEND_URL.replace(/\/$/, '')}/api/auth/reset-password?token=${rToken}`;
    const primaryLink = frontendResetLink || backendResetLink;

    try {
      const html = `<p>Hi ${user.first_name || ''},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${primaryLink}" style="display:inline-block;padding:10px 16px;background:#ef4444;color:#fff;border-radius:6px;text-decoration:none">Reset password</a></p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>If the button doesn't work, copy and paste one of these URLs into your browser (the first is preferred):</p>
        <p>${frontendResetLink ? frontendResetLink : '<em>(no web frontend configured)</em>'}</p>
        <p>${backendResetLink}</p>`;
      const text = `Reset your password:\n\n${primaryLink}\n\nIf you didn't request this, ignore this message.`;
      await sendMail({ to: email, subject: 'Reset your Zimba password', html, text });
    } catch (e) {
      console.error('Error sending password reset email:', e);
      // don't fail the request in case of mail problems
    }

    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('requestPasswordReset error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- RESET PASSWORD ----------
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    if (!newPassword || !confirmPassword) return res.status(400).json({ message: 'New password and confirmation required' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.error('Invalid/expired reset token', e);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (!payload || payload.type !== 'reset_password' || !payload.userId) return res.status(400).json({ message: 'Invalid token' });

    const userId = payload.userId;
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pgPool.query('UPDATE users SET hashed_password = $1 WHERE id = $2', [hashed, userId]);

    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('resetPassword error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- RESET PASSWORD FORM (GET) ----------
exports.resetPasswordForm = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send('Missing token');
    // Serve a minimal HTML form that posts to POST /api/auth/reset-password
    const page = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Reset password</title>
          <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px;background:#f7fafc;color:#111} .card{max-width:720px;margin:48px auto;padding:24px;background:#fff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06)} input{width:100%;padding:10px;margin:8px 0;border:1px solid #e5e7eb;border-radius:6px} button{background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;border:0} .danger{background:#ef4444}</style>
        </head>
        <body>
          <div class="card">
            <h2>Reset password</h2>
            <p>Enter a new password for your account.</p>
            <form method="POST" action="/api/auth/reset-password">
              <input type="hidden" name="token" value="${token}" />
              <label>New password</label>
              <input name="newPassword" type="password" required />
              <label>Confirm password</label>
              <input name="confirmPassword" type="password" required />
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
                <button type="button" onclick="history.back()">Cancel</button>
                <button type="submit" class="danger">Reset password</button>
              </div>
            </form>
          </div>
        </body>
      </html>
    `;
    res.status(200).send(page);
  } catch (err) {
    console.error('resetPasswordForm error', err);
    res.status(500).send('Server error');
  }
};

