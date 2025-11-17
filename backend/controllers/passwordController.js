const pgPool = require('../database/pg_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../lib/mailer');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const { rows } = await pgPool.query('SELECT id, first_name FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });

    const rToken = jwt.sign({ type: 'reset_password', userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    const isHttpFrontend = FRONTEND_URL && /^https?:\/\//i.test(FRONTEND_URL);
    const frontendResetLink = isHttpFrontend ? `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${rToken}` : null;
    const backendResetLink = `${BACKEND_URL.replace(/\/$/, '')}/api/auth/reset-password?token=${rToken}`;
    const primaryLink = frontendResetLink || backendResetLink;

    try {
      const html = `<p>Hi ${user.first_name || ''},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${primaryLink}" style="display:inline-block;padding:10px 16px;background:#ef4444;color:#fff;border-radius:6px;text-decoration:none">Reset password</a></p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>`;
      const text = `Reset your password: ${primaryLink}\n\nIf you didn't request this, ignore this message.`;
      await sendMail({ to: email, subject: 'Reset your Zimba password', html, text });
    } catch (e) {
      console.error('Error sending password reset email:', e);
    }

    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('requestPasswordReset error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

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

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    const isFormPost = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
    if (isFormPost) {
      const frontendLogin = FRONTEND_URL && /^https?:\/\//i.test(FRONTEND_URL) ? `${FRONTEND_URL.replace(/\/$/, '')}/login` : null;
      const page = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <title>Password reset</title>
            <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:24px;background:#f7fafc;color:#111} .card{max-width:720px;margin:48px auto;padding:24px;background:#fff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06)} a.button{display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none}</style>
          </head>
          <body>
            <div class="card">
              <h2>Password updated</h2>
              <p>Your password has been updated successfully. You can now sign in with your new password.</p>
              ${frontendLogin ? `<p><a class="button" href="${frontendLogin}">Open login page</a></p>` : ''}
              <p>If the app is installed, open it and sign in. You can now close this page.</p>
            </div>
          </body>
        </html>
      `;
      return res.status(200).send(page);
    }

    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('resetPassword error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPasswordForm = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send('Missing token');
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
