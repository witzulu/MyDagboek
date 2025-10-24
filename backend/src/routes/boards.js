const express = require('express');
const { getBoards, createBoard, getBoardById, updateBoard, deleteBoard } = require('../controllers/boardController');
const { createList, reorderLists } = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

// This router handles routes nested under /api/projects/:projectId/boards
const projectBoardsRouter = express.Router({ mergeParams: true });

projectBoardsRouter.route('/')
  .get(protect, getBoards)
  .post(protect, createBoard);

// This router handles direct routes like /api/boards/:id
const boardRouter = express.Router();

boardRouter.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

// Nested routes for lists within a specific board
boardRouter.route('/:boardId/lists')
  .post(protect, createList);

boardRouter.route('/:boardId/lists/reorder')
    .put(protect, reorderLists);

module.exports = { projectBoardsRouter, boardRouter };
