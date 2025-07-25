const { Pool } = require('pg');
const pool = require('./database');

class ActivityService {
  /**
   * Log an activity
   * @param {Object} activityData - Activity data
   * @param {string} activityData.userId - User ID (defaults to 'system')
   * @param {string} activityData.actionType - Type of action
   * @param {string} activityData.entityType - Type of entity
   * @param {number} activityData.entityId - Entity ID
   * @param {string} activityData.entityName - Entity name
   * @param {string} activityData.description - Activity description
   * @param {Object} activityData.metadata - Additional metadata
   * @returns {Promise<number>} Activity ID
   */
  static async logActivity(activityData) {
    const {
      userId = 'system',
      actionType,
      entityType,
      entityId = null,
      entityName = null,
      description,
      metadata = null
    } = activityData;

    try {
      const query = `
        SELECT log_activity($1, $2, $3, $4, $5, $6, $7)
      `;
      
      const result = await pool.query(query, [
        userId,
        actionType,
        entityType,
        entityId,
        entityName,
        description,
        metadata ? JSON.stringify(metadata) : null
      ]);

      return result.rows[0].log_activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get recent activities
   * @param {number} limit - Number of activities to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of activities
   */
  static async getRecentActivities(limit = 10, offset = 0) {
    try {
      const query = `
        SELECT * FROM get_recent_activities($1, $2)
      `;
      
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }

  /**
   * Get activities by entity
   * @param {string} entityType - Type of entity
   * @param {number} entityId - Entity ID
   * @param {number} limit - Number of activities to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of activities
   */
  static async getActivitiesByEntity(entityType, entityId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT 
          a.*,
          at.display_name,
          at.icon,
          at.color
        FROM activities a
        LEFT JOIN activity_types at ON a.action_type = at.type_code
        WHERE a.entity_type = $1 AND a.entity_id = $2
        ORDER BY a.created_at DESC
        LIMIT $3 OFFSET $4
      `;
      
      const result = await pool.query(query, [entityType, entityId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting activities by entity:', error);
      throw error;
    }
  }

  /**
   * Get activities by user
   * @param {string} userId - User ID
   * @param {number} limit - Number of activities to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of activities
   */
  static async getActivitiesByUser(userId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT 
          a.*,
          at.display_name,
          at.icon,
          at.color
        FROM activities a
        LEFT JOIN activity_types at ON a.action_type = at.type_code
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting activities by user:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics
   * @returns {Promise<Object>} Activity statistics
   */
  static async getActivityStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_activities,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT entity_type) as entity_types,
          MAX(created_at) as last_activity
        FROM activities
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting activity stats:', error);
      throw error;
    }
  }

  /**
   * Helper method to log project activities
   */
  static async logProjectActivity(actionType, projectId, projectName, description, metadata = null) {
    return this.logActivity({
      actionType,
      entityType: 'project',
      entityId: projectId,
      entityName: projectName,
      description,
      metadata
    });
  }

  /**
   * Helper method to log test case activities
   */
  static async logTestCaseActivity(actionType, testCaseId, testCaseTitle, description, metadata = null) {
    return this.logActivity({
      actionType,
      entityType: 'test_case',
      entityId: testCaseId,
      entityName: testCaseTitle,
      description,
      metadata
    });
  }

  /**
   * Helper method to log test suite activities
   */
  static async logTestSuiteActivity(actionType, testSuiteId, testSuiteName, description, metadata = null) {
    return this.logActivity({
      actionType,
      entityType: 'test_suite',
      entityId: testSuiteId,
      entityName: testSuiteName,
      description,
      metadata
    });
  }

  /**
   * Helper method to log import activities
   */
  static async logImportActivity(actionType, description, metadata = null) {
    return this.logActivity({
      actionType,
      entityType: 'import',
      description,
      metadata
    });
  }

  /**
   * Helper method to log document activities
   */
  static async logDocumentActivity(actionType, documentId, documentName, description, metadata = null) {
    return this.logActivity({
      actionType,
      entityType: 'document',
      entityId: documentId,
      entityName: documentName,
      description,
      metadata
    });
  }
}

module.exports = ActivityService; 