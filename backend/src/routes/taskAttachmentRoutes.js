// routes/taskAttachmentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const { addAttachment, deleteAttachment } = require('../controllers/taskAttachmentController');
const storageFactory = require('../utils/multerProjectStorage');

// POST /api/tasks/:taskId/attachments
router.post('/', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // find project; supports boards being a single ref or array
    const project = await Project.findOne({ boards: { $in: [ task.board ] } });
    if (!project) return res.status(404).json({ message: 'Project not found for this task' });

    // Create storage for this request
    const storage = storageFactory(project._id, task._id);
    const upload = multer({ storage }).single('file');

    upload(req, res, function (err) {
      if (err) {
        console.error('Multer upload error:', err);
        return res.status(500).json({ message: 'Upload error', error: err.toString() });
      }
      // attach project/task to req for controller convenience
      req._uploadProject = project;
      req._uploadTask = task;
      next();
    });
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ message: 'Server error', error: err.toString() });
  }
}, addAttachment);

// DELETE /api/tasks/:taskId/attachments/:attachmentId
router.delete('/:attachmentId', protect, deleteAttachment);

module.exports = router;
