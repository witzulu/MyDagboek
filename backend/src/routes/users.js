const express = require('express');
const router = express.Router();
const { getUsers, approveUser, blockUser, unblockUser, updateUserProfile, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// @route   PUT api/users/:id/role
// @desc    Update a user's role
// @access  Private/Admin
router.put('/:id/role', [protect, admin], updateUserRole);

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', [protect, admin], getUsers);

// @route   PUT api/users/:id/approve
// @desc    Approve a user
// @access  Private/Admin
router.put('/:id/approve', [protect, admin], approveUser);

// @route   PUT api/users/:id/block
// @desc    Block a user
// @access  Private/Admin
router.put('/:id/block', [protect, admin], blockUser);

// @route   PUT api/users/:id/unblock
// @desc    Unblock a user
// @access  Private/Admin
router.put('/:id/unblock', [protect, admin], unblockUser);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

module.exports = router;
