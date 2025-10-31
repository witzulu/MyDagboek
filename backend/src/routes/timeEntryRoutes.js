
const express = require('express');
const {
    getProjectTimeEntries,
    createTimeEntry,
    getTimeEntrySummary,
    updateTimeEntry,
    deleteTimeEntry
} = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

// Router for /api/projects/:projectId/time-entries
const projectTimeEntriesRouter = express.Router({ mergeParams: true });

projectTimeEntriesRouter.route('/')
  .get(protect, getProjectTimeEntries)
  .post(protect, createTimeEntry);

projectTimeEntriesRouter.route('/summary')
    .get(protect, getTimeEntrySummary);

// Router for /api/time-entries
const timeEntryRouter = express.Router();

timeEntryRouter.route('/:id')
    .put(protect, updateTimeEntry)
    .delete(protect, deleteTimeEntry);

module.exports = { projectTimeEntriesRouter, timeEntryRouter };
