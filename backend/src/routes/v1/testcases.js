const express = require('express');
const router = express.Router();
const { query } = require('../../services/database');
const ActivityService = require('../../services/ActivityService');
const { validateTestCase, validatePagination } = require('../../middleware/validation');
const { NotFoundError } = require('../../middleware/errorHandler');

// GET /api/v1/test-cases - Get all test cases with enhanced filtering and pagination
router.get('/', validatePagination, async (req, res, next) => {
  try {
    const { 
      projectId, 
      test_suite_id, 
      status, 
      priority, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    // Build the WHERE clause for both queries
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (projectId) {
      whereClause += ` AND ts.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }
    
    if (test_suite_id) {
      whereClause += ` AND tc.test_suite_id = $${paramIndex}`;
      params.push(test_suite_id);
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
    
    // Query 1: Get total count
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
      ORDER BY tc.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);
    
    // Enhanced response format
    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/test-cases - Create a new test case
router.post('/', validateTestCase, async (req, res, next) => {
  try {
    const {
      project_id,
      test_suite_id,
      title,
      description = '',
      prerequisites = '',
      test_steps,
      expected_result,
      priority = 'medium',
      execution_type = 1,
      importance = 2
    } = req.body;

    const insertSql = `
      INSERT INTO test_cases (
        project_id, test_suite_id, title, description, prerequisites,
        test_steps, expected_result, priority, execution_type, importance,
        status, is_open, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, true, true)
      RETURNING *
    `;

    const result = await query(insertSql, [
      project_id, test_suite_id, title, description, prerequisites,
      test_steps, expected_result, priority, execution_type, importance
    ]);

    if (result.rows.length === 0) {
      throw new Error('Failed to create test case');
    }

    const testCase = result.rows[0];

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'create',
        entity_type: 'test_case',
        entity_id: testCase.id,
        entity_name: testCase.title,
        description: `Created test case: ${testCase.title}`,
        metadata: { project_id, test_suite_id }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.status(201).json({
      message: 'Test case created successfully',
      data: testCase
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/test-cases/:id - Get test case by ID
router.get('/:id', async (req, res, next) => {
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
      throw new NotFoundError(`Test case with ID ${id} not found`);
    }

    res.json({
      message: 'Test case retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/test-cases/:id - Update test case
router.put('/:id', validateTestCase, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      prerequisites,
      test_steps,
      expected_result,
      priority,
      execution_type,
      importance,
      status
    } = req.body;

    // Check if test case exists
    const checkSql = 'SELECT id, title FROM test_cases WHERE id = $1';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Test case with ID ${id} not found`);
    }

    const updateSql = `
      UPDATE test_cases 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        prerequisites = COALESCE($4, prerequisites),
        test_steps = COALESCE($5, test_steps),
        expected_result = COALESCE($6, expected_result),
        priority = COALESCE($7, priority),
        execution_type = COALESCE($8, execution_type),
        importance = COALESCE($9, importance),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateSql, [
      id, title, description, prerequisites, test_steps, 
      expected_result, priority, execution_type, importance, status
    ]);

    const testCase = result.rows[0];

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'update',
        entity_type: 'test_case',
        entity_id: testCase.id,
        entity_name: testCase.title,
        description: `Updated test case: ${testCase.title}`,
        metadata: { updated_fields: Object.keys(req.body) }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json({
      message: 'Test case updated successfully',
      data: testCase
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/test-cases/:id - Delete test case
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if test case exists
    const checkSql = 'SELECT id, title FROM test_cases WHERE id = $1';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Test case with ID ${id} not found`);
    }

    const testCase = checkResult.rows[0];

    // Delete test case
    const deleteSql = 'DELETE FROM test_cases WHERE id = $1';
    await query(deleteSql, [id]);

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'delete',
        entity_type: 'test_case',
        entity_id: parseInt(id),
        entity_name: testCase.title,
        description: `Deleted test case: ${testCase.title}`,
        metadata: {}
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json({
      message: 'Test case deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;