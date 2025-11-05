// controllers/taskAttachmentController.js
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Attachment = require('../models/Attachment');

const THUMB_WIDTH = 256;
const THUMB_QUALITY = 80;
const THUMB_FOLDER_NAME = '_thumbs';

exports.addAttachment = async (req, res) => {
  try {
    // multer should have set req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Use the pre-fetched project/task set by router
    const task = req._uploadTask || await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = req._uploadProject || await Project.findOne({ boards: { $in: [ task.board ] } });
    if (!project) return res.status(404).json({ message: 'Project not found for this task' });

    // Build public URL paths (assuming express.static serves /uploads from process.cwd()/uploads)
    const projectId = project._id.toString();
    const taskId = task._id.toString();
    const filename = req.file.filename;
    const fileRelativeUrl = `/uploads/projects/${projectId}/${taskId}/${filename}`;
    const absoluteFilePath = req.file.path; // absolute path on disk (as provided by storageFactory)

    // Prepare attachment document
    const attachmentDoc = {
      project: project._id,
      task: task._id,
      filename: filename,
      filepath: absoluteFilePath,
      urlPath: fileRelativeUrl,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
      size: req.file.size,
      createdBy: req.user.id
    };

    // If image → create thumbnail
    let thumbnailUrl = null;
    if (req.file.mimetype && req.file.mimetype.startsWith('image/')) {
      try {
        const thumbsDir = path.join(process.cwd(), 'uploads', 'projects', projectId, taskId, THUMB_FOLDER_NAME);
        // ensure thumbs dir exists
        fs.mkdirSync(thumbsDir, { recursive: true });

        const thumbFilename = `${Date.now()}-${Math.round(Math.random()*1e9)}.jpg`;
        const thumbAbsolutePath = path.join(thumbsDir, thumbFilename);
        const thumbRelativeUrl = `/uploads/projects/${projectId}/${taskId}/${THUMB_FOLDER_NAME}/${thumbFilename}`;

        // Use sharp to convert / resize -> jpg
        await sharp(absoluteFilePath)
          .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: THUMB_QUALITY })
          .toFile(thumbAbsolutePath);

        thumbnailUrl = thumbRelativeUrl;
        attachmentDoc.thumbnailPath = thumbnailUrl;
      } catch (thumbErr) {
        console.error('Thumbnail generation error:', thumbErr);
        // continue without thumbnail
      }
    }

    // Persist Attachment document
    const attachment = await Attachment.create(attachmentDoc);

    // Add reference to task.attachments array (store ids)
    task.attachments = task.attachments || [];
    task.attachments.push(attachment._id);
    await task.save();

    // Return the created attachment (with public url paths)
    res.status(201).json({
      _id: attachment._id,
      filename: attachment.filename,
      urlPath: attachment.urlPath,
      thumbnailPath: attachment.thumbnailPath || null,
      mimetype: attachment.mimetype,
      originalName: attachment.originalName,
      size: attachment.size,
      createdBy: attachment.createdBy,
      createdAt: attachment.createdAt
    });

  } catch (err) {
    console.error('addAttachment error:', err);
    res.status(500).json({ message: 'Server error', error: err.toString() });
  }
};


exports.deleteAttachment = async (req, res) => {
  try {
    const attachmentId = req.params.attachmentId;
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    // Remove file on disk
    try {
      if (attachment.filepath) {
        fs.unlinkSync(attachment.filepath);
      }
    } catch (e) {
      console.error('Error deleting attachment file:', e);
      // not fatal
    }

    // Remove thumbnail if exists
    try {
      if (attachment.thumbnailPath) {
        const thumbAbsolute = path.join(process.cwd(), attachment.thumbnailPath.replace(/^\/+/, '')); // remove leading slash
        if (fs.existsSync(thumbAbsolute)) {
          fs.unlinkSync(thumbAbsolute);
        } else {
          // fallback: compute from known folder if thumbnailPath is a url
          const fallback = path.join(process.cwd(), 'uploads', attachment.thumbnailPath.replace(/^\/uploads\/?/,''));
          if (fs.existsSync(fallback)) fs.unlinkSync(fallback);
        }
      }
    } catch (e) {
      console.error('Error deleting thumbnail file:', e);
    }

    // Remove reference from Task
    await Task.findByIdAndUpdate(attachment.task, { $pull: { attachments: attachment._id } });

    await attachment.deleteOne();

    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error('deleteAttachment error:', err);
    res.status(500).json({ message: 'Server error', error: err.toString() });
  }
};
