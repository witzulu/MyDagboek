const Task = require('../models/Task');
const List = require('../models/List');
const Project = require('../models/Project');
const { logChange } = require('../utils/changeLogService');

// Middleware to check if user is a member of the project associated with the board
const checkProjectMembership = async (boardId, userId, userRole) => {
  if (userRole === 'system_admin') {
    const project = await Project.findOne({ boards: boardId });
    return { error: false, project };
  }

  const project = await Project.findOne({ boards: boardId }).populate('members.user');

  if (!project) {
    return { error: true, message: 'Project not found for this board', status: 404 };
  }

  const isMember = project.members.some(member => member.user && member.user._id.equals(userId));

  if (!isMember) {
    return { error: true, message: 'User is not a member of this project', status: 403 };
  }

  return { error: false, project };
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, listId, position, description, dueDate, labels, assignees } = req.body;
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const authCheck = await checkProjectMembership(list.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }
    const { project } = authCheck;

    const task = await Task.create({
      title,
      list: listId,
      board: list.board,
      position,
      description,
      dueDate,
      labels,
      assignees,
    });

    await logChange(project._id, req.user.id, `created a new task '${title}' in list '${list.name}'.`, 'board');

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
    const { title, description, dueDate, labels, assignees } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const authCheck = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }
    const { project } = authCheck;

    let logMessage = `updated task '${task.title}'`;
    const changes = [];
    if (title && title !== task.title) changes.push(`title to '${title}'`);
    if (description && description !== task.description) changes.push('description');
    if (dueDate && new Date(dueDate).toISOString() !== new Date(task.dueDate).toISOString()) changes.push('due date');
    if (labels) changes.push('labels');
    if (assignees) changes.push('assignees');


    if(changes.length > 0) {
      logMessage += `: ${changes.join(', ')}.`;
      await logChange(project._id, req.user.id, logMessage, 'board');
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ?? task.dueDate;
    task.labels = labels ?? task.labels;
    task.assignees = assignees ?? task.assignees;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
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
    const { project } = authCheck;

    // Log the change before deleting
    await logChange(project._id, req.user.id, `deleted task '${task.title}'.`, 'board');

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

    const { error, status, message, project } = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (error) {
      return res.status(status).json({ message: message });
    }

    const originalListId = task.list.toString();
    const originalList = await List.findById(originalListId);

    const bulkOps = [];

    if (originalListId === newListId) {
      // --- MOVING WITHIN THE SAME LIST ---
       if (task.position !== newPosition) {
        await logChange(project._id, req.user.id, `reordered task '${task.title}' in list '${originalList.name}'.`, 'board');
      }
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
      const newList = await List.findById(newListId);
      if (!newList) {
        return res.status(404).json({ message: 'Destination list not found' });
      }
      await logChange(project._id, req.user.id, `moved task '${task.title}' from '${originalList.name}' to '${newList.name}'.`, 'board');

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

      // 2. Update the moved task's list and position
      task.list = newListId;
      task.position = newPosition;

      // 3. Update positions in the new list
      const newListTasks = await Task.find({ list: newListId, _id: { $ne: taskId } }).sort('position');
      newListTasks.splice(newPosition, 0, task);
      newListTasks.forEach((t, index) => {
          bulkOps.push({
            updateOne: {
              filter: { _id: t._id },
              update: { $set: { position: index } }
            }
          });
      });
       bulkOps.push({
        updateOne: {
          filter: { _id: taskId },
          update: { $set: { list: newListId, position: newPosition, board: newList.board } }
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
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.board) {
      return res.status(400).json({ message: 'Task missing board reference' });
    }

    const { error, status, message, project } = await checkProjectMembership(task.board, req.user.id, req.user.role);
    if (error) {
      return res.status(status).json({ message: message });
    }

    // Check if the task is already completed to avoid duplicate logs and actions
    if(task.completedAt) {
        return res.status(400).json({ message: 'Task is already marked as complete.' });
    }

    const doneList = await List.findOne({ board: task.board, name: 'Done' });
    if (!doneList) {
      return res.status(404).json({ message: 'No "Done" list found for this board' });
    }

    // Move to "Done" list
    const lastTaskInDoneList = await Task.findOne({ list: doneList._id }).sort({ position: -1 });
    const newPosition = lastTaskInDoneList ? lastTaskInDoneList.position + 1 : 0;

    task.list = doneList._id;
    task.position = newPosition;
    task.completedAt = new Date();

    await task.save();

    await logChange(project._id, req.user.id, `completed task '${task.title}'.`, 'board');

    res.status(200).json(task);

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error completing task', error: error.message });
  }
};


// Not implemented yet
exports.getTasks = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
exports.getTaskById = async (req, res, next) => { res.status(501).json({ message: 'Not implemented' }); };
