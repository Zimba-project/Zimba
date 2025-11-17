// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, me, verifyEmail, resendVerification } = require('../controllers/authController');
const { deleteAccount, googleCodeLogin } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/delete', authMiddleware, deleteAccount);

module.exports = router;