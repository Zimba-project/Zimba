const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const groupMembersController = require('../controllers/groupMembersController');
const groupPostController = require('../controllers/groupPostController');
const auth = require('../middleware/authMiddleware');

// Public list
router.get('/', groupsController.listGroups);

// Create a group (auth required)
router.post('/', auth, groupsController.createGroup);
// List my groups (auth)
router.get('/mine', auth, groupsController.listMyGroups);

// Join request management (auth)
router.get('/:id/requests', auth, groupsController.listJoinRequests);
router.post('/:id/requests/:reqId/approve', auth, groupsController.approveRequest);
router.post('/:id/requests/:reqId/reject', auth, groupsController.rejectRequest);

// Member management (owner/admin)
router.delete('/:id/members/:memberId', auth, groupMembersController.removeMember);

// Group posts
router.get('/:id/posts', groupPostController.listPosts);
router.post('/:id/posts', auth, groupPostController.createPost);
router.get('/:id/posts/:postId', groupPostController.getPost);
// poll options, votes and comments
router.get('/:id/posts/:postId/options', groupPostController.getOptions);
router.post('/:id/posts/:postId/vote', auth, groupPostController.vote);
router.get('/:id/posts/:postId/comments', groupPostController.listComments);
router.post('/:id/posts/:postId/comments', auth, groupPostController.addComment);
router.post('/:id/posts/:postId/approve', auth, groupPostController.approvePost);
router.post('/:id/posts/:postId/reject', auth, groupPostController.rejectPost);

// Join & leave
router.post('/:id/join', auth, groupsController.joinGroup);
router.post('/:id/leave', auth, groupsController.leaveGroup);

// Update group (owner only)
router.put('/:id', auth, groupsController.updateGroup);

// Delete group (owner only)
router.delete('/:id', auth, groupsController.deleteGroup);

// Get single group (should be last to avoid catching other static routes)
router.get('/:id', groupsController.getGroup);

module.exports = router;
