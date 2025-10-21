const express = require('express');
const router = express.Router();
const { getLists, getListById, createList, updateList, deleteList } = require('../controllers/listController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/').get(authMiddleware, getLists).post(authMiddleware, createList);
router.route('/:id').get(authMiddleware, getListById).put(authMiddleware, updateList).delete(authMiddleware, deleteList);

module.exports = router;
