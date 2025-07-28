const express = require('express');
const ProjectService = require('../services/ProjectService');

const router = express.Router();

// Initialize project service
let projectService = null;

// Initialize project service with database connection
const initializeProjectService = (db) => {
  if (!projectService) {
    projectService = new ProjectService(db);
  }
  return projectService;
};

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const service = initializeProjectService(req.app.locals.db);
    const projects = await service.getAllProjects();
    
    res.json({
      message: 'Projects retrieved successfully',
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Failed to get projects', 
      details: error.message 
    });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = initializeProjectService(req.app.locals.db);
    const project = await service.getProjectById(parseInt(id));
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({
      message: 'Project retrieved successfully',
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      error: 'Failed to get project', 
      details: error.message 
    });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const service = initializeProjectService(req.app.locals.db);
    const project = await service.createProject(name, description || '');
    
    res.status(201).json({
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    
    // Handle duplicate name error
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        error: 'Project name already exists', 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create project', 
      details: error.message 
    });
  }
});

// GET /api/projects/:id/statistics - Get project statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    const service = initializeProjectService(req.app.locals.db);
    const statistics = await service.getProjectStatistics(parseInt(id));
    
    res.json({
      message: 'Project statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to get project statistics', 
      details: error.message 
    });
  }
});

module.exports = router;