const express = require('express');
const router = express.Router();
const ActivityService = require('../services/ActivityService');
const { query } = require('../services/database');

/**
 * @route GET /api/activities
 * @desc Get recent activities
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const activities = await ActivityService.getRecentActivities(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: activities,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

/**
 * @route GET /api/activities/stats
 * @desc Get activity statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await ActivityService.getActivityStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
});

/**
 * @route GET /api/activities/entity/:entityType/:entityId
 * @desc Get activities for a specific entity
 * @access Public
 */
router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const activities = await ActivityService.getActivitiesByEntity(
      entityType,
      parseInt(entityId),
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: activities,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching entity activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity activities',
      error: error.message
    });
  }
});

/**
 * @route GET /api/activities/user/:userId
 * @desc Get activities for a specific user
 * @access Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const activities = await ActivityService.getActivitiesByUser(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: activities,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error.message
    });
  }
});

/**
 * @route GET /api/activities/:id
 * @desc Get activity by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        a.*,
        at.display_name,
        at.icon,
        at.color
      FROM activities a
      LEFT JOIN activity_types at ON a.action_type = at.type_code
      WHERE a.id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

/**
 * @route POST /api/activities/log
 * @desc Log a new activity
 * @access Public
 */
router.post('/log', async (req, res) => {
  try {
    const {
      userId = 'system',
      actionType,
      entityType,
      entityId,
      entityName,
      description,
      metadata
    } = req.body;

    if (!actionType || !entityType || !description) {
      return res.status(400).json({
        success: false,
        message: 'actionType, entityType, and description are required'
      });
    }

    const activityId = await ActivityService.logActivity({
      userId,
      actionType,
      entityType,
      entityId,
      entityName,
      description,
      metadata
    });

    res.json({
      success: true,
      data: { id: activityId },
      message: 'Activity logged successfully'
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity',
      error: error.message
    });
  }
});

module.exports = router; 