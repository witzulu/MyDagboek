const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

router.route('/').get(authMiddleware, getProjects).post(authMiddleware, createProject);
router.route('/:id').get(authMiddleware, getProjectById).put(authMiddleware, updateProject).delete(authMiddleware, deleteProject);

module.exports = router;
