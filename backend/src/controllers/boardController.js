// backend/src/controllers/boardController.js
const Board = require('../models/Board');

// @desc    Get all boards (optionally filter by project or user)
// @route   GET /api/boards
// @access  Private
exports.getBoards = async (req, res) => {
  try {
    // Example: filter by user if your Board model includes a user reference
    // const boards = await Board.find({ user: req.user._id });
    const boards = await Board.find({});
    res.json(boards); // ✅ return valid JSON
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

    res.json(board);
  } catch (error) {
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
