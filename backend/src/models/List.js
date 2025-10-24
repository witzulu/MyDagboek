const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for tasks
listSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'list',
  options: { sort: { position: 'asc' } } // Sort tasks by position when populating
});

module.exports = mongoose.model('List', listSchema);
