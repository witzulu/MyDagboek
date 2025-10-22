const express = require('express');
const router = express.Router();
const { getUsers, approveUser, deleteUser, updateUserProfile } = require('../controllers/userController');
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

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', [authMiddleware, adminMiddleware], deleteUser);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;
