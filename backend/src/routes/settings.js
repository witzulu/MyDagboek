const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   GET api/settings
// @desc    Get site settings
// @access  Private/Admin
router.get('/', [authMiddleware, adminMiddleware], getSettings);

// @route   PUT api/settings
// @desc    Update site settings
// @access  Private/Admin
router.put('/', [authMiddleware, adminMiddleware], updateSettings);

module.exports = router;
