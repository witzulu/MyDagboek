const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['project_invitation', 'mention', 'changelog_entry'],
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
