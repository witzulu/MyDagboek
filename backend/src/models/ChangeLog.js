const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual',
  },
  includeInReport: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['board', 'note', 'team', 'report', 'snippet', 'manual'],
    default: 'manual',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ChangeLog', changeLogSchema);
