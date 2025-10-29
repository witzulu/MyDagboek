const ChangeLog = require('../models/ChangeLog');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Helper to check project membership
const checkProjectMembership = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) {
        return { error: true, message: 'Project not found', status: 404 };
    }
    if (!project.members.some(member => member.user && member.user.equals(userId))) {
        return { error: true, message: 'User is not a member of this project', status: 403 };
    }
    return { error: false, project };
};


// @desc    Get all change log entries for a project
// @route   GET /api/projects/:projectId/changelog
// @access  Private (Project members only)
exports.getChangeLogEntries = async (req, res) => {
  try {
    const { error, message, status } = await checkProjectMembership(req.params.projectId, req.user.id);
    if (error) {
        return res.status(status).json({ message });
    }

    const changeLogs = await ChangeLog.find({ project: req.params.projectId })
      .populate('user', 'name username')
      .sort({ createdAt: -1 });

    res.json(changeLogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a manual change log entry
// @route   POST /api/projects/:projectId/changelog
// @access  Private (Project members only)
exports.createChangeLogEntry = async (req, res) => {
  const { title, message } = req.body;
  if (!message || !title) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const { error, message: errMsg, status } = await checkProjectMembership(req.params.projectId, req.user.id);
    if (error) {
        return res.status(status).json({ message: errMsg });
    }

    const newEntry = new ChangeLog({
      project: req.params.projectId,
      user: req.user.id,
      title,
      message,
      type: 'manual',
    });

    const savedEntry = await newEntry.save();
    await savedEntry.populate('user', 'name username');

    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a manual change log entry
// @route   PUT /api/changelog/:id
// @access  Private (Entry owner only)
exports.updateChangeLogEntry = async (req, res) => {
    const { title, message } = req.body;
    if (!message || !title) {
        return res.status(400).json({ message: 'Title and message are required' });
    }

    try {
        let entry = await ChangeLog.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Change log entry not found' });
        }

        if (!entry.user.equals(req.user.id)) {
            return res.status(403).json({ message: 'User not authorized to update this entry' });
        }
        if (entry.type !== 'manual') {
            return res.status(400).json({ message: 'Only manual entries can be updated' });
        }

        entry.title = title;
        entry.message = message;
        const updatedEntry = await entry.save();
        await updatedEntry.populate('user', 'name username');

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a manual change log entry
// @route   DELETE /api/changelog/:id
// @access  Private (Entry owner only)
exports.deleteChangeLogEntry = async (req, res) => {
    try {
        let entry = await ChangeLog.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Change log entry not found' });
        }

        if (!entry.user.equals(req.user.id)) {
            return res.status(403).json({ message: 'User not authorized to delete this entry' });
        }
        if (entry.type !== 'manual') {
            return res.status(400).json({ message: 'Only manual entries can be deleted' });
        }

        await entry.deleteOne();

        res.json({ message: 'Change log entry removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle whether a changelog entry is included in reports
// @route   PUT /api/changelog/:id/toggle-report
// @access  Private (Project members only)
exports.toggleIncludeInReport = async (req, res) => {
    try {
        const entry = await ChangeLog.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Change log entry not found' });
        }

        const { error, message, status } = await checkProjectMembership(entry.project, req.user.id);
        if (error) {
            return res.status(status).json({ message });
        }

        entry.includeInReport = !entry.includeInReport;
        await entry.save();

        await entry.populate('user', 'name username');

        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
