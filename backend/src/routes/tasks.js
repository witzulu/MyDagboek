const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask, moveTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Note: getTasks and getTaskById are not implemented yet
router.route('/').get(protect, getTasks).post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/move').put(protect, moveTask);

module.exports = router;
