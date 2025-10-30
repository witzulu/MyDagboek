
const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');

// @desc    Get all time entries for a project
// @route   GET /api/projects/:projectId/time-entries
// @access  Private
exports.getProjectTimeEntries = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is a member of the project
    if (project.user.toString() !== req.user.id && !project.members.some(member => member.user.toString() === req.user.id)) {
      return res.status(403).json({ message: 'User is not a member of this project' });
    }

    const timeEntries = await TimeEntry.find({ project: req.params.projectId }).populate('user', 'name').populate('task', 'title');
    res.status(200).json(timeEntries);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a time entry for a project
// @route   POST /api/projects/:projectId/time-entries
// @access  Private
exports.createTimeEntry = async (req, res, next) => {
  try {
    const { task, date, duration, note } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is a member of the project
    if (project.user.toString() !== req.user.id && !project.members.some(member => member.user.toString() === req.user.id)) {
      return res.status(403).json({ message: 'User is not a member of this project' });
    }

    const timeEntry = await TimeEntry.create({
      user: req.user.id,
      project: projectId,
      task,
      date,
      duration,
      note,
    });
    res.status(201).json(timeEntry);
  } catch (error) {
    next(error);
  }
};
