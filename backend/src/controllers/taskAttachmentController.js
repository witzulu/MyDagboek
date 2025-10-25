const Task = require('../models/Task');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// @desc    Add an attachment to a task
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
exports.addAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({ boards: task.board });
    if (!project) {
        return res.status(404).json({ message: 'Project not found for this task' });
    }

    const attachment = {
      filename: req.file.filename,
      filepath: req.file.path,
    };

    task.attachments.push(attachment);
    await task.save();

    res.status(201).json(task.attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an attachment from a task
// @route   DELETE /api/tasks/:taskId/attachments/:attachmentId
// @access  Private
exports.deleteAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove file from filesystem
    fs.unlink(path.join(__dirname, '..', '..', attachment.filepath), (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            // Decide if you want to stop the process if the file doesn't exist or just log it
        }
    });

    attachment.remove();
    await task.save();

    res.json(task.attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
