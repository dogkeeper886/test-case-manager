const express = require('express');
const router = express.Router();
const { query } = require('../services/database');
const ActivityService = require('../services/ActivityService');

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT * FROM projects ORDER BY created_at DESC';
    const result = await query(sql);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM projects WHERE id = $1';
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const sql = `
      INSERT INTO projects (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await query(sql, [name, description]);
    
    // Log activity
    await ActivityService.logProjectActivity(
      'project_create',
      result.rows[0].id,
      result.rows[0].name,
      `Project "${result.rows[0].name}" was created`
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const sql = `
      UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [name, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Log activity
    await ActivityService.logProjectActivity(
      'project_update',
      result.rows[0].id,
      result.rows[0].name,
      `Project "${result.rows[0].name}" was updated`
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Log activity
    await ActivityService.logProjectActivity(
      'project_delete',
      result.rows[0].id,
      result.rows[0].name,
      `Project "${result.rows[0].name}" was deleted`
    );
    
    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;