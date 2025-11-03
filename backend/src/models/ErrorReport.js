const mongoose = require('mongoose');

const errorReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['Critical', 'High', 'Medium', 'Low', 'Trivial'],
      default: 'Medium',
    },
    status: {
      type: String,
      required: true,
      enum: ['New', 'In Progress', 'Resolved', 'Verified', 'Closed'],
      default: 'New',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ErrorReport = mongoose.model('ErrorReport', errorReportSchema);

module.exports = ErrorReport;
