const Board = require('../models/Board');
const Project = require('../models/Project');

// @desc    Get all boards for a project
// @route   GET /api/projects/:projectId/boards
// @access  Private
exports.getBoards = async (req, res, next) => {
  try {
    // First, check if the project exists and belongs to the user
    const project = await Project.findOne({ _id: req.params.projectId, user: req.user.id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or user not authorized' });
    }

    const boards = await Board.find({ project: req.params.projectId });
    res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a board for a project
// @route   POST /api/projects/:projectId/boards
// @access  Private
exports.createBoard = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ensure the user owns the project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const board = await Board.create({
      name,
      description,
      project: req.params.projectId,
      user: req.user.id,
    });

    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

// Placeholder for getting a single board
exports.getBoardById = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };

// Placeholder for updating a board
exports.updateBoard = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };

// Placeholder for deleting a board
exports.deleteBoard = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
