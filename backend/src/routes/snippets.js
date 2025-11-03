const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSnippets, getSnippetById, createSnippet, updateSnippet, deleteSnippet, getProjectTags, deleteMultipleSnippets } = require('../controllers/snippetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSnippets).post(protect, createSnippet).delete(protect, deleteMultipleSnippets);
router.route('/tags').get(protect, getProjectTags);
router.route('/:snippetId').get(protect, getSnippetById).put(protect, updateSnippet).delete(protect, deleteSnippet);

module.exports = router;
