const Board = require('../models/Board');
const Project = require('../models/Project');
const List = require('../models/List');

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

    // Create default lists
    const defaultLists = [
      { name: 'To-Do', board: board._id, position: 0 },
      { name: 'In Progress', board: board._id, position: 1 },
      { name: 'Done', board: board._id, position: 2 },
    ];

    await List.insertMany(defaultLists);

    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single board by ID with its lists
// @route   GET /api/boards/:id
// @access  Private
exports.getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, user: req.user.id });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or user not authorized' });
    }

    const lists = await List.find({ board: board._id })
      .sort({ position: 'asc' })
      .populate('tasks');

    res.status(200).json({ board, lists });
  } catch (error) {
    next(error);
  }
};

// Placeholder for updating a board
exports.updateBoard = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };

// Placeholder for deleting a board
exports.deleteBoard = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
