const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} = require('../controllers/taskChecklistController');

router.route('/')
  .post(protect, addChecklistItem);

router.route('/:itemId')
  .put(protect, updateChecklistItem)
  .delete(protect, deleteChecklistItem);

module.exports = router;
