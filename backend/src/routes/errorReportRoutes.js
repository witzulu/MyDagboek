const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  createErrorReport,
  getErrorReports,
  updateErrorReport,
} = require('../controllers/errorReportController');

// Routes for /api/projects/:projectId/errors
router.route('/').get(protect, getErrorReports).post(protect, createErrorReport);

// A separate router for non-nested error routes is needed
const singleErrorReportRouter = express.Router();
singleErrorReportRouter.route('/:id').put(protect, updateErrorReport);

module.exports = {
  projectErrorReports: router,
  errorReportRouter: singleErrorReportRouter,
};
