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

    // --- Date Handling ---
    // Adjust endDate to include the whole day
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
      console.error('❌ Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check
    const isMember = project.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember && req.user.role !== 'system_admin') {
      console.error('❌ Unauthorized: not a member or admin');
      return res.status(401).json({ message: 'User not authorized' });
    }

    const boards = await Board.find({ project: projectId });
    console.log(`📋 Found ${boards.length} boards`);
    const boardIds = boards.map(b => b._id);

    const optionalLists = await List.find({ board: { $in: boardIds }, name: 'Optional' });
    console.log(`📋 Found ${optionalLists.length} optional lists`);
    const optionalListIds = optionalLists.map(l => l._id);

    const baseQuery = { board: { $in: boardIds } };

    const createdAtFilter = {};
    if (startDate) createdAtFilter.$gte = new Date(startDate);
    if (endDate) createdAtFilter.$lte = endDateEndOfDay;
    const tasksCreatedQuery = (startDate || endDate) ? { ...baseQuery, createdAt: createdAtFilter } : baseQuery;
    const tasksCreated = await Task.countDocuments(tasksCreatedQuery);

    const completedAtFilter = {};
    if (startDate) completedAtFilter.$gte = new Date(startDate);
    if (endDate) completedAtFilter.$lte = endDateEndOfDay;
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

    // --- New Pie Chart Logic ---
    const pieChartDateFilter = {};
    if (startDate) pieChartDateFilter.$gte = new Date(startDate);
    if (endDate) pieChartDateFilter.$lte = endDateEndOfDay;

    let pieChartData = { done: 0, inProgress: 0, toDo: 0 };

    if (startDate || endDate) {
      // 1. Get tasks COMPLETED in the period
      pieChartData.done = await Task.countDocuments({
        ...baseQuery,
        completedAt: pieChartDateFilter,
      });

      // 2. Find IDs of 'To-Do' lists
      const todoLists = await List.find({ board: { $in: boardIds }, name: 'To-Do' });
      const todoListIds = todoLists.map(l => l._id);

      // 3. Count tasks CREATED in the period, NOT completed, and in a 'To-Do' list
      pieChartData.toDo = await Task.countDocuments({
        ...baseQuery,
        createdAt: pieChartDateFilter,
        completedAt: null,
        list: { $in: todoListIds },
      });

      // 4. Count tasks CREATED in the period, NOT completed, and NOT in 'To-Do' or 'Optional' lists
      pieChartData.inProgress = await Task.countDocuments({
        ...baseQuery,
        createdAt: pieChartDateFilter,
        completedAt: null,
        list: { $nin: [...todoListIds, ...optionalListIds] },
      });
    }

    // --- New Bar Chart Logic ---
    let barChartData = [];
    if (startDate && endDate) {
      barChartData = await Task.aggregate([
        {
          $match: {
            ...baseQuery,
            completedAt: {
              $gte: new Date(startDate),
              $lte: endDateEndOfDay,
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } },
      ]);
    }


    console.log('✅ Report generated successfully');

    res.status(200).json({
      tasksCreated,
      tasksCompleted,
      tasksOverdue,
      tasksInProgress,
      pieChartData,
      barChartData,
    });

  } catch (error) {
    console.error('💥 Error generating progress report:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
};
