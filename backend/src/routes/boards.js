const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable mergeParams
const { getBoards, getBoardById, createBoard, updateBoard, deleteBoard } = require('../controllers/boardController');
const protect = require('../middleware/authMiddleware');

router.route('/').get(protect, getBoards).post(protect, createBoard);
router.route('/:id').get(protect, getBoardById).put(protect, updateBoard).delete(protect, deleteBoard);

module.exports = router;
