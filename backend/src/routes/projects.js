const express = require('express');
const router = express.Router();

const { getProgressReport } = require('../controllers/progressReportController');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  getProjectTasks
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);

// Member routes
router.route('/:id/members').get(protect, getProjectMembers).post(protect, addProjectMember);
router.route('/:id/members/:memberId').put(protect, updateProjectMemberRole).delete(protect, removeProjectMember);

// Nested snippet routes
const snippetRoutes = require('./snippets');
router.use('/:projectId/snippets', snippetRoutes);
router.get('/:projectId/progress-report', protect, getProgressReport);

// Tasks for project
router.route('/:id/tasks').get(protect, getProjectTasks);

module.exports = router;
