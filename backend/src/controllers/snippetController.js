const asyncHandler = require('express-async-handler');
const CodeSnippet = require('../models/CodeSnippet');

// @desc Get all snippets for a project
// @route GET /api/projects/:projectId/snippets
// @access Private
const getSnippets = asyncHandler(async (req, res) => {
  const snippets = await CodeSnippet.find({ project: req.params.projectId });
  res.json(snippets);
});

// @desc Get single snippet
// @route GET /api/projects/:projectId/snippets/:snippetId
// @access Private
const getSnippetById = asyncHandler(async (req, res) => {
  const snippet = await CodeSnippet.findById(req.params.snippetId);

  if (snippet) {
    res.json(snippet);
  } else {
    res.status(404);
    throw new Error('Snippet not found');
  }
});

// @desc Create new snippet
// @route POST /api/projects/:projectId/snippets
// @access Private
const createSnippet = asyncHandler(async (req, res) => {
  const { title, description, code, language, tags } = req.body;

  if (!title || !code || !language) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const snippet = await CodeSnippet.create({
    title,
    description,
    code,
    language,
    tags,
    user: req.user.id,
    project: req.params.projectId,
  });

  res.status(201).json(snippet);
});

// @desc Update snippet
// @route PUT /api/projects/:projectId/snippets/:snippetId
// @access Private
const updateSnippet = asyncHandler(async (req, res) => {
  const snippet = await CodeSnippet.findById(req.params.snippetId);

  if (!snippet) {
    res.status(404);
    throw new Error('Snippet not found');
  }

  // Check for user
  if (snippet.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedSnippet = await CodeSnippet.findByIdAndUpdate(req.params.snippetId, req.body, {
    new: true,
  });

  res.json(updatedSnippet);
});

// @desc Delete snippet
// @route DELETE /api/projects/:projectId/snippets/:snippetId
// @access Private
const deleteSnippet = asyncHandler(async (req, res) => {
  const snippet = await CodeSnippet.findById(req.params.snippetId);

  if (!snippet) {
    res.status(404);
    throw new Error('Snippet not found');
  }

  // Check for user
  if (snippet.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await snippet.deleteOne();

  res.json({ id: req.params.snippetId });
});

module.exports = {
  getSnippets,
  getSnippetById,
  createSnippet,
  updateSnippet,
  deleteSnippet
};
