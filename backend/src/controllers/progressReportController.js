const Task = require('../models/Task');
const List = require('../models/List');
const Project = require('../models/Project');
const Board = require('../models/Board');
const ChangeLog = require('../models/ChangeLog');
const { logChange } = require('../utils/changeLogService');

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

    console.log(`🧭 Generating progress report for project ${projectId}`);
    console.log(`Dates: ${startDate || 'none'} → ${endDate || 'none'}`);
    console.log(`User: ${req.user ? req.user.id : 'no user found'}`);

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

    // --- Team Insights Calculation ---
    const populatedProjectForInsights = await Project.findById(projectId).populate('members.user', 'name');
    let teamInsights = [];

    if (populatedProjectForInsights && populatedProjectForInsights.members) {
        for (const member of populatedProjectForInsights.members) {
            if (!member.user) continue;

            const memberId = member.user._id;

            const completedConditions = { ...baseQuery, assignees: memberId };
            if (startDate || endDate) {
                completedConditions.completedAt = dateFilter;
            } else {
                completedConditions.completedAt = { $ne: null };
            }

            const completedCount = await Task.countDocuments(completedConditions);

            const assignedCount = await Task.countDocuments({
                ...baseQuery,
                assignees: memberId,
                completedAt: null,
            });

            teamInsights.push({
                userName: member.user.name,
                tasksCompleted: completedCount,
                tasksAssigned: assignedCount,
            });
        }
    }

    // --- Chart Data Calculations ---
  /*  let pieChartData = { done: 0, inProgress: 0, toDo: 0 };
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
    }*/

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
      teamInsights,
    });

    // Log the report generation after sending the response
    await logChange(projectId, req.user.id, `Generated a progress report for the period ${startDate || 'the beginning'} to ${endDate || 'today'}`, 'report');

  } catch (error) {
    console.error('💥 Error generating progress report:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};

// @desc    Get data for the main reports dashboard
// @route   GET /api/reports/dashboard
// @access  Private
exports.getReportDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get all projects for the user
    const projects = await Project.find({ 'members.user': userId });
    const projectIds = projects.map(p => p._id);

    const boards = await Board.find({ project: { $in: projectIds } });
    const boardIds = boards.map(b => b._id);
    const baseQuery = { board: { $in: boardIds } };

    // 2. Calculate tasks completed per day for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);


    const dailyCompletions = await Task.aggregate([
      { $match: { ...baseQuery, completedAt: { $gte: fourteenDaysAgo, $lte: today } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const completionTrend = [];
    const dateCursor = new Date(fourteenDaysAgo);
    const completionsMap = new Map(dailyCompletions.map(item => [item._id, item.count]));

    while (dateCursor <= today) {
        const dateString = dateCursor.toISOString().split('T')[0];
        completionTrend.push({ date: dateString, count: completionsMap.get(dateString) || 0 });
        dateCursor.setDate(dateCursor.getDate() + 1);
    }

    // 3. Calculate total overdue tasks
    const totalOverdue = await Task.countDocuments({ ...baseQuery, dueDate: { $lt: new Date() }, completedAt: null });

    // 4. Get recent achievements
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAchievements = await ChangeLog.find({
      project: { $in: projectIds },
      includeInReport: true,
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('user', 'name')
    .populate('project', 'name')
    .sort({ createdAt: 'desc' })
    .limit(10);

    // 5. Calculate Top 5 Team Insights
    const fourteenDaysAgoForInsights = new Date();
    fourteenDaysAgoForInsights.setDate(fourteenDaysAgoForInsights.getDate() - 14);

    const memberStats = await Task.aggregate([
        { $match: { board: { $in: boardIds }, assignees: { $exists: true, $ne: [] } } },
        { $unwind: "$assignees" },
        {
            $group: {
                _id: "$assignees",
                tasksCompleted: {
                    $sum: {
                        $cond: [{
                            $and: [
                                { $gte: ["$completedAt", fourteenDaysAgoForInsights] },
                                { $lte: ["$completedAt", today] }
                            ]
                        }, 1, 0]
                    }
                },
                tasksAssigned: {
                    $sum: { $cond: [{ $eq: ["$completedAt", null] }, 1, 0] }
                }
            }
        },
        { $sort: { tasksCompleted: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: "$userDetails" },
        {
            $project: {
                _id: 0,
                userName: "$userDetails.name",
                tasksCompleted: "$tasksCompleted",
                tasksAssigned: "$tasksAssigned"
            }
        }
    ]);

    res.status(200).json({
      completionTrend,
      totalOverdue,
      recentAchievements,
      teamInsights: memberStats,
    });

  } catch (error) {
    console.error('💥 Error getting report dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
