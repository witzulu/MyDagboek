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
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

router.route('/:id')
  .get(protect, getNoteById)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

const noteRouter = express.Router();

noteRouter.post('/upload', protect, uploadImage, handleImageUpload);

noteRouter.route('/:id')
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = { projectNotesRouter: router, noteRouter };
