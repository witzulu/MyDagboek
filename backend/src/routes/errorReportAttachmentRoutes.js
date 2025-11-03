const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorReport = require('../models/ErrorReport');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const { addAttachment, deleteAttachment } = require('../controllers/errorReportAttachmentController');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const report = await ErrorReport.findById(req.params.id);
      if (!report) {
        return cb(new Error('Error report not found'), false);
      }
      const project = await Project.findById(report.project);
      if (!project) {
        return cb(new Error('Project not found for this report'), false);
      }
      const dir = path.join('uploads', project._id.toString());

      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          return cb(err, false);
        }
        cb(null, dir);
      });
    } catch (error) {
      cb(error, false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.route('/')
  .post(protect, upload.single('file'), addAttachment);

router.route('/:attachmentId')
  .delete(protect, deleteAttachment);

module.exports = router;
