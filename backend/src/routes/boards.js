const express = require('express');
const router = express.Router();
const { getBoards, getBoardById, createBoard, updateBoard, deleteBoard } = require('../controllers/boardController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/').get(authMiddleware, getBoards).post(authMiddleware, createBoard);
router.route('/:id').get(authMiddleware, getBoardById).put(authMiddleware, updateBoard).delete(authMiddleware, deleteBoard);

module.exports = router;
