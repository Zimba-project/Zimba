require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Replace 1 with an actual user ID from your local database
const token = jwt.sign({ type: 'verify_email', userId: 39 }, JWT_SECRET, { expiresIn: '1d' });

console.log('Verification token:', token);
console.log(`Verify URL: http://localhost:3001/api/auth/verify-email?token=${token}`);
