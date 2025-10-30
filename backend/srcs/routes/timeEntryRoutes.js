
const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProjectTimeEntries, createTimeEntry } = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjectTimeEntries)
  .post(protect, createTimeEntry);

module.exports = router;
