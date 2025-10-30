const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask, moveTask, completeTask, updateTaskPriority } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Note: getTasks and getTaskById are not implemented yet
router.route('/').get(protect, getTasks).post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/move').put(protect, moveTask);
router.route('/:id/complete').put(protect, completeTask);
router.route('/:id/priority').put(protect, updateTaskPriority);

module.exports = router;
