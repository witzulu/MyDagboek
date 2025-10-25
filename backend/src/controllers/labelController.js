const Label = require('../models/Label');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all labels for a project
// @route   GET /api/projects/:projectId/labels
// @access  Private
exports.getLabels = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const labels = await Label.find({ project: req.params.projectId });
    res.status(200).json(labels);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a label for a project
// @route   POST /api/projects/:projectId/labels
// @access  Private
exports.createLabel = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const label = await Label.create({
      name,
      color,
      project: req.params.projectId,
    });
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a label
// @route   PUT /api/labels/:id
// @access  Private
exports.updateLabel = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const label = await Label.findById(req.params.id).populate('project');

    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    if (label.project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    label.name = name ?? label.name;
    label.color = color ?? label.color;

    await label.save();
    res.status(200).json(label);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a label
// @route   DELETE /api/labels/:id
// @access  Private
exports.deleteLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id).populate('project');
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    if (label.project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove the label from any tasks that use it
    await Task.updateMany(
      { labels: label._id },
      { $pull: { labels: label._id } }
    );

    await label.deleteOne();
    res.status(200).json({ message: 'Label removed' });
  } catch (error) {
    next(error);
  }
};
