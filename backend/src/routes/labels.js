const express = require('express');
const { getLabels, createLabel, updateLabel, deleteLabel } = require('../controllers/labelController');
const { protect } = require('../middleware/authMiddleware');

const projectLabelsRouter = express.Router({ mergeParams: true });
projectLabelsRouter.route('/').get(protect, getLabels).post(protect, createLabel);

const labelRouter = express.Router();
labelRouter.route('/:id').put(protect, updateLabel).delete(protect, deleteLabel);

module.exports = { projectLabelsRouter, labelRouter };
