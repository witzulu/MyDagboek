const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject, getProjectMembers, addProjectMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);

// Member routes
router.route('/:id/members').get(protect, getProjectMembers).post(protect, addProjectMember);

// Nested snippet routes
const snippetRoutes = require('./snippets');
router.use('/:projectId/snippets', snippetRoutes);

module.exports = router;
