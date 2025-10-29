const ChangeLog = require('../models/ChangeLog');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// @desc    Get all change log entries for a project
// @route   GET /api/projects/:projectId/changelog
// @access  Private (Project members only)
exports.getChangeLogEntries = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project
    if (!project.members.some(member => member.user.equals(req.user.id))) {
        return res.status(403).json({ message: 'User is not a member of this project' });
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
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.some(member => member.user.equals(req.user.id))) {
        return res.status(403).json({ message: 'User is not a member of this project' });
    }

    const newEntry = new ChangeLog({
      project: req.params.projectId,
      user: req.user.id,
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
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        let entry = await ChangeLog.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Change log entry not found' });
        }

        // Only the user who created the entry can edit it
        if (!entry.user.equals(req.user.id)) {
            return res.status(403).json({ message: 'User not authorized to update this entry' });
        }
        // Ensure it's a manual entry
        if (entry.type !== 'manual') {
            return res.status(400).json({ message: 'Only manual entries can be updated' });
        }

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

        // Only the user who created the entry can delete it
        if (!entry.user.equals(req.user.id)) {
            return res.status(403).json({ message: 'User not authorized to delete this entry' });
        }
        // Ensure it's a manual entry
        if (entry.type !== 'manual') {
            return res.status(400).json({ message: 'Only manual entries can be deleted' });
        }

        await entry.deleteOne();

        res.json({ message: 'Change log entry removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
