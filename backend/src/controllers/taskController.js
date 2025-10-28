const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');
const Project = require('../models/Project');

const checkProjectMembership = async (boardId, userId, userRole) => {
  const board = await Board.findById(boardId);
  if (!board) return { error: true, status: 404, message: 'Board not found' };

  const project = await Project.findById(board.project);
  if (!project) return { error: true, status: 404, message: 'Project not found for this board' };

  const isMember = project.members.some(member => member.user.toString() === userId);
  if (!isMember && userRole !== 'system_admin') {
    return { error: true, status: 401, message: 'User not authorized for this project' };
  }
  return { error: false };
};

// @desc    Create a task for a list
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, listId, dueDate, labels } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const authCheck = await checkProjectMembership(list.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    const lastTask = await Task.findOne({ list: listId }).sort({ position: -1 });
    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      list: listId,
      board: list.board,
      position: newPosition,
      dueDate,
      labels,
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
    const { title, description, dueDate, labels } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const authCheck = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ?? task.dueDate;
    task.labels = labels ?? task.labels;

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

    const authCheck = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
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
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const authCheck = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
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

// @desc    Mark a task as complete
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const authCheck = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    // Find the 'Done' list for the board
    const doneList = await List.findOne({ board: task.board, name: 'Done' });

    if (doneList && task.list.toString() !== doneList._id.toString()) {
      // Move task to 'Done' list
      const lastTaskInDoneList = await Task.findOne({ list: doneList._id }).sort({ position: -1 });
      const newPosition = lastTaskInDoneList ? lastTaskInDoneList.position + 1 : 0;
      task.list = doneList._id;
      task.position = newPosition;
    }

    task.completedAt = new Date();
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Not implemented yet
exports.getTasks = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
exports.getTaskById = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
