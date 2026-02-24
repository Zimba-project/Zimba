const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);

router.get('/:id/options', postController.getPollOptions);
router.get('/:id/questions', postController.getPollQuestions);
router.post('/:id/vote', postController.votePoll);

router.get('/:id/comments', postController.getPostComments);
router.post('/:id/comments', postController.addPostComment);

// Replies to comments
router.post('/:id/comments/:commentId/replies', postController.addCommentReply);

module.exports = router;
