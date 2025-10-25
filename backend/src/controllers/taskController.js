const Task = require('../models/Task');
const List = require('../models/List');

// @desc    Create a new task in a list
// @route   POST /api/lists/:listId/tasks
// @access  Private
const Board = require('../models/Board');
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const newTask = new Task({
      title,
      description,
      list: req.params.listId,
      project: board.project,
      user: req.user.id,
    });
    const savedTask = await newTask.save();
    list.tasks.push(savedTask._id);
    await list.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Remove the task reference from the parent list
    await List.updateOne({ _id: task.list }, { $pull: { tasks: task._id } });
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
