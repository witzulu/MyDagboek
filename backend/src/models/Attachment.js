// models/Attachment.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },         // absolute server path (or path on disk)
  urlPath: { type: String, required: true },          // public URL path e.g. /uploads/projects/... used by frontend
  thumbnailPath: { type: String, default: null },     // public URL to thumbnail (or null)
  mimetype: { type: String },
  originalName: { type: String },
  size: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attachment', attachmentSchema);
