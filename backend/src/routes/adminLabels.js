const express = require('express');
const router = express.Router();
const {
  getUniversalLabels,
  createUniversalLabel,
  updateUniversalLabel,
  deleteUniversalLabel,
} = require('../controllers/adminLabelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getUniversalLabels)
  .post(protect, admin, createUniversalLabel);

router.route('/:id')
  .put(protect, admin, updateUniversalLabel)
  .delete(protect, admin, deleteUniversalLabel);

module.exports = router;
