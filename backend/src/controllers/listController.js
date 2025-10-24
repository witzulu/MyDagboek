const List = require('../models/List');
const Board = require('../models/Board');
const Task = require('../models/Task');

// @desc    Create a new list
// @route   POST /api/boards/:boardId/lists
// @access  Private
exports.createList = async (req, res) => {
  try {
    const { name } = req.body;
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    const newList = new List({
      name,
      board: req.params.boardId,
    });
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a list
// @route   PUT /api/lists/:id
// @access  Private
exports.updateList = async (req, res) => {
  try {
    const { name } = req.body;
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    list.name = name || list.name;
    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a list
// @route   DELETE /api/lists/:id
// @access  Private
exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    // Also delete all tasks in the list
    await Task.deleteMany({ _id: { $in: list.tasks } });
    await list.deleteOne();
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
