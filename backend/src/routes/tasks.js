const express = require('express');
const router = express.Router({ mergeParams: true });
const { createTask, updateTask, deleteTask } = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');

router.route('/').post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
