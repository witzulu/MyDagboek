const Label = require('../models/Label');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all labels for a project
// @route   GET /api/projects/:projectId/labels
// @access  Private
exports.getLabels = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).select('members');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const labels = await Label.find({
      $or: [{ project: req.params.projectId }, { project: null }],
    });
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
    const project = await Project.findById(req.params.projectId).select('members');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
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
    const label = await Label.findById(req.params.id);

    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    // Universal labels can be updated by any authenticated user for simplicity for now
    if (label.project) {
      const project = await Project.findById(label.project).select('members');
      if (!project) {
        return res.status(404).json({ message: 'Associated project not found' });
      }
      const isMember = project.members.some(member => member && member.user && member.user.toString() === req.user.id);
      if (!isMember && req.user.role !== 'system_admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }
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
    const label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    // Universal labels can be deleted by admins
    if (label.project) {
      const project = await Project.findById(label.project).select('members');
      if (!project) {
        // If project is null, we can assume it's okay to delete, maybe it was archived
      } else {
        const isMember = project.members.some(member => member && member.user && member.user.toString() === req.user.id);
        if (!isMember && req.user.role !== 'system_admin') {
          return res.status(401).json({ message: 'Not authorized' });
        }
      }
    } else if (req.user.role !== 'system_admin') {
      return res.status(401).json({ message: 'Only system admins can delete universal labels' });
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
