
const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProjectTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjectTasks);

module.exports = router;
