
const TimeEntry = require('../models/TimeEntry');
const Project = require('../models/Project');

// @desc    Get all time entries for a user
// @route   GET /api/time-entries
// @access  Private
exports.getTimeEntries = async (req, res, next) => {
  try {
    const timeEntries = await TimeEntry.find({ user: req.user.id }).populate('project', 'name').populate('task', 'title');
    res.status(200).json(timeEntries);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a time entry
// @route   POST /api/time-entries
// @access  Private
exports.createTimeEntry = async (req, res, next) => {
  try {
    const { project, task, date, duration, note } = req.body;

    // Verify user is a member of the project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (projectDoc.user.toString() !== req.user.id && !projectDoc.members.some(member => member.user.toString() === req.user.id)) {
      return res.status(403).json({ message: 'User is not a member of this project' });
    }

    const timeEntry = await TimeEntry.create({
      user: req.user.id,
      project,
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

// @desc    Update a time entry
// @route   PUT /api/time-entries/:id
// @access  Private
exports.updateTimeEntry = async (req, res, next) => {
  try {
    const { project, task, date, duration, note } = req.body;
    let timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Make sure user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    timeEntry.project = project || timeEntry.project;
    timeEntry.task = task || timeEntry.task;
    timeEntry.date = date || timeEntry.date;
    timeEntry.duration = duration || timeEntry.duration;
    timeEntry.note = note || timeEntry.note;

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

    // Make sure user owns the time entry
    if (timeEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await timeEntry.deleteOne();
    res.status(200).json({ message: 'Time entry removed' });
  } catch (error) {
    next(error);
  }
};
