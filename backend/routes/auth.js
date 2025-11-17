// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
	register,
	login,
	me,
	verifyEmail,
	resendVerification,
	deleteAccount,
	googleCodeLogin,
	requestPasswordReset,
	resetPassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/delete', authMiddleware, deleteAccount);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/reset-password', require('../controllers/authController').resetPasswordForm);

module.exports = router;