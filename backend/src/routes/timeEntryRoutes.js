
const express = require('express');
const router = express.Router();
const { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry } = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTimeEntries)
  .post(protect, createTimeEntry);

router.route('/:id')
  .put(protect, updateTimeEntry)
  .delete(protect, deleteTimeEntry);

module.exports = router;
