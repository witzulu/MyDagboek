const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  getDiagrams,
  createDiagram,
  getDiagramById,
  updateDiagram,
  deleteDiagram
} = require('../controllers/diagramController');

// Routes for /api/projects/:projectId/diagrams
router.route('/')
  .get(protect, getDiagrams)
  .post(protect, createDiagram);

// Routes for /api/diagrams/:id
// Note: These need a separate router as they are not nested under projects
const singleDiagramRouter = express.Router();
singleDiagramRouter.route('/:id')
  .get(protect, getDiagramById)
  .put(protect, updateDiagram)
  .delete(protect, deleteDiagram);

module.exports = { projectDiagrams: router, diagrams: singleDiagramRouter };
