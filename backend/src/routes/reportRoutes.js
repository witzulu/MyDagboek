const express = require('express');
const router = express.Router();
const { getDashboardReport } = require('../controllers/progressReportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/dashboard').get(protect, getDashboardReport);

module.exports = router;
