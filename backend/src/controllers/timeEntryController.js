
const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');
const mongoose = require('mongoose');
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
    if (project.user.toString() !== req.user.id && !project.members.some(member => member && member.user && member.user.toString() === req.user.id)) {
      return res.status(403).json({ message: 'User is not a member of this project' });
    }

    const timeEntries = await TimeEntry.find({ project: req.params.projectId }).populate('user', 'name').populate('task', 'title');
    res.status(200).json(timeEntries);
  } catch (error) {
    next(error);
  }
};

// @desc    Get time entry summary for a project
// @route   GET /api/projects/:projectId/time-entries/summary
// @access  Private
exports.getTimeEntrySummary = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await TimeEntry.aggregate([
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalDuration: { $sum: '$duration' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalDuration: 1,
        }
      }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a time entry
// @route   PUT /api/time-entries/:id
// @access  Private
exports.updateTimeEntry = async (req, res, next) => {
  try {
    const { task, date, duration, note } = req.body;

    let timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Verify user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    timeEntry.task = task;
    timeEntry.date = date;
    timeEntry.duration = duration;
    timeEntry.note = note;

    timeEntry = await timeEntry.save();

    res.status(200).json(timeEntry);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a time entry
// @route   DELETE /api/time-entries/:id
// @access  Private
exports.deleteTimeEntry = async (req, res, next) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Verify user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await timeEntry.deleteOne();

    res.status(200).json({ message: 'Time entry removed' });
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
    if (project.user.toString() !== req.user.id && !project.members.some(member => member && member.user && member.user.toString() === req.user.id)) {
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
