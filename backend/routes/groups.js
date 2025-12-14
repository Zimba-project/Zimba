const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const auth = require('../middleware/authMiddleware');

// Public list
router.get('/', groupsController.listGroups);

// Create a group (auth required)
router.post('/', auth, groupsController.createGroup);

// Get single group
router.get('/:id', groupsController.getGroup);

// Join & leave
router.post('/:id/join', auth, groupsController.joinGroup);
router.post('/:id/leave', auth, groupsController.leaveGroup);

// Update group (owner only)
router.put('/:id', auth, groupsController.updateGroup);

module.exports = router;
