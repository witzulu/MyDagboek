const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getSettings, updateSettings, uploadLogo } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'logo' + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// @route   GET api/settings
// @desc    Get site settings
// @access  Private/Admin
router.get('/', getSettings);

// @route   PUT api/settings
// @desc    Update site settings
// @access  Private/Admin
router.put('/', [authMiddleware, adminMiddleware], updateSettings);

// @route   POST api/settings/upload-logo
// @desc    Upload site logo
// @access  Private/Admin
router.post('/upload-logo', [authMiddleware, adminMiddleware, upload.single('logo')], uploadLogo);

module.exports = router;
