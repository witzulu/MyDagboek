const express = require('express');
const router = express.Router();
const { getTaskById, createTask, updateTask, deleteTask, moveTask, completeTask, updateTaskPriority } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/move').put(protect, moveTask);
router.route('/:id/complete').put(protect, completeTask);
router.route('/:id/priority').put(protect, updateTaskPriority);

module.exports = router;
