const express = require('express');
const {
  getChangeLogEntries,
  createChangeLogEntry,
  updateChangeLogEntry,
  deleteChangeLogEntry,
  toggleIncludeInReport,
} = require('../controllers/changeLogController');
const { protect } = require('../middleware/authMiddleware');

// Router for /api/projects/:projectId/changelog
const projectChangeLogRouter = express.Router({ mergeParams: true });
projectChangeLogRouter.route('/')
  .get(protect, getChangeLogEntries)
  .post(protect, createChangeLogEntry);

// Router for /api/changelog
const changeLogRouter = express.Router();
changeLogRouter.route('/:id')
    .put(protect, updateChangeLogEntry)
    .delete(protect, deleteChangeLogEntry);
changeLogRouter.route('/:id/toggle-report').put(protect, toggleIncludeInReport);


module.exports = { projectChangeLogRouter, changeLogRouter };
