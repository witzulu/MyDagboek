const Task = require('../models/Task');
const List = require('../models/List');
const Project = require('../models/Project');
const Board = require('../models/Board');
const ChangeLog = require('../models/ChangeLog');

// @desc    Get progress report for a project
// @route   GET /api/projects/:projectId/progress-report
// @access  Private
exports.getProgressReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    // --- Date Handling ---
    let endDateEndOfDay;
    if (endDate) {
      endDateEndOfDay = new Date(endDate);
      endDateEndOfDay.setUTCHours(23, 59, 59, 999);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const boards = await Board.find({ project: projectId });
    const boardIds = boards.map(b => b._id);
    const baseQuery = { board: { $in: boardIds } };

    const optionalLists = await List.find({ board: { $in: boardIds }, name: 'Optional' });
    const optionalListIds = optionalLists.map(l => l._id);

    // --- Metric Calculations ---
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = endDateEndOfDay;

    const tasksCreated = (startDate || endDate) ? await Task.countDocuments({ ...baseQuery, createdAt: dateFilter }) : await Task.countDocuments(baseQuery);
    const tasksCompleted = (startDate || endDate) ? await Task.countDocuments({ ...baseQuery, completedAt: dateFilter }) : await Task.countDocuments(baseQuery);
    const tasksOverdue = await Task.countDocuments({ ...baseQuery, dueDate: { $lt: new Date() }, completedAt: null });
    const tasksInProgress = await Task.countDocuments({ ...baseQuery, list: { $nin: optionalListIds }, completedAt: null });

    // --- Changelog Data ---
    const changelogQuery = { project: projectId, includeInReport: true };
    if (startDate || endDate) {
        changelogQuery.createdAt = dateFilter;
    }
    const changelogEntries = await ChangeLog.find(changelogQuery).populate('user', 'name').sort({ createdAt: 'desc' });


    // --- Chart Data Calculations ---
    let pieChartData = { done: 0, inProgress: 0, toDo: 0 };
    let barChartData = [];
    let burndownChartData = [];

    if (startDate && endDate) {
      // --- Pie Chart ---
      pieChartData.done = tasksCompleted;
      const todoLists = await List.find({ board: { $in: boardIds }, name: 'To-Do' });
      const todoListIds = todoLists.map(l => l._id);
      pieChartData.toDo = await Task.countDocuments({ ...baseQuery, createdAt: dateFilter, completedAt: null, list: { $in: todoListIds } });
      pieChartData.inProgress = await Task.countDocuments({ ...baseQuery, createdAt: dateFilter, completedAt: null, list: { $nin: [...todoListIds, ...optionalListIds] } });

      // --- Bar & Burndown Chart Data (Single Query) ---
      const dailyCompletions = await Task.aggregate([
        { $match: { ...baseQuery, completedAt: { $gte: new Date(startDate), $lte: endDateEndOfDay } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      barChartData = dailyCompletions.map(item => ({ date: item._id, count: item.count }));

      // --- Burndown Logic ---
      const totalWorkAtStart = await Task.countDocuments({
        ...baseQuery,
        createdAt: { $lt: new Date(startDate) },
        $or: [{ completedAt: null }, { completedAt: { $gt: new Date(startDate) } }],
      });
      const tasksCreatedDuring = await Task.countDocuments({ ...baseQuery, createdAt: dateFilter });
      let remainingWork = totalWorkAtStart + tasksCreatedDuring;

      const completionsMap = new Map(dailyCompletions.map(item => [item._id, item.count]));
      const dateCursor = new Date(startDate);

      while (dateCursor <= endDateEndOfDay) {
        const dateString = dateCursor.toISOString().split('T')[0];
        burndownChartData.push({ date: dateString, remaining: remainingWork });
        remainingWork -= completionsMap.get(dateString) || 0;
        dateCursor.setDate(dateCursor.getDate() + 1);
      }
    }

    res.status(200).json({
      tasksCreated,
      tasksCompleted,
      tasksOverdue,
      tasksInProgress,
      changelogEntries,
      pieChartData,
      barChartData,
      burndownChartData,
    });

  } catch (error) {
    console.error('💥 Error generating progress report:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};
