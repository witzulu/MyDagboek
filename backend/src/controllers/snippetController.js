const CodeSnippet = require('../models/CodeSnippet');
const Project = require('../models/Project');
const { logChange } = require('../utils/changeLogService');

// @desc    Get all snippets for a project
// @route   GET /api/projects/:projectId/snippets
// @access  Private
exports.getSnippets = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(401).json({ message: 'User not authorized for this project' });
    }
    const snippets = await CodeSnippet.find({ project: req.params.projectId });
    res.status(200).json(snippets);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single snippet by ID
// @route   GET /api/projects/:projectId/snippets/:snippetId
// @access  Private
exports.getSnippetById = async (req, res, next) => {
  try {
    const snippet = await CodeSnippet.findOne({ _id: req.params.snippetId, project: req.params.projectId });
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember) {
        return res.status(401).json({ message: 'User not authorized for this project' });
    }
    res.status(200).json(snippet);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a snippet for a project
// @route   POST /api/projects/:projectId/snippets
// @access  Private
exports.createSnippet = async (req, res, next) => {
  try {
    const { title, description, code, language, tags } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(401).json({ message: 'User not authorized for this project' });
    }

    const snippet = await CodeSnippet.create({
      title,
      description,
      code,
      language,
      tags,
      project: req.params.projectId,
      user: req.user.id,
    });

    await logChange(req.params.projectId, req.user.id, `Created new code snippet: "${snippet.title}"`, 'snippet');

    res.status(201).json(snippet);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a snippet
// @route   PUT /api/projects/:projectId/snippets/:snippetId
// @access  Private
exports.updateSnippet = async (req, res, next) => {
  try {
    const { title, description, code, language, tags } = req.body;
    let snippet = await CodeSnippet.findOne({ _id: req.params.snippetId, project: req.params.projectId });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (snippet.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to update this snippet' });
    }

    snippet.title = title ?? snippet.title;
    snippet.description = description ?? snippet.description;
    snippet.code = code ?? snippet.code;
    snippet.language = language ?? snippet.language;
    snippet.tags = tags ?? snippet.tags;

    await snippet.save();

    await logChange(req.params.projectId, req.user.id, `Updated code snippet: "${snippet.title}"`, 'snippet');

    res.status(200).json(snippet);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a snippet
// @route   DELETE /api/projects/:projectId/snippets/:snippetId
// @access  Private
exports.deleteSnippet = async (req, res, next) => {
  try {
    const snippet = await CodeSnippet.findOne({ _id: req.params.snippetId, project: req.params.projectId });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (snippet.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to delete this snippet' });
    }

    await snippet.deleteOne();
    res.status(200).json({ message: 'Snippet removed' });
  } catch (error) {
    next(error);
  }
};
