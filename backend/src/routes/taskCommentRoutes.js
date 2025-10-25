const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/taskCommentController');

router.route('/')
  .post(protect, addComment);

router.route('/:commentId')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
