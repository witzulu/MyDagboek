const Folder = require('../models/Folder');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

// @desc    Get all folders for a project
// @route   GET /api/projects/:projectId/folders
// @access  Private
const getFolders = asyncHandler(async (req, res) => {
  const folders = await Folder.find({ project: req.params.projectId });
  res.json(folders);
});

// @desc    Create a folder
// @route   POST /api/projects/:projectId/folders
// @access  Private
const createFolder = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  const folder = new Folder({
    name,
    parent,
    project: req.params.projectId,
    user: req.user.id,
  });
  const createdFolder = await folder.save();
  res.status(201).json(createdFolder);
});

// @desc    Update a folder
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  const folder = await Folder.findById(req.params.id);

  if (folder) {
    folder.name = name || folder.name;
    folder.parent = parent === undefined ? folder.parent : parent;
    const updatedFolder = await folder.save();
    res.json(updatedFolder);
  } else {
    res.status(404);
    throw new Error('Folder not found');
  }
});

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.findById(req.params.id);

  if (folder) {
    await Note.deleteMany({ folder: folder._id });
    await Folder.deleteOne({ _id: folder._id });
    res.json({ message: 'Folder removed' });
  } else {
    res.status(404);
    throw new Error('Folder not found');
  }
});

module.exports = {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
};
