const express = require('express');
const router = express.Router();
const { query } = require('../../services/database');
const ActivityService = require('../../services/ActivityService');
const { validateProject, validatePagination } = require('../../middleware/validation');
const { NotFoundError } = require('../../middleware/errorHandler');

// GET /api/v1/projects - Get all projects
router.get('/', validatePagination, async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, status } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total_count FROM projects ${whereClause}`;
    const countResult = await query(countSql, params);
    const totalCount = parseInt(countResult.rows[0].total_count);
    
    // Get paginated data
    const dataSql = `
      SELECT 
        p.*,
        COUNT(ts.id) as test_suite_count,
        COUNT(tc.id) as test_case_count
      FROM projects p
      LEFT JOIN test_suites ts ON p.id = ts.project_id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataParams = [...params, limit, offset];
    const result = await query(dataSql, dataParams);
    
    res.json({
      message: 'Projects retrieved successfully',
      data: result.rows,
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

// POST /api/v1/projects - Create a new project
router.post('/', validateProject, async (req, res, next) => {
  try {
    const { name, description = '', status = 'active' } = req.body;

    const sql = `
      INSERT INTO projects (name, description, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await query(sql, [name, description, status]);
    const project = result.rows[0];

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'create',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.name,
        description: `Created project: ${project.name}`,
        metadata: { status }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.status(201).json({
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/projects/:id - Get project by ID with statistics
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        COUNT(DISTINCT ts.id) as test_suite_count,
        COUNT(DISTINCT tc.id) as test_case_count,
        COUNT(DISTINCT CASE WHEN tc.status = 2 THEN tc.id END) as passed_count,
        COUNT(DISTINCT CASE WHEN tc.status = 3 THEN tc.id END) as failed_count,
        COUNT(DISTINCT CASE WHEN tc.status = 4 THEN tc.id END) as blocked_count
      FROM projects p
      LEFT JOIN test_suites ts ON p.id = ts.project_id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    res.json({
      message: 'Project retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/projects/:id - Update project
router.put('/:id', validateProject, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Check if project exists
    const checkSql = 'SELECT id, name FROM projects WHERE id = $1';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    const updateSql = `
      UPDATE projects 
      SET 
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateSql, [id, name, description, status]);
    const project = result.rows[0];

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'update',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.name,
        description: `Updated project: ${project.name}`,
        metadata: { updated_fields: Object.keys(req.body) }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json({
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/projects/:id - Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists and get test case count
    const checkSql = `
      SELECT 
        p.id, 
        p.name,
        COUNT(tc.id) as test_case_count
      FROM projects p
      LEFT JOIN test_suites ts ON p.id = ts.project_id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `;
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    const project = checkResult.rows[0];

    // Delete project (cascade will handle test suites and test cases)
    const deleteSql = 'DELETE FROM projects WHERE id = $1';
    await query(deleteSql, [id]);

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'delete',
        entity_type: 'project',
        entity_id: parseInt(id),
        entity_name: project.name,
        description: `Deleted project: ${project.name}`,
        metadata: { 
          test_case_count: project.test_case_count,
          warning: 'Cascaded deletion of test suites and test cases'
        }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json({
      message: 'Project deleted successfully',
      warning: `${project.test_case_count} associated test cases were also deleted`
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/projects/:id/bulk-test-cases - Create multiple test cases at once
router.post('/:id/bulk-test-cases', async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { test_cases } = req.body;

    if (!Array.isArray(test_cases) || test_cases.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'test_cases must be a non-empty array'
      });
    }

    // Check if project exists
    const checkSql = 'SELECT id, name FROM projects WHERE id = $1';
    const checkResult = await query(checkSql, [projectId]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Project with ID ${projectId} not found`);
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < test_cases.length; i++) {
      try {
        const testCase = test_cases[i];
        
        // Validate required fields
        if (!testCase.title || !testCase.test_steps || !testCase.expected_result) {
          errors.push({
            index: i,
            error: 'Missing required fields: title, test_steps, expected_result'
          });
          continue;
        }

        const insertSql = `
          INSERT INTO test_cases (
            project_id, test_suite_id, title, description, prerequisites,
            test_steps, expected_result, priority, execution_type, importance,
            status, is_open, active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, true, true)
          RETURNING *
        `;

        const result = await query(insertSql, [
          projectId,
          testCase.test_suite_id || null,
          testCase.title,
          testCase.description || '',
          testCase.prerequisites || '',
          testCase.test_steps,
          testCase.expected_result,
          testCase.priority || 'medium',
          testCase.execution_type || 1,
          testCase.importance || 2
        ]);

        results.push(result.rows[0]);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    // Log bulk creation activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'create',
        entity_type: 'test_case',
        entity_id: projectId,
        entity_name: `Bulk creation in project ${checkResult.rows[0].name}`,
        description: `Bulk created ${results.length} test cases`,
        metadata: { 
          created_count: results.length,
          error_count: errors.length,
          total_attempted: test_cases.length
        }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.status(201).json({
      message: `Bulk creation completed: ${results.length} created, ${errors.length} errors`,
      data: {
        created: results,
        errors: errors,
        summary: {
          total_attempted: test_cases.length,
          created_count: results.length,
          error_count: errors.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;