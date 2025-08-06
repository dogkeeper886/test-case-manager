const express = require('express');
const router = express.Router();
const { query } = require('../services/database');
const ActivityService = require('../services/ActivityService');

// GET /api/testcases - Get all test cases
router.get('/', async (req, res) => {
  try {
    const { projectId, status, priority, limit = 100, offset = 0 } = req.query;
    
    // Build the WHERE clause for both queries
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (projectId) {
      whereClause += ` AND ts.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }
    
    if (status) {
      whereClause += ` AND tc.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      whereClause += ` AND tc.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    // Query 1: Get total count (without LIMIT/OFFSET)
    const countSql = `
      SELECT COUNT(*) as total_count
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      ${whereClause}
    `;
    
    const countResult = await query(countSql, params);
    const totalCount = parseInt(countResult.rows[0].total_count);
    
    // Query 2: Get paginated data
    const dataSql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      ${whereClause}
      ORDER BY tc.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataParams = [...params, parseInt(limit), parseInt(offset)];
    const dataResult = await query(dataSql, dataParams);
    
    res.json({
      success: true,
      data: dataResult.rows,
      total: totalCount,
      returned: dataResult.rows.length,
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
    
    // Get test case with related data
    const testCaseSql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE tc.id = $1
    `;
    
    const testCaseResult = await query(testCaseSql, [id]);
    
    if (testCaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    const testCase = testCaseResult.rows[0];
    
    // Get test steps for this test case
    const stepsSql = `
      SELECT 
        id, step_number, action, expected_result, execution_type
      FROM test_steps 
      WHERE test_case_id = $1 
      ORDER BY step_number ASC
    `;
    
    const stepsResult = await query(stepsSql, [id]);
    
    // Get custom fields for this test case
    const customFieldsSql = `
      SELECT 
        id, field_name, field_value
      FROM custom_fields 
      WHERE test_case_id = $1
    `;
    
    const customFieldsResult = await query(customFieldsSql, [id]);
    
    // Combine all data
    const enrichedTestCase = {
      ...testCase,
      steps: stepsResult.rows,
      custom_fields: customFieldsResult.rows
    };
    
    res.json({
      success: true,
      data: enrichedTestCase
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
      project_id, // CRITICAL FIX: Accept project_id from request body
      test_suite_id,
      title,
      description,
      prerequisites,
      execution_type = 1,
      external_id,
      version = '1.0', // Fixed: Accept string version, default to '1.0'
      priority = 2,
      is_open = true,
      active = true,
      status = 1,
      estimated_duration,
      // Added missing TestLink fields
      internal_id,
      importance = 2,
      node_order = 0
    } = req.body;
    
    const sql = `
      INSERT INTO test_cases (
        project_id, test_suite_id, title, description, prerequisites, execution_type,
        external_id, version, priority, is_open, active, status, estimated_duration,
        internal_id, importance, node_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const params = [
      project_id, test_suite_id, title, description, prerequisites, execution_type,
      external_id, version, priority, is_open, active, status, estimated_duration,
      internal_id, importance, node_order
    ];
    
    const result = await query(sql, params);
    const testCaseId = result.rows[0].id;
    
    // Handle structured test steps if provided
    const { steps } = req.body;
    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        const stepSql = `
          INSERT INTO test_steps (
            test_case_id, step_number, action, expected_result, execution_type
          ) VALUES ($1, $2, $3, $4, $5)
        `;
        await query(stepSql, [
          testCaseId,
          step.step_number,
          step.action,
          step.expected_result,
          step.execution_type || 1
        ]);
      }
    }
    
    // Log activity
    await ActivityService.logTestCaseActivity(
      'test_case_create',
      testCaseId,
      result.rows[0].title,
      `Test case "${result.rows[0].title}" was created`
    );
    
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

// PUT /api/testcases/:id - Update test case with steps
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { steps, ...testCaseData } = req.body;
    
    // Update main test case fields
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
    } = testCaseData;
    
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
    
    // Update test steps if provided
    if (steps && Array.isArray(steps)) {
      try {
        // Delete existing test steps for this test case
        await query('DELETE FROM test_steps WHERE test_case_id = $1', [id]);
        
        // Insert updated test steps
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const stepSql = `
            INSERT INTO test_steps (
              test_case_id, step_number, action, expected_result, execution_type
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          
          await query(stepSql, [
            id,
            step.step_number || (i + 1),
            step.actions || step.action || '',
            step.expected_results || step.expected_result || '',
            step.execution_type || 1
          ]);
        }
      } catch (stepError) {
        console.error('Error updating test steps:', stepError);
        // Continue with the response even if step update fails
        // The main test case was updated successfully
      }
    }
    
    // Get updated test case with steps
    const updatedTestCaseSql = `
      SELECT 
        tc.*,
        ts.name as test_suite_name,
        p.name as project_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      LEFT JOIN projects p ON ts.project_id = p.id
      WHERE tc.id = $1
    `;
    
    const updatedTestCaseResult = await query(updatedTestCaseSql, [id]);
    const updatedTestCase = updatedTestCaseResult.rows[0];
    
    // Get test steps for this test case
    const stepsSql = `
      SELECT 
        id, step_number, action, expected_result, execution_type
      FROM test_steps 
      WHERE test_case_id = $1 
      ORDER BY step_number ASC
    `;
    
    const stepsResult = await query(stepsSql, [id]);
    
    // Get custom fields for this test case
    const customFieldsSql = `
      SELECT 
        id, field_name, field_value
      FROM custom_fields 
      WHERE test_case_id = $1
    `;
    
    const customFieldsResult = await query(customFieldsSql, [id]);
    
    // Combine all data
    const enrichedTestCase = {
      ...updatedTestCase,
      steps: stepsResult.rows,
      custom_fields: customFieldsResult.rows
    };
    
    // Log activity
    await ActivityService.logTestCaseActivity(
      'test_case_update',
      enrichedTestCase.id,
      enrichedTestCase.title,
      `Test case "${enrichedTestCase.title}" was updated${steps && steps.length > 0 ? ' with test steps' : ''}`
    );
    
    res.json({
      success: true,
      data: enrichedTestCase,
      message: `Test case updated successfully${steps && steps.length > 0 ? ' with test steps' : ''}`
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
    
    // Log activity
    await ActivityService.logTestCaseActivity(
      'test_case_delete',
      result.rows[0].id,
      result.rows[0].title,
      `Test case "${result.rows[0].title}" was deleted`
    );
    
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