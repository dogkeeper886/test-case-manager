class ProjectService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new project
   * @param {string} name - Project name
   * @param {string} description - Project description
   * @returns {Promise<Object>} Created project
   */
  async createProject(name, description = '') {
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
        [name, description, 'active']
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
        'SELECT COUNT(*) as count FROM test_cases WHERE project_id = $1',
        [projectId]
      );

      return {
        testSuites: parseInt(testSuitesResult.rows[0].count),
        testCases: parseInt(testCasesResult.rows[0].count)
      };
    } catch (error) {
      throw new Error(`Failed to get project statistics: ${error.message}`);
    }
  }
}

module.exports = ProjectService; 