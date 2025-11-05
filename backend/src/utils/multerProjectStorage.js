// utils/multerProjectStorage.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

module.exports = function storageFactory(projectId, taskId) {
  // base uploads path (relative to project root)
  const baseUploads = path.join(process.cwd(), 'uploads', 'projects', projectId.toString(), taskId.toString());

  // ensure directories exist
  fs.mkdirSync(baseUploads, { recursive: true });
  // ensure thumbs folder exists too
  const thumbsDir = path.join(baseUploads, '_thumbs');
  fs.mkdirSync(thumbsDir, { recursive: true });

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, baseUploads);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
};
