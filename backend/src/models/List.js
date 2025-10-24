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
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
