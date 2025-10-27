const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    // Find projects where the user is a member
    const projects = await Project.find({ 'members.user': req.user.id, status: 'active' });
    res.json(projects);
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
    const project = await Project.findById(req.params.id).populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Make sure user is a member of the project
    const isMember = project.members.some(member => member.user && member.user._id.toString() === req.user.id);
    if (!isMember) {
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
      members: [{ user: req.user.id, role: 'owner' }]
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

    // Make sure user is owner or admin
    const member = project.members.find(m => m.user.toString() === req.user.id);
    if (!member || !['owner', 'admin'].includes(member.role)) {
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

    // Make sure user is owner
    const member = project.members.find(m => m.user.toString() === req.user.id);
    if (!member || member.role !== 'owner') {
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


// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user', 'name email role status');

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Ensure the requesting user is a member of the project
    const isMember = project.members.some(member => member.user && member.user._id.toString() === req.user.id);
    if (!isMember) {
        return res.status(403).json({ msg: 'Access denied: You are not a member of this project.' });
    }

    res.json(project.members);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a project member
// @route   POST /api/projects/:id/members
// @access  Private
exports.addProjectMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Ensure the requesting user is an owner or admin of the project
    const requester = project.members.find(m => m.user.toString() === req.user.id);
    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      return res.status(403).json({ msg: 'Access denied: You do not have permission to add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (project.members.some(member => member.user.toString() === userToAdd.id)) {
        return res.status(400).json({ msg: 'User is already a member of this project' });
    }

    project.members.push({ user: userToAdd.id, role: role || 'member' });
    await project.save();

    const updatedProject = await Project.findById(req.params.id).populate('members.user', 'name email');

    res.json(updatedProject.members);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
