const express = require('express');
const router = express.Router();
const { query } = require('../services/database');

// GET /api/testsuites - Get all test suites
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        ts.*,
        p.name as project_name,
        COUNT(tc.id) as test_case_count
      FROM test_suites ts
      LEFT JOIN projects p ON ts.project_id = p.id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      GROUP BY ts.id, p.name
      ORDER BY ts.created_at DESC
    `;
    
    const result = await query(sql);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching test suites:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/testsuites/:id - Get test suite by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        ts.*,
        p.name as project_name,
        COUNT(tc.id) as test_case_count
      FROM test_suites ts
      LEFT JOIN projects p ON ts.project_id = p.id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      WHERE ts.id = $1
      GROUP BY ts.id, p.name
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching test suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/testsuites - Create a new test suite
router.post('/', async (req, res) => {
  try {
    const { project_id, name, description } = req.body;
    
    const sql = `
      INSERT INTO test_suites (project_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await query(sql, [project_id, name, description]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Test suite created successfully'
    });
  } catch (error) {
    console.error('Error creating test suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/testsuites/:id - Update test suite
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { project_id, name, description } = req.body;
    
    const sql = `
      UPDATE test_suites SET
        project_id = COALESCE($1, project_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await query(sql, [project_id, name, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Test suite updated successfully'
    });
  } catch (error) {
    console.error('Error updating test suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/testsuites/:id - Delete test suite
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM test_suites WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    res.json({
      success: true,
      message: 'Test suite deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting test suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/testsuites/project/:projectId - Get test suites by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const sql = `
      SELECT 
        ts.*,
        p.name as project_name,
        COUNT(tc.id) as test_case_count
      FROM test_suites ts
      LEFT JOIN projects p ON ts.project_id = p.id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      WHERE ts.project_id = $1
      GROUP BY ts.id, p.name
      ORDER BY ts.created_at DESC
    `;
    
    const result = await query(sql, [projectId]);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching test suites by project:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 