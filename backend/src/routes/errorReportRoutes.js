const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  createErrorReport,
  getErrorReports,
} = require('../controllers/errorReportController');

// Routes for /api/projects/:projectId/errors
router.route('/').get(protect, getErrorReports).post(protect, createErrorReport);

module.exports = router;
