const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const protect = require('../middleware/authMiddleware');
const boardRouter = require('./boards'); // Import board router

router.use('/:projectId/boards', boardRouter); // Nest the board routes

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;
