// backend/src/controllers/boardController.js
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task'); // Ensure Task model is imported

// @desc    Get all boards (optionally filter by project or user)
// @route   GET /api/boards
// @access  Private
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({});
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single board by ID with its lists and tasks
// @route   GET /api/boards/:id
// @access  Private
exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Find all lists for the board and populate their tasks
    const lists = await List.find({ board: board._id }).populate('tasks');

    // Convert the Mongoose document to a plain object to attach the lists
    const boardObject = board.toObject();
    boardObject.lists = lists;

    res.json(boardObject);
  } catch (error) {
    console.error('Error fetching board by ID:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
exports.createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    const board = new Board({
      name,
      description,
      // user: req.user._id, // if boards belong to a user
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

    await board.deleteOne();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
