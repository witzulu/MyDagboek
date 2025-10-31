
const Task = require('../models/Task');
const Project = require('../models/Project');
const List = require('../models/List');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Optional: Verify user is a member of the project
    if (!project.members.some(member => member.user.toString() === req.user.id) && req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'User is not a member of this project' });
    }

    // Find all lists within all boards of the project
    const lists = await List.find({ project: req.params.projectId });
    const listIds = lists.map(list => list._id);

    // Find all tasks that belong to those lists
    const tasks = await Task.find({ list: { $in: listIds } }).select('title');

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};
