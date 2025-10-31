const Task = require('../models/Task');
const List = require('../models/List');
const Project = require('../models/Project');
const { logChange } = require('../utils/changeLogService');

// @desc    Get all tasks for a project (for dropdowns, etc.)
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.members.some(member => member.user.toString() === req.user.id) && req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'User not authorized for this project' });
    }
    const lists = await List.find({ project: req.params.projectId });
    const listIds = lists.map(list => list._id);
    const tasks = await Task.find({ list: { $in: listIds } }).select('title');
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { listId, title, description, dueDate, labels, assignees, priority, position } = req.body;
    const list = await List.findById(listId).populate('board');
    if (!list) return res.status(404).json({ message: 'List not found' });

    const task = await Task.create({
      list: listId,
      title,
      description,
      dueDate,
      labels,
      assignees,
      priority,
      position,
      user: req.user.id
    });

    await logChange(list.board.project, req.user.id, `Created task "${title}"`, 'board');
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('labels assignees');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};


// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const list = await List.findById(task.list).populate('board');
    await logChange(list.board.project, req.user.id, `Updated task "${task.title}"`, 'board');

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
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const list = await List.findById(task.list).populate('board');
    await task.deleteOne();

    await logChange(list.board.project, req.user.id, `Deleted task "${task.title}"`, 'board');

    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Move a task
// @route   PUT /api/tasks/:id/move
// @access  Private
exports.moveTask = async (req, res, next) => {
    // This is a complex operation that recalculates positions.
    // A simplified version is provided for now.
    try {
        const { newListId, newPosition } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const originalListId = task.list;

        // Update other tasks' positions
        await Task.updateMany({ list: originalListId, position: { $gt: task.position } }, { $inc: { position: -1 } });
        await Task.updateMany({ list: newListId, position: { $gte: newPosition } }, { $inc: { position: 1 } });

        task.list = newListId;
        task.position = newPosition;
        await task.save();

        const list = await List.findById(newListId).populate('board');
        await logChange(list.board.project, req.user.id, `Moved task "${task.title}"`, 'board');

        res.status(200).json(task);
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
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.completedAt = task.completedAt ? null : Date.now();
        await task.save();

        const list = await List.findById(task.list).populate('board');
        const action = task.completedAt ? 'Completed' : 'Reopened';
        await logChange(list.board.project, req.user.id, `${action} task "${task.title}"`, 'board');

        res.status(200).json(task);
    } catch(error) {
        next(error);
    }
};

// @desc    Update a task's priority
// @route   PUT /api/tasks/:id/priority
// @access  Private
exports.updateTaskPriority = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const priorities = ['Low', 'Medium', 'High'];
        const currentPriorityIndex = priorities.indexOf(task.priority);
        const nextPriorityIndex = (currentPriorityIndex + 1) % priorities.length;
        task.priority = priorities[nextPriorityIndex];

        await task.save();

        const list = await List.findById(task.list).populate('board');
        await logChange(list.board.project, req.user.id, `Set priority for "${task.title}" to ${task.priority}`, 'board');

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};
