const Task = require('../models/Task');
const List = require('../models/List');
const Project = require('../models/Project');
const { logChange } = require('../utils/changeLogService');

// Middleware to check task authorization
const authorizeTaskAccess = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate({
            path: 'list',
            populate: { path: 'board' }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const project = await Project.findById(task.list.board.project);
        if (!project.members.some(member => member.user.toString() === req.user.id) && req.user.role !== 'system_admin') {
            return res.status(403).json({ message: 'User not authorized for this project' });
        }

        req.task = task; // Pass task to the next controller
        req.project = project; // Pass project for logging
        next();
    } catch (error) {
        next(error);
    }
};


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

    const project = await Project.findById(list.board.project);
    if (!project.members.some(member => member.user.toString() === req.user.id) && req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'User not authorized for this project' });
    }

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

    await logChange(project._id, req.user.id, `Created task "${title}"`, 'board');
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = [authorizeTaskAccess, async (req, res, next) => {
    try {
        const task = await req.task.populate('labels assignees');
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
}];

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = [authorizeTaskAccess, async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await logChange(req.project._id, req.user.id, `Updated task "${updatedTask.title}"`, 'board');
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
}];

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = [authorizeTaskAccess, async (req, res, next) => {
  try {
    await req.task.deleteOne();
    await logChange(req.project._id, req.user.id, `Deleted task "${req.task.title}"`, 'board');
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
}];

// @desc    Move a task
// @route   PUT /api/tasks/:id/move
// @access  Private
exports.moveTask = [authorizeTaskAccess, async (req, res, next) => {
    try {
        const { newListId, newPosition } = req.body;
        const task = req.task;
        const originalListId = task.list._id;

        await Task.updateMany({ list: originalListId, position: { $gt: task.position } }, { $inc: { position: -1 } });
        await Task.updateMany({ list: newListId, position: { $gte: newPosition } }, { $inc: { position: 1 } });

        task.list = newListId;
        task.position = newPosition;
        await task.save();

        await logChange(req.project._id, req.user.id, `Moved task "${task.title}"`, 'board');
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
}];

// @desc    Mark a task as complete
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = [authorizeTaskAccess, async (req, res, next) => {
    try {
        const task = req.task;
        task.completedAt = task.completedAt ? null : Date.now();
        await task.save();

        const action = task.completedAt ? 'Completed' : 'Reopened';
        await logChange(req.project._id, req.user.id, `${action} task "${task.title}"`, 'board');

        res.status(200).json(task);
    } catch(error) {
        next(error);
    }
}];

// @desc    Update a task's priority
// @route   PUT /api/tasks/:id/priority
// @access  Private
exports.updateTaskPriority = [authorizeTaskAccess, async (req, res, next) => {
    try {
        const task = req.task;
        const priorities = ['Low', 'Medium', 'High'];
        const currentPriorityIndex = priorities.indexOf(task.priority);
        const nextPriorityIndex = (currentPriorityIndex + 1) % priorities.length;
        task.priority = priorities[nextPriorityIndex];

        await task.save();

        await logChange(req.project._id, req.user.id, `Set priority for "${task.title}" to ${task.priority}`, 'board');

        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
}];
