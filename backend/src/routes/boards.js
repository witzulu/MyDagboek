const express = require('express');
const { getBoards, createBoard, getBoardById, updateBoard, deleteBoard } = require('../controllers/boardController');
const authMiddleware = require('../middleware/authMiddleware');

// This router handles routes nested under /api/projects/:projectId/boards
const projectBoardsRouter = express.Router({ mergeParams: true });

projectBoardsRouter.route('/')
  .get(authMiddleware, getBoards)
  .post(authMiddleware, createBoard);

// This router handles direct routes like /api/boards/:id
const boardRouter = express.Router();

boardRouter.route('/:id')
  .get(authMiddleware, getBoardById)
  .put(authMiddleware, updateBoard)
  .delete(authMiddleware, deleteBoard);

module.exports = { projectBoardsRouter, boardRouter };
