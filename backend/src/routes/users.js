const express = require('express');
const router = express.Router();
const { getUsers, approveUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', [authMiddleware, adminMiddleware], getUsers);

// @route   PUT api/users/:id/approve
// @desc    Approve a user
// @access  Private/Admin
router.put('/:id/approve', [authMiddleware, adminMiddleware], approveUser);

module.exports = router;
