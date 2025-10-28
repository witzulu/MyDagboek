const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProgressReport } = require('../controllers/progressReportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProgressReport);

module.exports = router;
