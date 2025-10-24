const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  uploadImage,
  handleImageUpload
} = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/')
  .get(authMiddleware, getNotes)
  .post(authMiddleware, createNote);

router.route('/:id')
  .get(authMiddleware, getNoteById)
  .put(authMiddleware, updateNote)
  .delete(authMiddleware, deleteNote);

const noteRouter = express.Router();

noteRouter.post('/upload', authMiddleware, uploadImage, handleImageUpload);

noteRouter.route('/:id')
    .put(authMiddleware, updateNote)
    .delete(authMiddleware, deleteNote);

module.exports = { projectNotesRouter: router, noteRouter };
