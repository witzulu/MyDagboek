const Label = require('../models/Label');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all universal labels
// @route   GET /api/admin/labels
// @access  Admin
exports.getUniversalLabels = async (req, res, next) => {
  try {
    const labels = await Label.find({ project: { $exists: false } });
    res.status(200).json(labels);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a universal label
// @route   POST /api/admin/labels
// @access  Admin
exports.createUniversalLabel = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const label = await Label.create({ name, color });
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a universal label
// @route   PUT /api/admin/labels/:id
// @access  Admin
exports.updateUniversalLabel = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const label = await Label.findById(req.params.id);

    if (!label || label.project) {
      return res.status(404).json({ message: 'Universal label not found' });
    }

    // "Detach and Localize"
    const tasksToUpdate = await Task.find({ labels: label._id }).populate('project');
    const projects = [...new Set(tasksToUpdate.map(t => t.project))];

    for (const project of projects) {
        const newLocalLabel = await Label.create({
            name: label.name,
            color: label.color,
            project: project._id,
        });

        const projectTasks = tasksToUpdate.filter(t => t.project._id.equals(project._id));
        for (const task of projectTasks) {
            task.labels.pull(label._id);
            task.labels.push(newLocalLabel._id);
            await task.save();
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

// @desc    Delete a universal label
// @route   DELETE /api/admin/labels/:id
// @access  Admin
exports.deleteUniversalLabel = async (req, res, next) => {
  try {
    const label = await Label.findById(req.params.id);

    if (!label || label.project) {
      return res.status(404).json({ message: 'Universal label not found' });
    }

    // "Detach and Localize"
    const tasksToUpdate = await Task.find({ labels: label._id }).populate('project');
    const projects = [...new Set(tasksToUpdate.map(t => t.project))];

    for (const project of projects) {
        const newLocalLabel = await Label.create({
            name: label.name,
            color: label.color,
            project: project._id,
        });

        const projectTasks = tasksToUpdate.filter(t => t.project._id.equals(project._id));
        for (const task of projectTasks) {
            task.labels.pull(label._id);
            task.labels.push(newLocalLabel._id);
            await task.save();
        }
    }

    await label.deleteOne();
    res.status(200).json({ message: 'Universal label removed' });
  } catch (error) {
    next(error);
  }
};
