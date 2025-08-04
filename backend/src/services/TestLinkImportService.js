const TestLinkXMLParser = require('../utils/TestLinkXMLParser');
const ProjectService = require('./ProjectService');
const fs = require('fs').promises;
const path = require('path');

class TestLinkImportService {
  constructor(db) {
    this.db = db;
    this.parser = new TestLinkXMLParser();
    this.projectService = new ProjectService(db);
  }

  /**
   * Import strategies for handling duplicates
   */
  static get IMPORT_STRATEGIES() {
    return {
      SKIP_DUPLICATES: 'skip_duplicates',
      UPDATE_EXISTING: 'update_existing', 
      CREATE_NEW: 'create_new',
      MERGE_DATA: 'merge_data'
    };
  }

  /**
   * Preview import without actually importing data
   * @param {string} filePath - Path to XML file
   * @param {number} projectId - Project ID (optional)
   * @returns {Promise<Object>} Preview data
   */
  async previewImport(filePath, projectId = null) {
    try {
      // Parse XML file
      const parsedData = await this.parser.parseFile(filePath);
      
      // Validate parsed data
      const validation = this.parser.validateParsedData(parsedData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get statistics
      const stats = this.parser.getStatistics(parsedData);
      
      // Analyze for duplicates (only if projectId is provided)
      let duplicateAnalysis = { testSuites: [], testCases: [], summary: { duplicateTestSuites: 0, duplicateTestCases: 0 } };
      if (projectId) {
        duplicateAnalysis = await this.analyzeDuplicates(parsedData, projectId);
      }
      
      return {
        success: true,
        statistics: stats,
        duplicates: duplicateAnalysis,
        recommendations: this.generateImportRecommendations(stats, duplicateAnalysis)
      };
    } catch (error) {
      throw new Error(`Preview failed: ${error.message}`);
    }
  }

  /**
   * Preview import from content
   * @param {string} xmlContent - XML content
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Preview data
   */
  async previewImportFromContent(xmlContent, projectId) {
    try {
      // Parse XML content
      const parsedData = await this.parser.parseContent(xmlContent);
      
      // Validate parsed data
      const validation = this.parser.validateParsedData(parsedData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get statistics
      const stats = this.parser.getStatistics(parsedData);
      
      // Analyze for duplicates
      const duplicateAnalysis = await this.analyzeDuplicates(parsedData, projectId);
      
      return {
        success: true,
        statistics: stats,
        duplicates: duplicateAnalysis,
        recommendations: this.generateImportRecommendations(stats, duplicateAnalysis)
      };
    } catch (error) {
      throw new Error(`Preview failed: ${error.message}`);
    }
  }

  /**
   * Analyze duplicates in the data to be imported
   * @param {Object} parsedData - Parsed XML data
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Duplicate analysis
   */
  async analyzeDuplicates(parsedData, projectId) {
    const duplicates = {
      testSuites: [],
      testCases: [],
      summary: {
        totalTestSuites: 0,
        totalTestCases: 0,
        duplicateTestSuites: 0,
        duplicateTestCases: 0
      }
    };

    // Analyze test suites for duplicates
    const suiteDuplicates = await this.findDuplicateTestSuites(parsedData, projectId);
    duplicates.testSuites = suiteDuplicates;
    duplicates.summary.duplicateTestSuites = suiteDuplicates.length;

    // Analyze test cases for duplicates
    const caseDuplicates = await this.findDuplicateTestCases(parsedData, projectId);
    duplicates.testCases = caseDuplicates;
    duplicates.summary.duplicateTestCases = caseDuplicates.length;

    // Get total counts
    const stats = this.parser.getStatistics(parsedData);
    duplicates.summary.totalTestSuites = stats.totalTestSuites;
    duplicates.summary.totalTestCases = stats.totalTestCases;

    return duplicates;
  }

  /**
   * Find duplicate test suites
   * @param {Object} parsedData - Parsed XML data
   * @param {number} projectId - Project ID
   * @returns {Promise<Array>} Duplicate test suites
   */
  async findDuplicateTestSuites(parsedData, projectId) {
    const duplicates = [];
    
    const findDuplicatesRecursive = async (suiteData, parentPath = '') => {
      const currentPath = parentPath ? `${parentPath} > ${suiteData.name}` : suiteData.name;
      
      // Check if test suite exists by name and project
      const query = `
        SELECT id, name, external_id, parent_suite_id 
        FROM test_suites 
        WHERE name = $1 AND project_id = $2 AND import_source = 'testlink'
      `;
      const result = await this.db.query(query, [suiteData.name, projectId]);
      
      if (result.rows.length > 0) {
        duplicates.push({
          name: suiteData.name,
          path: currentPath,
          externalId: suiteData.id,
          existingIds: result.rows.map(row => row.id),
          existingExternalIds: result.rows.map(row => row.external_id).filter(id => id)
        });
      }

      // Check nested suites
      if (suiteData.test_suites && suiteData.test_suites.length > 0) {
        for (const childSuite of suiteData.test_suites) {
          await findDuplicatesRecursive(childSuite, currentPath);
        }
      }
    };

    await findDuplicatesRecursive(parsedData);
    return duplicates;
  }

  /**
   * Find duplicate test cases
   * @param {Object} parsedData - Parsed XML data
   * @param {number} projectId - Project ID
   * @returns {Promise<Array>} Duplicate test cases
   */
  async findDuplicateTestCases(parsedData, projectId) {
    const duplicates = [];
    
    const findDuplicatesRecursive = async (suiteData, parentPath = '') => {
      const currentPath = parentPath ? `${parentPath} > ${suiteData.name}` : suiteData.name;
      
      // Check test cases in current suite
      if (suiteData.test_cases && suiteData.test_cases.length > 0) {
        for (const testCase of suiteData.test_cases) {
          // Check by internal_id first (most reliable)
          const internalIdQuery = `
            SELECT id, title, internal_id, external_id, test_suite_id
            FROM test_cases 
            WHERE internal_id = $1 AND import_source = 'testlink'
          `;
          const internalIdResult = await this.db.query(internalIdQuery, [testCase.internal_id]);
          
          if (internalIdResult.rows.length > 0) {
            duplicates.push({
              name: testCase.name,
              path: `${currentPath} > ${testCase.name}`,
              internalId: testCase.internal_id,
              externalId: testCase.external_id,
              existingIds: internalIdResult.rows.map(row => row.id),
              matchType: 'internal_id'
            });
            continue;
          }

          // Check by title and suite (less reliable but catches some cases)
          const titleQuery = `
            SELECT tc.id, tc.title, tc.internal_id, tc.external_id, tc.test_suite_id, ts.name as suite_name
            FROM test_cases tc
            JOIN test_suites ts ON tc.test_suite_id = ts.id
            WHERE tc.title = $1 AND ts.name = $2 AND tc.import_source = 'testlink'
          `;
          const titleResult = await this.db.query(titleQuery, [testCase.name, suiteData.name]);
          
          if (titleResult.rows.length > 0) {
            duplicates.push({
              name: testCase.name,
              path: `${currentPath} > ${testCase.name}`,
              internalId: testCase.internal_id,
              externalId: testCase.external_id,
              existingIds: titleResult.rows.map(row => row.id),
              matchType: 'title_and_suite'
            });
          }
        }
      }

      // Check nested suites
      if (suiteData.test_suites && suiteData.test_suites.length > 0) {
        for (const childSuite of suiteData.test_suites) {
          await findDuplicatesRecursive(childSuite, currentPath);
        }
      }
    };

    await findDuplicatesRecursive(parsedData);
    return duplicates;
  }

  /**
   * Generate import recommendations based on analysis
   * @param {Object} stats - Import statistics
   * @param {Object} duplicates - Duplicate analysis
   * @returns {Object} Recommendations
   */
  generateImportRecommendations(stats, duplicates) {
    const recommendations = {
      suggestedStrategy: TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING,
      reasons: [],
      warnings: []
    };

    // Analyze duplicate patterns
    const duplicatePercentage = (duplicates.summary.duplicateTestCases / stats.totalTestCases) * 100;
    
    if (duplicatePercentage > 50) {
      recommendations.suggestedStrategy = TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING;
      recommendations.reasons.push(`High duplicate rate (${duplicatePercentage.toFixed(1)}%) - updating existing cases recommended`);
    } else if (duplicatePercentage > 10) {
      recommendations.suggestedStrategy = TestLinkImportService.IMPORT_STRATEGIES.MERGE_DATA;
      recommendations.reasons.push(`Moderate duplicate rate (${duplicatePercentage.toFixed(1)}%) - consider merging data`);
    } else if (duplicatePercentage === 0) {
      recommendations.suggestedStrategy = TestLinkImportService.IMPORT_STRATEGIES.CREATE_NEW;
      recommendations.reasons.push('No duplicates found - safe to create new cases');
    } else {
      recommendations.suggestedStrategy = TestLinkImportService.IMPORT_STRATEGIES.SKIP_DUPLICATES;
      recommendations.reasons.push(`Low duplicate rate (${duplicatePercentage.toFixed(1)}%) - skipping duplicates recommended`);
    }

    // Add warnings for large imports
    if (stats.totalTestCases > 1000) {
      recommendations.warnings.push('Large import detected - consider breaking into smaller files');
    }

    if (stats.maxDepth > 5) {
      recommendations.warnings.push('Deep hierarchy detected - may impact performance');
    }

    return recommendations;
  }

  /**
   * Import TestLink XML from file with strategy
   * @param {string} filePath - Path to XML file
   * @param {number} projectId - Project ID to import into
   * @param {string} strategy - Import strategy
   * @param {number} documentId - Document ID (optional)
   * @returns {Promise<Object>} Import result
   */
  async importFromFile(filePath, projectId, strategy = TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING, documentId = null) {
    // Get file size
    const fileStats = await fs.stat(filePath);
    const fileSize = fileStats.size;
    
    const importLogId = await this.createImportLog(projectId, documentId, 'testlink', path.basename(filePath), fileSize, filePath);
    
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
        total_test_cases: stats.totalTestCases,
        strategy: strategy
      });

      // Start database transaction
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');

        // Import test suites and test cases with strategy
        const result = await this.importTestSuiteRecursiveWithStrategy(parsedData, projectId, null, client, strategy);

        await client.query('COMMIT');

        // Update import log with success
        await this.updateImportLog(importLogId, 'completed', {
          imported_test_suites: result.importedSuites,
          imported_test_cases: result.importedCases,
          skipped_test_cases: result.skippedCases,
          updated_test_cases: result.updatedCases,
          strategy: strategy
        });

        return {
          success: true,
          importLogId,
          importedSuites: result.importedSuites,
          importedCases: result.importedCases,
          skippedCases: result.skippedCases,
          updatedCases: result.updatedCases,
          statistics: stats,
          strategy: strategy
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
        prerequisites = $3,
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
   * Import test suite recursively with strategy
   * @param {Object} suiteData - Test suite data
   * @param {number} projectId - Project ID
   * @param {number} parentId - Parent suite ID (null for root)
   * @param {Object} client - Database client
   * @param {string} strategy - Import strategy
   * @returns {Promise<Object>} Import result
   */
  async importTestSuiteRecursiveWithStrategy(suiteData, projectId, parentId, client, strategy) {
    let importedSuites = 0;
    let importedCases = 0;
    let skippedCases = 0;
    let updatedCases = 0;

    // Import current test suite
    const suiteId = await this.importTestSuite(suiteData, projectId, parentId, client);
    importedSuites++;

    // Import test cases in this suite with strategy
    if (suiteData.test_cases && suiteData.test_cases.length > 0) {
      for (const testCaseData of suiteData.test_cases) {
        const caseResult = await this.importTestCaseWithStrategy(testCaseData, projectId, suiteId, client, strategy);
        
        if (caseResult.action === 'created') {
          importedCases++;
        } else if (caseResult.action === 'updated') {
          updatedCases++;
        } else if (caseResult.action === 'skipped') {
          skippedCases++;
        }
      }
    }

    // Import nested test suites
    if (suiteData.test_suites && suiteData.test_suites.length > 0) {
      for (const childSuiteData of suiteData.test_suites) {
        const childResult = await this.importTestSuiteRecursiveWithStrategy(childSuiteData, projectId, suiteId, client, strategy);
        importedSuites += childResult.importedSuites;
        importedCases += childResult.importedCases;
        skippedCases += childResult.skippedCases;
        updatedCases += childResult.updatedCases;
      }
    }

    return { importedSuites, importedCases, skippedCases, updatedCases };
  }

  /**
   * Import a single test case with strategy
   * @param {Object} testCaseData - Test case data
   * @param {number} projectId - Project ID
   * @param {number} suiteId - Test suite ID
   * @param {Object} client - Database client
   * @param {string} strategy - Import strategy
   * @returns {Promise<Object>} Import result
   */
  async importTestCaseWithStrategy(testCaseData, projectId, suiteId, client, strategy) {
    // Check for existing test case by internal_id
    const existingQuery = `
      SELECT id FROM test_cases 
      WHERE internal_id = $1 AND import_source = 'testlink'
    `;
    const existingResult = await client.query(existingQuery, [testCaseData.internal_id]);
    
    if (existingResult.rows.length > 0) {
      // Handle duplicate based on strategy
      switch (strategy) {
        case TestLinkImportService.IMPORT_STRATEGIES.SKIP_DUPLICATES:
          return { action: 'skipped', testCaseId: existingResult.rows[0].id };
          
        case TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING:
          await this.updateExistingTestCase(testCaseData, existingResult.rows[0].id, client);
          return { action: 'updated', testCaseId: existingResult.rows[0].id };
          
        case TestLinkImportService.IMPORT_STRATEGIES.CREATE_NEW:
          // Create new with modified internal_id to avoid conflict
          const newInternalId = `${testCaseData.internal_id}_${Date.now()}`;
          testCaseData.internal_id = newInternalId;
          const testCaseId = await this.createNewTestCase(testCaseData, projectId, suiteId, client);
          return { action: 'created', testCaseId };
          
        case TestLinkImportService.IMPORT_STRATEGIES.MERGE_DATA:
          await this.mergeTestCaseData(testCaseData, existingResult.rows[0].id, client);
          return { action: 'updated', testCaseId: existingResult.rows[0].id };
          
        default:
          // Default to update existing
          await this.updateExistingTestCase(testCaseData, existingResult.rows[0].id, client);
          return { action: 'updated', testCaseId: existingResult.rows[0].id };
      }
    }

    // Create new test case
    const testCaseId = await this.createNewTestCase(testCaseData, projectId, suiteId, client);
    return { action: 'created', testCaseId };
  }

  /**
   * Create new test case
   * @param {Object} testCaseData - Test case data
   * @param {number} projectId - Project ID
   * @param {number} suiteId - Test suite ID
   * @param {Object} client - Database client
   * @returns {Promise<number>} Created test case ID
   */
  async createNewTestCase(testCaseData, projectId, suiteId, client) {
    const query = `
      INSERT INTO test_cases (
        test_suite_id, title, description, prerequisites,
        external_id, internal_id, version, node_order, execution_type,
        importance, is_open, active, import_source, imported_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id
    `;

    const values = [
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
   * Merge test case data (combine information from both)
   * @param {Object} testCaseData - New test case data
   * @param {number} testCaseId - Existing test case ID
   * @param {Object} client - Database client
   * @returns {Promise<number>} Test case ID
   */
  async mergeTestCaseData(testCaseData, testCaseId, client) {
    // Get existing test case data
    const existingQuery = `
      SELECT title, description, prerequisites, version, execution_type, importance, is_open, active
      FROM test_cases WHERE id = $1
    `;
    const existingResult = await client.query(existingQuery, [testCaseId]);
    const existing = existingResult.rows[0];

    // Merge logic: prefer newer data, but keep existing if new is empty
    const mergedData = {
      title: testCaseData.name || existing.title,
      description: testCaseData.summary || existing.description,
      prerequisites: testCaseData.preconditions || existing.prerequisites,
      version: testCaseData.version || existing.version,
      execution_type: testCaseData.execution_type || existing.execution_type,
      importance: testCaseData.importance || existing.importance,
      is_open: testCaseData.is_open === 1 ? true : existing.is_open,
      active: testCaseData.active === 1 ? true : existing.active
    };

    const query = `
      UPDATE test_cases SET
        title = $1,
        description = $2,
        prerequisites = $3,
        version = $4,
        execution_type = $5,
        importance = $6,
        is_open = $7,
        active = $8,
        imported_at = NOW()
      WHERE id = $9
    `;

    const values = [
      mergedData.title,
      mergedData.description,
      mergedData.prerequisites,
      mergedData.version,
      mergedData.execution_type,
      mergedData.importance,
      mergedData.is_open,
      mergedData.active,
      testCaseId
    ];

    await client.query(query, values);

    // Merge test steps (replace existing with new)
    await client.query('DELETE FROM test_steps WHERE test_case_id = $1', [testCaseId]);
    if (testCaseData.steps && testCaseData.steps.length > 0) {
      await this.importTestSteps(testCaseData.steps, testCaseId, client);
    }

    // Merge custom fields (replace existing with new)
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
          test_case_id, step_number, action, expected_result, execution_type
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
   * Import TestLink XML from content string
   * @param {string} xmlContent - XML content
   * @param {number} projectId - Project ID to import into
   * @param {string} strategy - Import strategy
   * @param {number} documentId - Document ID (optional)
   * @param {string} fileName - File name for logging
   * @returns {Promise<Object>} Import result
   */
  async importFromContent(xmlContent, projectId, strategy = TestLinkImportService.IMPORT_STRATEGIES.UPDATE_EXISTING, documentId = null, fileName = 'uploaded.xml') {
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
        total_test_cases: stats.totalTestCases,
        strategy: strategy
      });

      // Start database transaction
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');

        // Import test suites and test cases with strategy
        const result = await this.importTestSuiteRecursiveWithStrategy(parsedData, projectId, null, client, strategy);

        await client.query('COMMIT');

        // Update import log with success
        await this.updateImportLog(importLogId, 'completed', {
          imported_test_suites: result.importedSuites,
          imported_test_cases: result.importedCases,
          skipped_test_cases: result.skippedCases,
          updated_test_cases: result.updatedCases,
          strategy: strategy
        });

        return {
          success: true,
          importLogId,
          importedSuites: result.importedSuites,
          importedCases: result.importedCases,
          skippedCases: result.skippedCases,
          updatedCases: result.updatedCases,
          statistics: stats,
          strategy: strategy
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
   * Create import log entry
   * @param {number} projectId - Project ID
   * @param {number} documentId - Document ID
   * @param {string} importType - Import type
   * @param {string} fileName - File name
   * @param {number} fileSize - File size in bytes
   * @returns {Promise<number>} Import log ID
   */
  async createImportLog(projectId, documentId, importType, fileName, fileSize = 0, filePath = null) {
    // Set retry window to 48 hours from now
    const retryUntil = new Date();
    retryUntil.setHours(retryUntil.getHours() + 48);
    
    const query = `
      INSERT INTO import_logs (
        project_id, document_id, import_type, file_name, file_size, file_path, retry_until, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'processing')
      RETURNING id
    `;

    const result = await this.db.query(query, [
      projectId, 
      documentId, 
      importType, 
      fileName, 
      fileSize, 
      filePath,
      retryUntil
    ]);
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
    
    // Calculate duration and format data for frontend
    return result.rows.map(log => {
      let duration = '--';
      if (log.completed_at && log.started_at) {
        const startTime = new Date(log.started_at);
        const endTime = new Date(log.completed_at);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationSeconds = Math.round(durationMs / 1000);
        if (durationSeconds < 60) {
          duration = `${durationSeconds}s`;
        } else {
          const minutes = Math.floor(durationSeconds / 60);
          const seconds = durationSeconds % 60;
          duration = `${minutes}m ${seconds}s`;
        }
      }
      
      return {
        ...log,
        duration: duration
      };
    });
  }

  /**
   * Get all import logs across all projects
   * @returns {Promise<Array>} Import logs array with project information
   */
  async getAllImportLogs() {
    const query = `
      SELECT il.*, p.name as project_name 
      FROM import_logs il
      LEFT JOIN projects p ON il.project_id = p.id
      ORDER BY il.started_at DESC
    `;
    
    const result = await this.db.query(query);
    
    // Calculate duration and format data for frontend
    return result.rows.map(log => {
      let duration = '--';
      if (log.completed_at && log.started_at) {
        const startTime = new Date(log.started_at);
        const endTime = new Date(log.completed_at);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationSeconds = Math.round(durationMs / 1000);
        if (durationSeconds < 60) {
          duration = `${durationSeconds}s`;
        } else {
          const minutes = Math.floor(durationSeconds / 60);
          const seconds = durationSeconds % 60;
          duration = `${minutes}m ${seconds}s`;
        }
      }
      
      return {
        ...log,
        duration: duration
      };
    });
  }

  /**
   * Import generated test cases from LLM service
   * @param {Array} generatedTestCases - Test cases generated by LLM
   * @param {number} projectId - Target project ID
   * @param {string} strategy - Import strategy
   * @returns {Promise<Object>} Import result
   */
  async importGeneratedTestCases(generatedTestCases, projectId, strategy = 'update_existing') {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');
      
      let importedTestCases = 0;
      let updatedTestCases = 0;
      let skippedTestCases = 0;
      
      // Find or create default test suite for LLM generated test cases
      let testSuiteId;
      const suiteQuery = `
        SELECT id FROM test_suites 
        WHERE project_id = $1 AND name = 'LLM Generated Test Cases'
      `;
      const suiteResult = await client.query(suiteQuery, [projectId]);
      
      if (suiteResult.rows.length > 0) {
        testSuiteId = suiteResult.rows[0].id;
      } else {
        // Create default test suite
        const createSuiteQuery = `
          INSERT INTO test_suites (project_id, name, description)
          VALUES ($1, $2, $3)
          RETURNING id
        `;
        const newSuiteResult = await client.query(createSuiteQuery, [
          projectId,
          'LLM Generated Test Cases',
          'Test cases generated from documents using AI'
        ]);
        testSuiteId = newSuiteResult.rows[0].id;
      }
      
      // Import each test case
      for (const testCase of generatedTestCases) {
        try {
          // Insert test case
          const testCaseQuery = `
            INSERT INTO test_cases (
              test_suite_id, title, description, prerequisites, execution_type,
              external_id, version, priority, is_open, active, status, estimated_duration
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
          `;
          
          const testCaseParams = [
            testSuiteId,
            testCase.title,
            testCase.description,
            testCase.prerequisites,
            testCase.execution_type || 1,
            testCase.external_id,
            testCase.version || 1,
            testCase.priority || 2,
            testCase.is_open !== false,
            testCase.active !== false,
            testCase.status || 1,
            testCase.estimated_duration
          ];
          
          const testCaseResult = await client.query(testCaseQuery, testCaseParams);
          const newTestCaseId = testCaseResult.rows[0].id;
          
          // Insert test steps
          if (testCase.steps && Array.isArray(testCase.steps)) {
            for (const step of testCase.steps) {
              const stepQuery = `
                INSERT INTO test_steps (
                  test_case_id, step_number, action, expected_result, execution_type
                ) VALUES ($1, $2, $3, $4, $5)
              `;
              
              await client.query(stepQuery, [
                newTestCaseId,
                step.step_number,
                step.action,
                step.expected_result,
                step.execution_type || 1
              ]);
            }
          }
          
          // Insert custom fields
          if (testCase.custom_fields && Array.isArray(testCase.custom_fields)) {
            for (const field of testCase.custom_fields) {
              const fieldQuery = `
                INSERT INTO custom_fields (test_case_id, field_name, field_value)
                VALUES ($1, $2, $3)
              `;
              
              await client.query(fieldQuery, [
                newTestCaseId,
                field.field_name,
                field.field_value
              ]);
            }
          }
          
          importedTestCases++;
          
        } catch (testCaseError) {
          console.error('Error importing test case:', testCaseError);
          // Continue with other test cases
        }
      }
      
      await client.query('COMMIT');
      
      return {
        importedTestCases,
        importedTestSuites: testSuiteId ? 1 : 0,
        updatedTestCases,
        skippedTestCases,
        totalProcessed: generatedTestCases.length,
        testSuiteId
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to import generated test cases: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Delete import log by ID
   * @param {number} importLogId - Import log ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteImportLog(importLogId) {
    const query = `
      DELETE FROM import_logs WHERE id = $1
    `;
    
    const result = await this.db.query(query, [importLogId]);
    return result.rowCount > 0;
  }

  /**
   * Check if retry is allowed for an import
   * @param {number} importLogId - Import log ID
   * @returns {Promise<boolean>} Whether retry is allowed
   */
  async isRetryAllowed(importLogId) {
    const query = `
      SELECT retry_until, status FROM import_logs WHERE id = $1
    `;
    
    const result = await this.db.query(query, [importLogId]);
    if (result.rows.length === 0) {
      return false;
    }
    
    const log = result.rows[0];
    const now = new Date();
    const retryUntil = new Date(log.retry_until);
    
    return log.status === 'failed' && now < retryUntil;
  }

  /**
   * Clean up expired files (files past retry window)
   * @returns {Promise<number>} Number of files cleaned up
   */
  async cleanupExpiredFiles() {
    const query = `
      SELECT id, file_path FROM import_logs 
      WHERE retry_until < NOW() 
      AND file_path IS NOT NULL 
      AND cleanup_scheduled = FALSE
    `;
    
    const result = await this.db.query(query);
    let cleanedCount = 0;
    
    for (const log of result.rows) {
      try {
        // Delete the file if it exists
        if (log.file_path && fs.existsSync(log.file_path)) {
          await fs.unlink(log.file_path);
        }
        
        // Mark as cleaned up
        await this.db.query(
          'UPDATE import_logs SET cleanup_scheduled = TRUE WHERE id = $1',
          [log.id]
        );
        
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to cleanup file for import log ${log.id}:`, error);
      }
    }
    
    return cleanedCount;
  }

  /**
   * Get import logs that need cleanup
   * @returns {Promise<Array>} Array of import logs past retry window
   */
  async getExpiredImportLogs() {
    const query = `
      SELECT id, file_name, retry_until, status 
      FROM import_logs 
      WHERE retry_until < NOW() 
      AND file_path IS NOT NULL 
      AND cleanup_scheduled = FALSE
      ORDER BY retry_until ASC
    `;
    
    const result = await this.db.query(query);
    return result.rows;
  }
}

module.exports = TestLinkImportService; 