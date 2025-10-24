const express = require('express');
const router = express.Router();
const {
  createList,
  updateList,
  deleteList,
  reorderLists,
} = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:listId').put(protect, updateList).delete(protect, deleteList);

module.exports = router;
