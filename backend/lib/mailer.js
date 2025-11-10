const nodemailer = require('nodemailer');

// Configure transporter using ENV variables
// Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

async function sendMail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error('SMTP_FROM or SMTP_USER must be set in env');
  const info = await transporter.sendMail({ from, to, subject, html, text });
  return info;
}

module.exports = { sendMail };
