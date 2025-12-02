const pgPool = require('../database/pg_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../lib/mailer');

// ENV
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BACKEND_URL = process.env.BACKEND_URL;

// ---------------- REGISTER -----------------
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, birthdate, password, confirmPassword, about } = req.body;

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "Missing required fields" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    // Check duplicates
    const existingPhone = await pgPool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existingPhone.rows.length > 0)
      return res.status(409).json({ message: "Phone number already registered" });

    const existingEmail = await pgPool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingEmail.rows.length > 0)
      return res.status(409).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, phone, birthdate, hashed_password, about, verified)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, first_name, last_name, email, phone, birthdate, about, verified, created_at;
    `;

    const userResult = await pgPool.query(insertQuery, [
      firstName,
      lastName,
      email,
      phone,
      birthdate || null,
      hashedPassword,
      about || null,
      false
    ]);

    const user = userResult.rows[0];

    // Create verification token
    const vToken = jwt.sign({ type: 'verify_email', userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${vToken}`;

    // Send verification email
    try {
      await sendMail({
        to: email,
        subject: "Verify your Zimba account",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Verify Your Email</title>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #2563eb; }
                p { color: #333; font-size: 16px; line-height: 1.5; }
                a.button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                a.button:hover { background-color: #1e4bb8; }
                .footer { margin-top: 30px; font-size: 12px; color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Welcome to Zimba, ${firstName}!</h1>
                <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
                <a class="button" href="${verifyUrl}">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                <p class="footer">If you did not sign up for a Zimba account, please ignore this email.</p>
              </div>
            </body>
          </html>
          `
      });
    } catch (e) {
      console.log("Email send error:", e);
    }

    res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
      user
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- LOGIN -----------------
exports.login = async (req, res) => {
  try {
    let { identifier, password } = req.body;

    // Accept phone or email directly
    if (!identifier && req.body.phone) identifier = req.body.phone;
    if (!identifier && req.body.email) identifier = req.body.email;

    if (!identifier || !password)
      return res.status(400).json({ message: "Missing identifier or password" });

    let userQuery;
    if (identifier.includes("@")) {
      userQuery = pgPool.query("SELECT * FROM users WHERE email = $1", [identifier]);
    } else {
      userQuery = pgPool.query("SELECT * FROM users WHERE phone = $1", [identifier]);
    }

    const result = await userQuery;
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.verified) {
      return res.status(403).json({ message: "Email not verified. Check your inbox." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    delete user.hashed_password;

    res.json({ user, token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- VERIFY EMAIL -----------------
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send("Missing token");

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).send("Invalid or expired token");
    }

    if (payload.type !== "verify_email")
      return res.status(400).send("Invalid token");

    await pgPool.query("UPDATE users SET verified = true WHERE id = $1", [
      payload.userId
    ]);

    return res.send( `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 60px auto; background: #fff; border-radius: 10px; padding: 40px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); text-align: center; }
            h2 { color: #22c55e; }
            p { font-size: 16px; color: #333; line-height: 1.5; }
            a.button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            a.button:hover { background-color: #1e4bb8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Email Verified 🎉</h2>
            <p>Your email has been successfully verified.</p>
            <p>You can now return to the app and log in with your credentials.</p>
          </div>
        </body>
      </html>
      `);

  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).send("Server error");
  }
};

// ---------------- RESEND VERIFICATION -----------------
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const { rows } = await pgPool.query("SELECT id, first_name, verified FROM users WHERE email = $1", [email]);
    const user = rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "Email already verified" });

    const vToken = jwt.sign(
      { type: "verify_email", userId: user.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${vToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your Zimba account",
      html: `
        <p>Hello ${user.first_name},</p>
        <p>Please verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `
    });

    res.json({ message: "Verification email sent" });

  } catch (err) {
    console.error("resendVerification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- ME -----------------
exports.me = async (req, res) => {
  try {
    const { rows } = await pgPool.query(
      "SELECT id, first_name, last_name, email, phone, birthdate, about, verified, avatar FROM users WHERE id = $1",
      [req.userId]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });

  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
