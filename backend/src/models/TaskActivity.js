const mongoose = require('mongoose');

const TaskActivitySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_TASK',
      'UPDATE_TITLE',
      'UPDATE_DESCRIPTION',
      'UPDATE_PRIORITY',
      'UPDATE_DUE_DATE',
      'ADD_ASSIGNEE',
      'REMOVE_ASSIGNEE',
      'ADD_LABEL',
      'REMOVE_LABEL',
      'MOVE_TASK',
      'COMPLETE_TASK',
      'ADD_COMMENT',
      'DELETE_TASK',
    ],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

module.exports = mongoose.model('TaskActivity', TaskActivitySchema);
