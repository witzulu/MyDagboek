const Task = require('../models/Task');
const List = require('../models/List');
const Project = require('../models/Project');
const Board = require('../models/Board');

// @desc    Get progress report for a project
// @route   GET /api/projects/:projectId/progress-report
// @access  Private
exports.getProgressReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check: Ensure user is a member of the project
    const isMember = project.members.some(member => member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Find boards associated with the project
    const boards = await Board.find({ project: projectId });
    const boardIds = boards.map(b => b._id);

    // Find the ID of any list named "Optional"
    const optionalLists = await List.find({ board: { $in: boardIds }, name: 'Optional' });
    const optionalListIds = optionalLists.map(l => l._id);

    const baseQuery = { board: { $in: boardIds } };

    const createdAtFilter = {};
    if (startDate) createdAtFilter.$gte = new Date(startDate);
    if (endDate) createdAtFilter.$lte = new Date(endDate);
    const tasksCreatedQuery = (startDate || endDate) ? { ...baseQuery, createdAt: createdAtFilter } : baseQuery;
    const tasksCreated = await Task.countDocuments(tasksCreatedQuery);

    const completedAtFilter = {};
    if (startDate) completedAtFilter.$gte = new Date(startDate);
    if (endDate) completedAtFilter.$lte = new Date(endDate);
    const tasksCompletedQuery = (startDate || endDate) ? { ...baseQuery, completedAt: completedAtFilter } : baseQuery;
    const tasksCompleted = await Task.countDocuments(tasksCompletedQuery);

    const tasksOverdue = await Task.countDocuments({
      ...baseQuery,
      dueDate: { $lt: new Date() },
      completedAt: null,
    });

    const tasksInProgress = await Task.countDocuments({
      ...baseQuery,
      list: { $nin: optionalListIds },
      completedAt: null,
    });

    res.status(200).json({
      tasksCreated,
      tasksCompleted,
      tasksOverdue,
      tasksInProgress,
    });

  } catch (error) {
    next(error);
  }
};
