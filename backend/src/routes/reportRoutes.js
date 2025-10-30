const express = require('express');
const router = express.Router();
const { getReportDashboard } = require('../controllers/progressReportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getReportDashboard);

module.exports = router;
