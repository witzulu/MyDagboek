const ErrorReport = require('../models/ErrorReport');
const Project = require('../models/Project');

// @desc    Create a new error report for a project
// @route   POST /api/projects/:projectId/errors
// @access  Private
exports.createErrorReport = async (req, res) => {
  try {
    const { title, description, severity, status } = req.body;
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if the user is a member of the project
    const isMember = project.members.some(member => member.user.toString() === userId);
    if (!isMember && project.user.toString() !== userId) { // Also check the project owner
      return res.status(401).json({ msg: 'Not authorized to create reports for this project' });
    }

    const newReport = new ErrorReport({
      title,
      description,
      severity,
      status,
      project: projectId,
      createdBy: userId,
    });

    const errorReport = await newReport.save();
    res.status(201).json(errorReport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update an error report
// @route   PUT /api/errors/:id
// @access  Private
exports.updateErrorReport = async (req, res) => {
  try {
    const { title, description, severity, status } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    let report = await ErrorReport.findById(id);

    if (!report) {
      return res.status(404).json({ msg: 'Error report not found' });
    }

    const project = await Project.findById(report.project);

    if (!project) {
      return res.status(404).json({ msg: 'Associated project not found' });
    }

    // Check if the user is a member of the project
    const isMember = project.members.some(member => member.user && member.user.toString() === userId);
    if (!isMember && project.user.toString() !== userId) { // Also check the project owner
        return res.status(401).json({ msg: 'Not authorized to update reports for this project' });
    }

    // Update fields
    report.title = title || report.title;
    report.description = description || report.description;
    report.severity = severity || report.severity;
    report.status = status || report.status;

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all error reports for a project
// @route   GET /api/projects/:projectId/errors
// @access  Private
exports.getErrorReports = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if the user is a member of the project
    const isMember = project.members.some(member => member.user.toString() === userId);
    if (!isMember && project.user.toString() !== userId) { // Also check the project owner
      return res.status(401).json({ msg: 'Not authorized to view reports for this project' });
    }

    const errorReports = await ErrorReport.find({ project: projectId }).populate('createdBy', 'username');
    res.json(errorReports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
