const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Unified route
router.get('/', postController.getAllPosts);

// Optional separate ones (if you still want to call them directly)
router.get('/polls', postController.getPolls);
router.get('/discussions', postController.getDiscussions);

// Create new post
router.post('/', postController.createPost);

module.exports = router;
