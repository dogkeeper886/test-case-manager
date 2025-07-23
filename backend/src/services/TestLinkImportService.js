const TestLinkXMLParser = require('../utils/TestLinkXMLParser');

class TestLinkImportService {
  constructor(db) {
    this.db = db;
    this.parser = new TestLinkXMLParser();
  }

  /**
   * Import TestLink XML from file
   * @param {string} filePath - Path to XML file
   * @param {number} projectId - Project ID to import into
   * @param {number} documentId - Document ID (optional)
   * @returns {Promise<Object>} Import result
   */
  async importFromFile(filePath, projectId, documentId = null) {
    const importLogId = await this.createImportLog(projectId, documentId, 'testlink', filePath);
    
    try {
      // Parse XML file
      const parsedData = await this.parser.parseFile(filePath);
      
      // Validate parsed data
      const validation = this.parser.validateParsedData(parsedData);
      if (!validation.isValid) {
        await this.updateImportLog(importLogId, 'failed', { errors: validation.errors });
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get statistics
      const stats = this.parser.getStatistics(parsedData);
      await this.updateImportLog(importLogId, 'processing', {
        total_test_suites: stats.totalTestSuites,
        total_test_cases: stats.totalTestCases
      });

      // Start database transaction
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');

        // Import test suites and test cases
        const result = await this.importTestSuiteRecursive(parsedData, projectId, null, client);

        await client.query('COMMIT');

        // Update import log with success
        await this.updateImportLog(importLogId, 'completed', {
          imported_test_suites: result.importedSuites,
          imported_test_cases: result.importedCases
        });

        return {
          success: true,
          importLogId,
          importedSuites: result.importedSuites,
          importedCases: result.importedCases,
          statistics: stats
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      await this.updateImportLog(importLogId, 'failed', { errors: [error.message] });
      throw error;
    }
  }

  /**
   * Import TestLink XML from content string
   * @param {string} xmlContent - XML content
   * @param {number} projectId - Project ID to import into
   * @param {number} documentId - Document ID (optional)
   * @param {string} fileName - File name for logging
   * @returns {Promise<Object>} Import result
   */
  async importFromContent(xmlContent, projectId, documentId = null, fileName = 'uploaded.xml') {
    const importLogId = await this.createImportLog(projectId, documentId, 'testlink', fileName);
    
    try {
      // Parse XML content
      const parsedData = await this.parser.parseContent(xmlContent);
      
      // Validate parsed data
      const validation = this.parser.validateParsedData(parsedData);
      if (!validation.isValid) {
        await this.updateImportLog(importLogId, 'failed', { errors: validation.errors });
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get statistics
      const stats = this.parser.getStatistics(parsedData);
      await this.updateImportLog(importLogId, 'processing', {
        total_test_suites: stats.totalTestSuites,
        total_test_cases: stats.totalTestCases
      });

      // Start database transaction
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');

        // Import test suites and test cases
        const result = await this.importTestSuiteRecursive(parsedData, projectId, null, client);

        await client.query('COMMIT');

        // Update import log with success
        await this.updateImportLog(importLogId, 'completed', {
          imported_test_suites: result.importedSuites,
          imported_test_cases: result.importedCases
        });

        return {
          success: true,
          importLogId,
          importedSuites: result.importedSuites,
          importedCases: result.importedCases,
          statistics: stats
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      await this.updateImportLog(importLogId, 'failed', { errors: [error.message] });
      throw error;
    }
  }

  /**
   * Import test suite recursively
   * @param {Object} suiteData - Test suite data
   * @param {number} projectId - Project ID
   * @param {number} parentId - Parent suite ID (null for root)
   * @param {Object} client - Database client
   * @returns {Promise<Object>} Import result
   */
  async importTestSuiteRecursive(suiteData, projectId, parentId, client) {
    let importedSuites = 0;
    let importedCases = 0;

    // Import current test suite
    const suiteId = await this.importTestSuite(suiteData, projectId, parentId, client);
    importedSuites++;

    // Import test cases in this suite
    if (suiteData.test_cases && suiteData.test_cases.length > 0) {
      for (const testCaseData of suiteData.test_cases) {
        await this.importTestCase(testCaseData, projectId, suiteId, client);
        importedCases++;
      }
    }

    // Import nested test suites
    if (suiteData.test_suites && suiteData.test_suites.length > 0) {
      for (const childSuiteData of suiteData.test_suites) {
        const childResult = await this.importTestSuiteRecursive(childSuiteData, projectId, suiteId, client);
        importedSuites += childResult.importedSuites;
        importedCases += childResult.importedCases;
      }
    }

    return { importedSuites, importedCases };
  }

  /**
   * Import a single test suite
   * @param {Object} suiteData - Test suite data
   * @param {number} projectId - Project ID
   * @param {number} parentId - Parent suite ID
   * @param {Object} client - Database client
   * @returns {Promise<number>} Created suite ID
   */
  async importTestSuite(suiteData, projectId, parentId, client) {
    const query = `
      INSERT INTO test_suites (
        project_id, name, description, external_id, node_order, 
        parent_suite_id, details, import_source, imported_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id
    `;

    const values = [
      projectId,
      suiteData.name,
      suiteData.details || '',
      suiteData.id || null,
      suiteData.node_order || 0,
      parentId,
      suiteData.details || '',
      'testlink'
    ];

    const result = await client.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Import a single test case
   * @param {Object} testCaseData - Test case data
   * @param {number} projectId - Project ID
   * @param {number} suiteId - Test suite ID
   * @param {Object} client - Database client
   * @returns {Promise<number>} Created test case ID
   */
  async importTestCase(testCaseData, projectId, suiteId, client) {
    // Check for existing test case by internal_id
    const existingQuery = `
      SELECT id FROM test_cases 
      WHERE internal_id = $1 AND import_source = 'testlink'
    `;
    const existingResult = await client.query(existingQuery, [testCaseData.internal_id]);
    
    if (existingResult.rows.length > 0) {
      // Update existing test case
      return await this.updateExistingTestCase(testCaseData, existingResult.rows[0].id, client);
    }

    // Create new test case
    const query = `
      INSERT INTO test_cases (
        project_id, test_suite_id, title, description, preconditions,
        external_id, internal_id, version, node_order, execution_type,
        importance, is_open, active, import_source, imported_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING id
    `;

    const values = [
      projectId,
      suiteId,
      testCaseData.name,
      testCaseData.summary || '',
      testCaseData.preconditions || '',
      testCaseData.external_id || null,
      testCaseData.internal_id,
      testCaseData.version || '1',
      testCaseData.node_order || 0,
      testCaseData.execution_type || 1,
      testCaseData.importance || 2,
      testCaseData.is_open === 1,
      testCaseData.active === 1,
      'testlink'
    ];

    const result = await client.query(query, values);
    const testCaseId = result.rows[0].id;

    // Import test steps
    if (testCaseData.steps && testCaseData.steps.length > 0) {
      await this.importTestSteps(testCaseData.steps, testCaseId, client);
    }

    // Import custom fields
    if (testCaseData.custom_fields && testCaseData.custom_fields.length > 0) {
      await this.importCustomFields(testCaseData.custom_fields, testCaseId, client);
    }

    return testCaseId;
  }

  /**
   * Update existing test case
   * @param {Object} testCaseData - Test case data
   * @param {number} testCaseId - Existing test case ID
   * @param {Object} client - Database client
   * @returns {Promise<number>} Test case ID
   */
  async updateExistingTestCase(testCaseData, testCaseId, client) {
    const query = `
      UPDATE test_cases SET
        title = $1,
        description = $2,
        preconditions = $3,
        version = $4,
        execution_type = $5,
        importance = $6,
        is_open = $7,
        active = $8,
        imported_at = NOW()
      WHERE id = $9
    `;

    const values = [
      testCaseData.name,
      testCaseData.summary || '',
      testCaseData.preconditions || '',
      testCaseData.version || '1',
      testCaseData.execution_type || 1,
      testCaseData.importance || 2,
      testCaseData.is_open === 1,
      testCaseData.active === 1,
      testCaseId
    ];

    await client.query(query, values);

    // Update test steps
    await client.query('DELETE FROM test_steps WHERE test_case_id = $1', [testCaseId]);
    if (testCaseData.steps && testCaseData.steps.length > 0) {
      await this.importTestSteps(testCaseData.steps, testCaseId, client);
    }

    // Update custom fields
    await client.query('DELETE FROM custom_fields WHERE test_case_id = $1', [testCaseId]);
    if (testCaseData.custom_fields && testCaseData.custom_fields.length > 0) {
      await this.importCustomFields(testCaseData.custom_fields, testCaseId, client);
    }

    return testCaseId;
  }

  /**
   * Import test steps
   * @param {Array} steps - Test steps array
   * @param {number} testCaseId - Test case ID
   * @param {Object} client - Database client
   */
  async importTestSteps(steps, testCaseId, client) {
    for (const step of steps) {
      const query = `
        INSERT INTO test_steps (
          test_case_id, step_number, actions, expected_results, execution_type
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const values = [
        testCaseId,
        step.step_number,
        this.parser.cleanHTMLContent(step.actions),
        this.parser.cleanHTMLContent(step.expected_results),
        step.execution_type || 1
      ];

      await client.query(query, values);
    }
  }

  /**
   * Import custom fields
   * @param {Array} customFields - Custom fields array
   * @param {number} testCaseId - Test case ID
   * @param {Object} client - Database client
   */
  async importCustomFields(customFields, testCaseId, client) {
    for (const field of customFields) {
      const query = `
        INSERT INTO custom_fields (
          test_case_id, field_name, field_value
        ) VALUES ($1, $2, $3)
      `;

      const values = [
        testCaseId,
        field.name,
        field.value || ''
      ];

      await client.query(query, values);
    }
  }

  /**
   * Create import log entry
   * @param {number} projectId - Project ID
   * @param {number} documentId - Document ID
   * @param {string} importType - Import type
   * @param {string} fileName - File name
   * @returns {Promise<number>} Import log ID
   */
  async createImportLog(projectId, documentId, importType, fileName) {
    const query = `
      INSERT INTO import_logs (
        project_id, document_id, import_type, file_name, status
      ) VALUES ($1, $2, $3, $4, 'processing')
      RETURNING id
    `;

    const result = await this.db.query(query, [projectId, documentId, importType, fileName]);
    return result.rows[0].id;
  }

  /**
   * Update import log
   * @param {number} importLogId - Import log ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data to update
   */
  async updateImportLog(importLogId, status, additionalData = {}) {
    const updateFields = ['status = $1'];
    const values = [status];
    let paramIndex = 2;

    if (status === 'completed' || status === 'failed') {
      updateFields.push(`completed_at = NOW()`);
    }

    if (additionalData.total_test_suites !== undefined) {
      updateFields.push(`total_test_suites = $${paramIndex++}`);
      values.push(additionalData.total_test_suites);
    }

    if (additionalData.total_test_cases !== undefined) {
      updateFields.push(`total_test_cases = $${paramIndex++}`);
      values.push(additionalData.total_test_cases);
    }

    if (additionalData.imported_test_suites !== undefined) {
      updateFields.push(`imported_test_suites = $${paramIndex++}`);
      values.push(additionalData.imported_test_suites);
    }

    if (additionalData.imported_test_cases !== undefined) {
      updateFields.push(`imported_test_cases = $${paramIndex++}`);
      values.push(additionalData.imported_test_cases);
    }

    if (additionalData.errors) {
      updateFields.push(`errors = $${paramIndex++}`);
      values.push(JSON.stringify(additionalData.errors));
    }

    values.push(importLogId);

    const query = `
      UPDATE import_logs 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await this.db.query(query, values);
  }

  /**
   * Get import log by ID
   * @param {number} importLogId - Import log ID
   * @returns {Promise<Object>} Import log data
   */
  async getImportLog(importLogId) {
    const query = `
      SELECT * FROM import_logs WHERE id = $1
    `;
    
    const result = await this.db.query(query, [importLogId]);
    return result.rows[0] || null;
  }

  /**
   * Get import logs for project
   * @param {number} projectId - Project ID
   * @returns {Promise<Array>} Import logs array
   */
  async getImportLogs(projectId) {
    const query = `
      SELECT * FROM import_logs 
      WHERE project_id = $1 
      ORDER BY started_at DESC
    `;
    
    const result = await this.db.query(query, [projectId]);
    return result.rows;
  }
}

module.exports = TestLinkImportService; 