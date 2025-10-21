const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/').get(authMiddleware, getTasks).post(authMiddleware, createTask);
router.route('/:id').get(authMiddleware, getTaskById).put(authMiddleware, updateTask).delete(authMiddleware, deleteTask);

module.exports = router;
