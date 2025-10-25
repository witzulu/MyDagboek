const Task = require('../models/Task');

// @desc    Add a checklist item to a task
// @route   POST /api/tasks/:taskId/checklist
// @access  Private
exports.addChecklistItem = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Checklist item text is required' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newItem = { text, done: false };
    task.checklist.push(newItem);
    await task.save();

    res.status(201).json(task.checklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a checklist item on a task
// @route   PUT /api/tasks/:taskId/checklist/:itemId
// @access  Private
exports.updateChecklistItem = async (req, res) => {
  try {
    const { text, done } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const item = task.checklist.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    if (typeof text === 'string') {
      item.text = text;
    }
    if (typeof done === 'boolean') {
      item.done = done;
    }

    await task.save();
    res.json(task.checklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a checklist item from a task
// @route   DELETE /api/tasks/:taskId/checklist/:itemId
// @access  Private
exports.deleteChecklistItem = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const item = task.checklist.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    item.remove();
    await task.save();

    res.json(task.checklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
