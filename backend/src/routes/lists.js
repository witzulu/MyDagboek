const express = require('express');
const router = express.Router({ mergeParams: true });
const { createList, updateList, deleteList } = require('../controllers/listController');
const protect = require('../middleware/authMiddleware');
const taskRouter = require('./tasks');

router.use('/:listId/tasks', taskRouter);

router.route('/').post(protect, createList);
router.route('/:id').put(protect, updateList).delete(protect, deleteList);

module.exports = router;
