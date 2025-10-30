const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getFolders,
  createFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getFolders).post(protect, createFolder);

const folderRouter = express.Router();
const {
    updateFolder,
    deleteFolder,
} = require('../controllers/folderController');

folderRouter.route('/:id').put(protect, updateFolder).delete(protect, deleteFolder);

module.exports = { projectFoldersRouter: router, folderRouter };
