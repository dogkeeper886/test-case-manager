const express = require('express');
const router = express.Router();
const { query } = require('../../services/database');
const ActivityService = require('../../services/ActivityService');
const { validateTestSuite, validatePagination } = require('../../middleware/validation');
const { NotFoundError } = require('../../middleware/errorHandler');

// GET /api/v1/test-suites - Get all test suites with filtering
router.get('/', validatePagination, async (req, res, next) => {
  try {
    const { 
      project_id, 
      parent_suite_id, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (project_id) {
      whereClause += ` AND ts.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }
    
    if (parent_suite_id) {
      whereClause += ` AND ts.parent_suite_id = $${paramIndex}`;
      params.push(parent_suite_id);
      paramIndex++;
    }
    
    // Get total count
    const countSql = `
      SELECT COUNT(*) as total_count 
      FROM test_suites ts
      LEFT JOIN projects p ON ts.project_id = p.id
      ${whereClause}
    `;
    
    const countResult = await query(countSql, params);
    const totalCount = parseInt(countResult.rows[0].total_count);
    
    // Get paginated data with hierarchical information
    const dataSql = `
      SELECT 
        ts.*,
        p.name as project_name,
        parent_ts.name as parent_suite_name,
        COUNT(DISTINCT child_ts.id) as child_suite_count,
        COUNT(DISTINCT tc.id) as test_case_count,
        COUNT(DISTINCT CASE WHEN tc.status = 2 THEN tc.id END) as passed_count,
        COUNT(DISTINCT CASE WHEN tc.status = 3 THEN tc.id END) as failed_count
      FROM test_suites ts
      LEFT JOIN projects p ON ts.project_id = p.id
      LEFT JOIN test_suites parent_ts ON ts.parent_suite_id = parent_ts.id
      LEFT JOIN test_suites child_ts ON ts.id = child_ts.parent_suite_id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      ${whereClause}
      GROUP BY ts.id, p.name, parent_ts.name
      ORDER BY ts.node_order, ts.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataParams = [...params, limit, offset];
    const result = await query(dataSql, dataParams);
    
    res.json({
      message: 'Test suites retrieved successfully',
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

// POST /api/v1/test-suites - Create a new test suite
router.post('/', validateTestSuite, async (req, res, next) => {
  try {
    const { 
      project_id, 
      name, 
      description = '', 
      parent_suite_id = null,
      node_order = 1
    } = req.body;

    // Check if project exists
    const projectCheck = await query('SELECT id, name FROM projects WHERE id = $1', [project_id]);
    if (projectCheck.rows.length === 0) {
      throw new NotFoundError(`Project with ID ${project_id} not found`);
    }

    // Check if parent suite exists (if specified)
    if (parent_suite_id) {
      const parentCheck = await query('SELECT id, name FROM test_suites WHERE id = $1', [parent_suite_id]);
      if (parentCheck.rows.length === 0) {
        throw new NotFoundError(`Parent test suite with ID ${parent_suite_id} not found`);
      }
    }

    const sql = `
      INSERT INTO test_suites (project_id, name, description, parent_suite_id, node_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [project_id, name, description, parent_suite_id, node_order]);
    const testSuite = result.rows[0];

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'create',
        entity_type: 'test_suite',
        entity_id: testSuite.id,
        entity_name: testSuite.name,
        description: `Created test suite: ${testSuite.name}`,
        metadata: { 
          project_id, 
          parent_suite_id,
          project_name: projectCheck.rows[0].name
        }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.status(201).json({
      message: 'Test suite created successfully',
      data: testSuite
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/test-suites/:id - Get test suite by ID with hierarchy
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        ts.*,
        p.name as project_name,
        parent_ts.name as parent_suite_name,
        COUNT(DISTINCT child_ts.id) as child_suite_count,
        COUNT(DISTINCT tc.id) as test_case_count,
        COUNT(DISTINCT CASE WHEN tc.status = 2 THEN tc.id END) as passed_count,
        COUNT(DISTINCT CASE WHEN tc.status = 3 THEN tc.id END) as failed_count,
        COUNT(DISTINCT CASE WHEN tc.status = 4 THEN tc.id END) as blocked_count
      FROM test_suites ts
      LEFT JOIN projects p ON ts.project_id = p.id
      LEFT JOIN test_suites parent_ts ON ts.parent_suite_id = parent_ts.id
      LEFT JOIN test_suites child_ts ON ts.id = child_ts.parent_suite_id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      WHERE ts.id = $1
      GROUP BY ts.id, p.name, parent_ts.name
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Test suite with ID ${id} not found`);
    }

    // Get child test suites
    const childSuitesSql = `
      SELECT id, name, description, node_order
      FROM test_suites 
      WHERE parent_suite_id = $1 
      ORDER BY node_order, name
    `;
    const childSuitesResult = await query(childSuitesSql, [id]);

    const testSuite = result.rows[0];
    testSuite.child_suites = childSuitesResult.rows;

    res.json({
      message: 'Test suite retrieved successfully',
      data: testSuite
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/test-suites/:id - Update test suite
router.put('/:id', validateTestSuite, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parent_suite_id, node_order } = req.body;

    // Check if test suite exists
    const checkSql = 'SELECT id, name FROM test_suites WHERE id = $1';
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Test suite with ID ${id} not found`);
    }

    // Check if parent suite exists (if specified and different from current)
    if (parent_suite_id) {
      const parentCheck = await query('SELECT id, name FROM test_suites WHERE id = $1', [parent_suite_id]);
      if (parentCheck.rows.length === 0) {
        throw new NotFoundError(`Parent test suite with ID ${parent_suite_id} not found`);
      }
      
      // Prevent circular reference
      if (parseInt(parent_suite_id) === parseInt(id)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Test suite cannot be its own parent'
        });
      }
    }

    const updateSql = `
      UPDATE test_suites 
      SET 
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        parent_suite_id = COALESCE($4, parent_suite_id),
        node_order = COALESCE($5, node_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateSql, [id, name, description, parent_suite_id, node_order]);
    const testSuite = result.rows[0];

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'update',
        entity_type: 'test_suite',
        entity_id: testSuite.id,
        entity_name: testSuite.name,
        description: `Updated test suite: ${testSuite.name}`,
        metadata: { updated_fields: Object.keys(req.body) }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    res.json({
      message: 'Test suite updated successfully',
      data: testSuite
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/test-suites/:id - Delete test suite
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if test suite exists and get statistics
    const checkSql = `
      SELECT 
        ts.id, 
        ts.name,
        COUNT(DISTINCT child_ts.id) as child_suite_count,
        COUNT(DISTINCT tc.id) as test_case_count
      FROM test_suites ts
      LEFT JOIN test_suites child_ts ON ts.id = child_ts.parent_suite_id
      LEFT JOIN test_cases tc ON ts.id = tc.test_suite_id
      WHERE ts.id = $1
      GROUP BY ts.id, ts.name
    `;
    const checkResult = await query(checkSql, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new NotFoundError(`Test suite with ID ${id} not found`);
    }

    const testSuite = checkResult.rows[0];

    // Delete test suite (cascade will handle child suites and test cases)
    const deleteSql = 'DELETE FROM test_suites WHERE id = $1';
    await query(deleteSql, [id]);

    // Log activity
    try {
      const activityService = new ActivityService();
      await activityService.logActivity({
        action_type: 'delete',
        entity_type: 'test_suite',
        entity_id: parseInt(id),
        entity_name: testSuite.name,
        description: `Deleted test suite: ${testSuite.name}`,
        metadata: { 
          child_suite_count: testSuite.child_suite_count,
          test_case_count: testSuite.test_case_count,
          warning: 'Cascaded deletion of child suites and test cases'
        }
      });
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    const warnings = [];
    if (testSuite.child_suite_count > 0) {
      warnings.push(`${testSuite.child_suite_count} child test suites were also deleted`);
    }
    if (testSuite.test_case_count > 0) {
      warnings.push(`${testSuite.test_case_count} test cases were also deleted`);
    }

    res.json({
      message: 'Test suite deleted successfully',
      warnings: warnings
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/test-suites/:id/hierarchy - Get full hierarchy tree
router.get('/:id/hierarchy', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Recursive CTE to get full hierarchy
    const sql = `
      WITH RECURSIVE suite_hierarchy AS (
        -- Base case: start with the requested suite
        SELECT 
          id, name, description, parent_suite_id, node_order, project_id,
          0 as level,
          ARRAY[id] as path,
          name as full_path
        FROM test_suites 
        WHERE id = $1
        
        UNION ALL
        
        -- Recursive case: get all children
        SELECT 
          ts.id, ts.name, ts.description, ts.parent_suite_id, ts.node_order, ts.project_id,
          sh.level + 1,
          sh.path || ts.id,
          sh.full_path || ' > ' || ts.name
        FROM test_suites ts
        JOIN suite_hierarchy sh ON ts.parent_suite_id = sh.id
      )
      SELECT 
        sh.*,
        COUNT(tc.id) as test_case_count
      FROM suite_hierarchy sh
      LEFT JOIN test_cases tc ON sh.id = tc.test_suite_id
      GROUP BY sh.id, sh.name, sh.description, sh.parent_suite_id, 
               sh.node_order, sh.project_id, sh.level, sh.path, sh.full_path
      ORDER BY sh.level, sh.node_order, sh.name
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Test suite with ID ${id} not found`);
    }

    res.json({
      message: 'Test suite hierarchy retrieved successfully',
      data: {
        root_suite: result.rows[0],
        hierarchy: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;