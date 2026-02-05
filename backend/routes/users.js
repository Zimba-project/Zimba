const express = require('express');
const router = express.Router();
const { getUserById } = require('../controllers/authController');

router.get('/:userId', getUserById);

module.exports = router;
