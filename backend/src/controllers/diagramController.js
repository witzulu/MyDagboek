const Diagram = require('../models/Diagram');
const Project = require('../models/Project');

// @desc    Get all diagrams for a project
// @route   GET /api/projects/:projectId/diagrams
// @access  Private
exports.getDiagrams = async (req, res) => {
  try {
    // Check if user is a member of the project
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    const isMember = project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
      return res.status(401).json({ msg: 'User not authorized for this project' });
    }

    const diagrams = await Diagram.find({ project: req.params.projectId });
    res.json(diagrams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a diagram
// @route   POST /api/projects/:projectId/diagrams
// @access  Private
exports.createDiagram = async (req, res) => {
  try {
    const { name, data } = req.body;

    // Check if user is a member of the project
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    const isMember = project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
      return res.status(401).json({ msg: 'User not authorized to create a diagram in this project' });
    }

    const newDiagram = new Diagram({
      name,
      data,
      project: req.params.projectId,
      user: req.user.id
    });

    const diagram = await newDiagram.save();
    res.status(201).json(diagram);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single diagram by ID
// @route   GET /api/diagrams/:id
// @access  Private
exports.getDiagramById = async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id).populate('project', 'members');
    if (!diagram) {
      return res.status(404).json({ msg: 'Diagram not found' });
    }

    // Check if user is a member of the project associated with the diagram
    const isMember = diagram.project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
        return res.status(401).json({ msg: 'User not authorized to view this diagram' });
    }

    res.json(diagram);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Diagram not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update a diagram
// @route   PUT /api/diagrams/:id
// @access  Private
exports.updateDiagram = async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id).populate('project', 'members');
    if (!diagram) {
      return res.status(404).json({ msg: 'Diagram not found' });
    }

    // Check if user is a member of the project
    const isMember = diagram.project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
        return res.status(401).json({ msg: 'User not authorized to update this diagram' });
    }

    const { name, data } = req.body;
    const updatedDiagram = await Diagram.findByIdAndUpdate(req.params.id, { $set: { name, data } }, { new: true });
    res.json(updatedDiagram);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Diagram not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a diagram
// @route   DELETE /api/diagrams/:id
// @access  Private
exports.deleteDiagram = async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id).populate('project', 'members');
    if (!diagram) {
      return res.status(404).json({ msg: 'Diagram not found' });
    }

    // Check if user is a member of the project
    const isMember = diagram.project.members.some(member => member && member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
        return res.status(401).json({ msg: 'User not authorized to delete this diagram' });
    }

    await Diagram.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Diagram removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Diagram not found' });
    }
    res.status(500).send('Server Error');
  }
};
