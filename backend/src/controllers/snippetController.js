// backend/src/controllers/snippetController.js
const asyncHandler = require('express-async-handler');

// @desc Get all snippets
// @route GET /api/projects/:projectId/snippets
// @access Private
const getSnippets = asyncHandler(async (req, res) => {
  res.json({ message: 'Get all snippets' });
});

// @desc Get single snippet
// @route GET /api/projects/:projectId/snippets/:snippetId
// @access Private
const getSnippetById = asyncHandler(async (req, res) => {
  res.json({ message: `Get snippet ${req.params.snippetId}` });
});

// @desc Create new snippet
// @route POST /api/projects/:projectId/snippets
// @access Private
const createSnippet = asyncHandler(async (req, res) => {
  res.json({ message: 'Create snippet' });
});

// @desc Update snippet
// @route PUT /api/projects/:projectId/snippets/:snippetId
// @access Private
const updateSnippet = asyncHandler(async (req, res) => {
  res.json({ message: `Update snippet ${req.params.snippetId}` });
});

// @desc Delete snippet
// @route DELETE /api/projects/:projectId/snippets/:snippetId
// @access Private
const deleteSnippet = asyncHandler(async (req, res) => {
  res.json({ message: `Delete snippet ${req.params.snippetId}` });
});

module.exports = {
  getSnippets,
  getSnippetById,
  createSnippet,
  updateSnippet,
  deleteSnippet
};
