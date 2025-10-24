const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');

// @desc    Create a task for a list
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, listId } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const lastTask = await Task.findOne({ list: listId }).sort({ position: -1 });
    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      list: listId,
      board: list.board,
      position: newPosition,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Move a task within a list or to another list
// @route   PUT /api/tasks/:id/move
// @access  Private
exports.moveTask = async (req, res, next) => {
  const { newListId, newPosition } = req.body;
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const board = await Board.findById(task.board);
    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const originalListId = task.list.toString();
    const bulkOps = [];

    if (originalListId === newListId) {
      // --- MOVING WITHIN THE SAME LIST ---
      const tasksToUpdate = await Task.find({ list: originalListId, _id: { $ne: taskId } }).sort('position');
      tasksToUpdate.splice(newPosition, 0, task);

      tasksToUpdate.forEach((t, index) => {
        if (t.position !== index) {
          bulkOps.push({
            updateOne: {
              filter: { _id: t._id },
              update: { $set: { position: index } }
            }
          });
        }
      });

    } else {
      // --- MOVING TO A DIFFERENT LIST ---
      // 1. Update positions in the original list
      const originalListTasks = await Task.find({ list: originalListId, _id: { $ne: taskId } }).sort('position');
      originalListTasks.forEach((t, index) => {
        if (t.position !== index) {
          bulkOps.push({
            updateOne: {
              filter: { _id: t._id },
              update: { $set: { position: index } }
            }
          });
        }
      });

      // 2. Update the moved task
      bulkOps.push({
        updateOne: {
          filter: { _id: taskId },
          update: { $set: { list: newListId, position: newPosition } }
        }
      });

      // 3. Update positions in the new list
      const newListTasks = await Task.find({ list: newListId }).sort('position');
      newListTasks.splice(newPosition, 0, task);
      newListTasks.forEach((t, index) => {
        // Only update if position is incorrect or it's the moved task
        if (t.position !== index || t._id.toString() === taskId) {
           bulkOps.push({
            updateOne: {
              filter: { _id: t._id },
              update: { $set: { position: index } }
            }
          });
        }
      });
    }

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: 'Task moved successfully' });

  } catch (error) {
    next(error);
  }
};

// Not implemented yet
exports.getTasks = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
exports.getTaskById = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
