const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
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
