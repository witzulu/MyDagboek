
const express = require('express');
const {
    getProjectTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry
} = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

// Router for /api/projects/:projectId/time-entries
const projectTimeEntriesRouter = express.Router({ mergeParams: true });

projectTimeEntriesRouter.route('/')
  .get(protect, getProjectTimeEntries)
  .post(protect, createTimeEntry);

// Router for /api/time-entries
const timeEntryRouter = express.Router();

timeEntryRouter.route('/:id')
    .put(protect, updateTimeEntry)
    .delete(protect, deleteTimeEntry);

module.exports = { projectTimeEntriesRouter, timeEntryRouter };
