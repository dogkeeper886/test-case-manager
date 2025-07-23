const express = require('express');
const router = express.Router();
const { query } = require('../services/database');

// GET /api/testcases - Get all test cases
router.get('/', async (req, res) => {
  try {
    const { projectId, status, priority, limit = 100, offset = 0 } = req.query;
    
    let sql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (projectId) {
      sql += ` AND ts.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND tc.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      sql += ` AND tc.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    sql += ` ORDER BY tc.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      filters: { projectId, status, priority, limit, offset }
    });
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/testcases/:id - Get test case by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE tc.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching test case:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/testcases - Create a new test case
router.post('/', async (req, res) => {
  try {
    const {
      test_suite_id,
      title,
      description,
      prerequisites,
      execution_type = 1,
      external_id,
      version = 1,
      priority = 2,
      is_open = true,
      active = true,
      status = 1,
      estimated_duration
    } = req.body;
    
    const sql = `
      INSERT INTO test_cases (
        test_suite_id, title, description, prerequisites, execution_type,
        external_id, version, priority, is_open, active, status, estimated_duration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const params = [
      test_suite_id, title, description, prerequisites, execution_type,
      external_id, version, priority, is_open, active, status, estimated_duration
    ];
    
    const result = await query(sql, params);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Test case created successfully'
    });
  } catch (error) {
    console.error('Error creating test case:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/testcases/:id - Update test case
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      test_suite_id,
      title,
      description,
      prerequisites,
      execution_type,
      external_id,
      version,
      priority,
      is_open,
      active,
      status,
      estimated_duration
    } = req.body;
    
    const sql = `
      UPDATE test_cases SET
        test_suite_id = COALESCE($1, test_suite_id),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        prerequisites = COALESCE($4, prerequisites),
        execution_type = COALESCE($5, execution_type),
        external_id = COALESCE($6, external_id),
        version = COALESCE($7, version),
        priority = COALESCE($8, priority),
        is_open = COALESCE($9, is_open),
        active = COALESCE($10, active),
        status = COALESCE($11, status),
        estimated_duration = COALESCE($12, estimated_duration),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;
    
    const params = [
      test_suite_id, title, description, prerequisites, execution_type,
      external_id, version, priority, is_open, active, status, estimated_duration, id
    ];
    
    const result = await query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Test case updated successfully'
    });
  } catch (error) {
    console.error('Error updating test case:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/testcases/:id - Delete test case
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM test_cases WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.json({
      success: true,
      message: 'Test case deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting test case:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/testcases/project/:projectId - Get test cases by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const sql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE ts.project_id = $1
      ORDER BY tc.created_at DESC
    `;
    
    const result = await query(sql, [projectId]);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching test cases by project:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/testcases/suite/:suiteId - Get test cases by test suite
router.get('/suite/:suiteId', async (req, res) => {
  try {
    const { suiteId } = req.params;
    
    const sql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE tc.test_suite_id = $1
      ORDER BY tc.created_at DESC
    `;
    
    const result = await query(sql, [suiteId]);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching test cases by suite:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/testcases/search - Search test cases
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const sql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE 
        tc.title ILIKE $1 OR 
        tc.description ILIKE $1 OR
        tc.id::text = $2
      ORDER BY tc.created_at DESC
    `;
    
    const searchTerm = `%${q}%`;
    const result = await query(sql, [searchTerm, q]);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching test cases:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;