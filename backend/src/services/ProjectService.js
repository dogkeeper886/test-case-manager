class ProjectService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new project
   * @param {string} name - Project name
   * @param {string} description - Project description
   * @param {string} status - Project status (active, inactive, archived)
   * @returns {Promise<Object>} Created project
   */
  async createProject(name, description = '', status = 'active') {
    try {
      // Check if project name already exists
      const existingProject = await this.db.query(
        'SELECT id FROM projects WHERE name = $1',
        [name]
      );

      if (existingProject.rows.length > 0) {
        throw new Error(`Project with name "${name}" already exists`);
      }
      
      // Create the project
      const result = await this.db.query(
        'INSERT INTO projects (name, description, status) VALUES ($1, $2, $3) RETURNING *',
        [name, description, status]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get all projects
   * @returns {Promise<Array>} List of projects
   */
  async getAllProjects() {
    try {
      const result = await this.db.query(
        'SELECT * FROM projects ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Get project by ID
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Project data
   */
  async getProjectById(projectId) {
    try {
      const result = await this.db.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  /**
   * Check if project name exists
   * @param {string} name - Project name
   * @returns {Promise<boolean>} True if exists
   */
  async projectNameExists(name) {
    try {
      const result = await this.db.query(
        'SELECT id FROM projects WHERE name = $1',
        [name]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check project name: ${error.message}`);
    }
  }

  /**
   * Get project statistics
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStatistics(projectId) {
    try {
      const testSuitesResult = await this.db.query(
        'SELECT COUNT(*) as count FROM test_suites WHERE project_id = $1',
        [projectId]
      );

      const testCasesResult = await this.db.query(
        'SELECT COUNT(*) as count FROM test_cases tc JOIN test_suites ts ON tc.test_suite_id = ts.id WHERE ts.project_id = $1',
        [projectId]
      );

      const importLogsResult = await this.db.query(
        'SELECT COUNT(*) as count FROM import_logs WHERE project_id = $1',
        [projectId]
      );

      const activitiesResult = await this.db.query(
        'SELECT COUNT(*) as count FROM activities WHERE entity_type = $1 AND entity_id = $2',
        ['project', projectId]
      );

      return {
        testSuites: parseInt(testSuitesResult.rows[0].count),
        testCases: parseInt(testCasesResult.rows[0].count),
        importLogs: parseInt(importLogsResult.rows[0].count),
        activities: parseInt(activitiesResult.rows[0].count)
      };
    } catch (error) {
      throw new Error(`Failed to get project statistics: ${error.message}`);
    }
  }

  /**
   * Update project
   * @param {number} projectId - Project ID
   * @param {string} name - Project name
   * @param {string} description - Project description
   * @param {string} status - Project status
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(projectId, name, description = '', status = 'active') {
    try {
      // Check if project exists
      const existingProject = await this.getProjectById(projectId);
      if (!existingProject) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Check if new name conflicts with other projects
      if (name !== existingProject.name) {
        const nameExists = await this.projectNameExists(name);
        if (nameExists) {
          throw new Error(`Project with name "${name}" already exists`);
        }
      }

      // Update the project
      const result = await this.db.query(
        'UPDATE projects SET name = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, description, status, projectId]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete project with cascade
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Deletion summary
   */
  async deleteProject(projectId) {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Check if project exists
      const existingProject = await this.getProjectById(projectId);
      if (!existingProject) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Get counts before deletion for summary
      const testSuitesResult = await client.query(
        'SELECT COUNT(*) as count FROM test_suites WHERE project_id = $1',
        [projectId]
      );
      const testCasesResult = await client.query(
        'SELECT COUNT(*) as count FROM test_cases tc JOIN test_suites ts ON tc.test_suite_id = ts.id WHERE ts.project_id = $1',
        [projectId]
      );
      const importLogsResult = await client.query(
        'SELECT COUNT(*) as count FROM import_logs WHERE project_id = $1',
        [projectId]
      );
      const activitiesResult = await client.query(
        'SELECT COUNT(*) as count FROM activities WHERE entity_type = $1 AND entity_id = $2',
        ['project', projectId]
      );

      // Delete the project (cascade will handle related data)
      await client.query('DELETE FROM projects WHERE id = $1', [projectId]);

      await client.query('COMMIT');

      return {
        projectId,
        projectName: existingProject.name,
        deletedItems: {
          testSuites: parseInt(testSuitesResult.rows[0].count),
          testCases: parseInt(testCasesResult.rows[0].count),
          importLogs: parseInt(importLogsResult.rows[0].count),
          activities: parseInt(activitiesResult.rows[0].count)
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to delete project: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get project details with statistics
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Project with detailed statistics
   */
  async getProjectDetails(projectId) {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        return null;
      }

      const statistics = await this.getProjectStatistics(projectId);
      
      // Get recent activities
      const activitiesResult = await this.db.query(
        'SELECT * FROM activities WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC LIMIT 10',
        ['project', projectId]
      );

      // Get recent import logs
      const importLogsResult = await this.db.query(
        'SELECT * FROM import_logs WHERE project_id = $1 ORDER BY started_at DESC LIMIT 10',
        [projectId]
      );

      return {
        ...project,
        statistics,
        recentActivities: activitiesResult.rows,
        recentImportLogs: importLogsResult.rows
      };
    } catch (error) {
      throw new Error(`Failed to get project details: ${error.message}`);
    }
  }
}

module.exports = ProjectService; 