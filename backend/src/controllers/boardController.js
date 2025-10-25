const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');

// @desc    Get all boards for a specific project
// @route   GET /api/projects/:projectId/boards
// @access  Private
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ project: req.params.projectId });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single board by ID
// @route   GET /api/boards/:id
// @access  Private
exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    const lists = await List.find({ board: board._id }).populate('tasks').lean();
    const boardObject = board.toObject();
    boardObject.lists = lists;
    res.json(boardObject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new board for a specific project
// @route   POST /api/projects/:projectId/boards
// @access  Private
exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const board = new Board({
      name,
      project: req.params.projectId,
    });
    const createdBoard = await board.save();
    res.status(201).json(createdBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a board
// @route   PUT /api/boards/:id
// @access  Private
exports.updateBoard = async (req, res) => {
  try {
    // TODO: Ensure user has permission to update this board
    const { name, description } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    board.name = name || board.name;
    board.description = description || board.description;

    const updatedBoard = await board.save();
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a board
// @route   DELETE /api/boards/:id
// @access  Private
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Find all lists associated with the board
    const lists = await List.find({ board: board._id });
    const listIds = lists.map(list => list._id);

    // Delete all tasks in those lists
    await Task.deleteMany({ list: { $in: listIds } });

    // Delete all lists
    await List.deleteMany({ board: board._id });

    // Delete the board
    await board.deleteOne();

    res.json({ message: 'Board and associated lists and tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
