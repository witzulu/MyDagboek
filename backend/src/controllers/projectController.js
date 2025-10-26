const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user.id, status: 'active' });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all members for a project
// @route   GET /api/projects/:projectId/members
// @access  Private
exports.getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Ensure the user is a member of the project
    if (!project.members.some(member => member._id.equals(req.user.id))) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(project.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a member to a project
// @route   POST /api/projects/:projectId/members
// @access  Private
exports.addProjectMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Ensure the user is the project owner
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ msg: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    const populatedProject = await Project.findById(req.params.projectId).populate('members', 'name email');

    res.json(populatedProject.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Make sure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const newProject = new Project({
      name,
      description,
      user: req.user.id,
      members: [req.user.id]
    });

    const project = await newProject.save();

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  const { name, description } = req.body;

  // Build project object
  const projectFields = {};
  if (name) projectFields.name = name;
  if (description) projectFields.description = description;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Make sure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Make sure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: { status: 'deleted' } },
        { new: true }
    );

    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
