const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Label', labelSchema);
