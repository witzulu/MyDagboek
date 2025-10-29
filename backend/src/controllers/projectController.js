const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logChange } = require('../utils/changeLogService');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query = { status: 'active' };
    if (req.user.role !== 'system_admin') {
      query['members.user'] = req.user.id;
    }
    const projects = await Project.find(query);
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a project member's role
// @route   PUT /api/projects/:id/members/:memberId
// @access  Private
exports.updateProjectMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Authorization: only owner/admin can update roles
    const requester = project.members.find(m => m.user && m.user.toString() === req.user.id);
    if (req.user.role !== 'system_admin' && (!requester || !['owner', 'admin'].includes(requester.role))) {
      return res.status(403).json({ msg: 'Access denied: You do not have permission to update roles.' });
    }

    const memberToUpdate = project.members.find(m => m.user && m.user.toString() === req.params.memberId);
    if (!memberToUpdate) {
      return res.status(404).json({ msg: 'Member not found in this project' });
    }

    // Prevent changing owner's role or assigning new owner
    if (memberToUpdate.role === 'owner' || role === 'owner') {
        return res.status(400).json({ msg: 'Cannot change or assign owner role' });
    }

    const oldRole = memberToUpdate.role;
    memberToUpdate.role = role;
    await project.save();

    // Log the change
    const memberUser = await User.findById(memberToUpdate.user);
    await logChange(project._id, req.user.id, `changed ${memberUser.name}'s role from ${oldRole} to ${role}.`, 'team');


    const updatedProject = await Project.findById(req.params.id);
    const members = await Promise.all(updatedProject.members.map(async (member) => {
        if (!member.user) return null;
        const user = await User.findById(member.user).select('name email');
        return {
            ...member.toObject(),
            user
        };
    }));

    res.json(members.filter(Boolean));
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Remove a project member
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private
exports.removeProjectMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Authorization: only owner/admin can remove members
        const requester = project.members.find(m => m.user && m.user.toString() === req.user.id);
        if (req.user.role !== 'system_admin' && (!requester || !['owner', 'admin'].includes(requester.role))) {
            return res.status(403).json({ msg: 'Access denied: You do not have permission to remove members.' });
        }

        const memberToRemove = project.members.find(m => m.user && m.user.toString() === req.params.memberId);
        if (!memberToRemove) {
            return res.status(404).json({ msg: 'Member not found in this project' });
        }

        // Prevent removing the owner
        if (memberToRemove.role === 'owner') {
            return res.status(400).json({ msg: 'Cannot remove the project owner' });
        }

        const memberUser = await User.findById(memberToRemove.user);
        await logChange(project._id, req.user.id, `removed ${memberUser.name} from the project.`, 'team');


        project.members = project.members.filter(m => m.user && m.user.toString() !== req.params.memberId);
        await project.save();

        const updatedProject = await Project.findById(req.params.id);
        const members = await Promise.all(updatedProject.members.map(async (member) => {
            if (!member.user) return null;
            const user = await User.findById(member.user).select('name email');
            return {
                ...member.toObject(),
                user
            };
        }));

        res.json(members.filter(Boolean));
    } catch (error) {
        console.error(error);
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

    // Bypass membership check for system_admin
    if (req.user.role !== 'system_admin') {
      const isMember = project.members.some(member => member.user && member.user._id.toString() === req.user.id);
      if (!isMember) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
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
      user: req.user.id, // Keep original creator reference for migration
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

  const projectFields = {};
  if (name) projectFields.name = name;
  if (description) projectFields.description = description;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Bypass membership check for system_admin
    if (req.user.role !== 'system_admin') {
      const member = project.members.find(m => m.user.toString() === req.user.id);
      if (!member || !['owner', 'admin'].includes(member.role)) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
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

    // Bypass membership check for system_admin
    if (req.user.role !== 'system_admin') {
      const member = project.members.find(m => m.user.toString() === req.user.id);
      if (!member || member.role !== 'owner') {
        return res.status(401).json({ msg: 'Not authorized' });
      }
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
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (req.user.role !== 'system_admin') {
        const isMember = project.members.some(member => member.user && member.user._id.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ msg: 'Access denied: You are not a member of this project.' });
        }
    }

    const members = await Promise.all(project.members.map(async (member) => {
        const user = await User.findById(member.user).select('name email');
        return {
            ...member.toObject(),
            user
        };
    }));

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Invite a user to a project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addProjectMember = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be email or username
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (req.user.role !== 'system_admin') {
        const requester = project.members.find(m => m.user && m.user.toString() === req.user.id);
        if (!requester || !['owner', 'admin'].includes(requester.role)) {
          return res.status(403).json({ msg: 'Access denied: You do not have permission to invite members.' });
        }
    }

    const userToInvite = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });

    if (!userToInvite) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (project.members.some(member => member.user && member.user.toString() === userToInvite.id)) {
        return res.status(400).json({ msg: 'User is already a member of this project' });
    }

    // Create a notification for the user
    const notification = new Notification({
      recipient: userToInvite._id,
      sender: req.user.id,
      type: 'project_invitation',
      project: project._id,
    });
    await notification.save();

    res.json({ msg: 'Invitation sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
