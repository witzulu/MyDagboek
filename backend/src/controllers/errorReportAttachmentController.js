const ErrorReport = require('../models/ErrorReport');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// @desc    Add an attachment to an error report
// @route   POST /api/errors/:id/attachments
// @access  Private
exports.addAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const report = await ErrorReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Error report not found' });
    }

    const project = await Project.findById(report.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found for this report' });
    }

    // Authorization check
    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember && project.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    const attachment = {
      filename: req.file.filename,
      filepath: req.file.path,
    };

    report.attachments.push(attachment);
    await report.save();

    res.status(201).json(report.attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an attachment from an error report
// @route   DELETE /api/errors/:id/attachments/:attachmentId
// @access  Private
exports.deleteAttachment = async (req, res) => {
  try {
    const report = await ErrorReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Error report not found' });
    }

    const project = await Project.findById(report.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found for this report' });
    }

    // Authorization check
    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember && project.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    const attachment = report.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove file from filesystem
    fs.unlink(path.join(__dirname, '..', '..', attachment.filepath), (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        }
    });

    attachment.remove();
    await report.save();

    res.json(report.attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
