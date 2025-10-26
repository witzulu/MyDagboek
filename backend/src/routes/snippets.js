const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSnippets, getSnippetById, createSnippet, updateSnippet, deleteSnippet } = require('../controllers/snippetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSnippets).post(protect, createSnippet);
router.route('/:snippetId').get(protect, getSnippetById).put(protect, updateSnippet).delete(protect, deleteSnippet);

module.exports = router;
