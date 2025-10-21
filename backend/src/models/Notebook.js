const mongoose = require('mongoose');

const NotebookSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Notebook', NotebookSchema);
