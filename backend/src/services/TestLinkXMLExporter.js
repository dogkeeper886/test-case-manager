const xml2js = require('xml2js');

/**
 * TestLinkXMLExporter - Export test cases in TestLink-compatible XML format
 * 
 * CRITICAL: This service addresses the missing export functionality identified in Epic 4
 * Story 4.2 - implementing the missing 30% TestLink compatibility
 */
class TestLinkXMLExporter {
  constructor(db) {
    this.db = db;
    this.builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      explicitRoot: true,
      explicitArray: false,
      renderOpts: {
        'pretty': true,
        'indent': '  ',
        'newline': '\n'
      }
    });
  }

  /**
   * Export test cases as TestLink-compatible XML
   * @param {Object} options - Export options
   * @param {number} options.project_id - Project ID (optional)
   * @param {number} options.test_suite_id - Test suite ID (optional)
   * @param {Array} options.test_case_ids - Specific test case IDs (optional)
   * @param {boolean} options.include_keywords - Include keywords (default: true)
   * @param {boolean} options.include_requirements - Include requirements (default: true)
   * @param {boolean} options.include_custom_fields - Include custom fields (default: true)
   * @returns {Promise<string>} TestLink XML content
   */
  async exportTestCases(options = {}) {
    const {
      project_id,
      test_suite_id,
      test_case_ids,
      include_keywords = true,
      include_requirements = true,
      include_custom_fields = true
    } = options;

    try {
      // Build the test suite structure
      const testSuiteData = await this.buildTestSuiteStructure({
        project_id,
        test_suite_id,
        test_case_ids,
        include_keywords,
        include_requirements,
        include_custom_fields
      });

      // Convert to TestLink XML format
      const xmlData = this.convertToTestLinkXML(testSuiteData);

      // Generate XML string
      return this.builder.buildObject(xmlData);
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Export single test case as TestLink XML
   * @param {number} testCaseId - Test case ID
   * @param {Object} options - Export options
   * @returns {Promise<string>} TestLink XML content
   */
  async exportSingleTestCase(testCaseId, options = {}) {
    const {
      include_keywords = true,
      include_requirements = true,
      include_custom_fields = true
    } = options;

    try {
      // Get test case data
      const testCase = await this.getTestCaseForExport(testCaseId, {
        include_keywords,
        include_requirements,
        include_custom_fields
      });

      if (!testCase) {
        throw new Error(`Test case with ID ${testCaseId} not found`);
      }

      // Convert to TestLink XML format
      const xmlData = {
        testcases: {
          testcase: this.convertTestCaseToXML(testCase)
        }
      };

      // Generate XML string
      return this.builder.buildObject(xmlData);
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Build test suite structure with nested test cases
   * @param {Object} options - Build options
   * @returns {Promise<Object>} Test suite structure
   */
  async buildTestSuiteStructure(options) {
    const { project_id, test_suite_id, test_case_ids } = options;

    if (test_case_ids && test_case_ids.length > 0) {
      // Export specific test cases
      return await this.buildTestCasesOnlyStructure(test_case_ids, options);
    } else if (test_suite_id) {
      // Export specific test suite
      return await this.buildSingleTestSuiteStructure(test_suite_id, options);
    } else if (project_id) {
      // Export entire project
      return await this.buildProjectStructure(project_id, options);
    } else {
      throw new Error('Must specify either project_id, test_suite_id, or test_case_ids');
    }
  }

  /**
   * Build structure for specific test cases only
   * @param {Array} testCaseIds - Test case IDs
   * @param {Object} options - Build options
   * @returns {Promise<Object>} Test cases structure
   */
  async buildTestCasesOnlyStructure(testCaseIds, options) {
    const testCases = [];

    for (const testCaseId of testCaseIds) {
      const testCase = await this.getTestCaseForExport(testCaseId, options);
      if (testCase) {
        testCases.push(testCase);
      }
    }

    return { testCases, name: 'Exported Test Cases' };
  }

  /**
   * Build structure for single test suite
   * @param {number} testSuiteId - Test suite ID
   * @param {Object} options - Build options
   * @returns {Promise<Object>} Test suite structure
   */
  async buildSingleTestSuiteStructure(testSuiteId, options) {
    // Get test suite data
    const query = `
      SELECT id, name, description, external_id, node_order, parent_suite_id, details
      FROM test_suites WHERE id = $1
    `;
    const result = await this.db.query(query, [testSuiteId]);

    if (result.rows.length === 0) {
      throw new Error(`Test suite with ID ${testSuiteId} not found`);
    }

    const testSuite = result.rows[0];

    // Get test cases in this suite
    const testCases = await this.getTestCasesInSuite(testSuiteId, options);

    // Get child test suites
    const childSuites = await this.getChildTestSuites(testSuiteId, options);

    return {
      ...testSuite,
      testCases,
      childSuites
    };
  }

  /**
   * Build structure for entire project
   * @param {number} projectId - Project ID
   * @param {Object} options - Build options
   * @returns {Promise<Object>} Project structure
   */
  async buildProjectStructure(projectId, options) {
    // Get root test suites
    const query = `
      SELECT id, name, description, external_id, node_order, details
      FROM test_suites 
      WHERE project_id = $1 AND parent_suite_id IS NULL
      ORDER BY node_order, name
    `;
    const result = await this.db.query(query, [projectId]);

    if (result.rows.length === 0) {
      // Create a virtual root suite if no root suites exist
      const testCases = await this.getTestCasesInProject(projectId, options);
      return {
        name: 'Project Export',
        testCases,
        childSuites: []
      };
    }

    // Use first root suite as main container
    const rootSuite = result.rows[0];
    const testCases = await this.getTestCasesInSuite(rootSuite.id, options);
    const childSuites = await this.getChildTestSuites(rootSuite.id, options);

    return {
      ...rootSuite,
      testCases,
      childSuites
    };
  }

  /**
   * Get test case data formatted for export
   * @param {number} testCaseId - Test case ID
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Test case data
   */
  async getTestCaseForExport(testCaseId, options) {
    const {
      include_keywords,
      include_requirements,
      include_custom_fields
    } = options;

    // Get basic test case data
    const query = `
      SELECT tc.*, ts.name as test_suite_name
      FROM test_cases tc
      LEFT JOIN test_suites ts ON tc.test_suite_id = ts.id
      WHERE tc.id = $1
    `;
    const result = await this.db.query(query, [testCaseId]);

    if (result.rows.length === 0) {
      return null;
    }

    const testCase = result.rows[0];

    // Get test steps
    const stepsQuery = `
      SELECT step_number, action, expected_result, execution_type
      FROM test_steps
      WHERE test_case_id = $1
      ORDER BY step_number
    `;
    const stepsResult = await this.db.query(stepsQuery, [testCaseId]);
    testCase.steps = stepsResult.rows;

    // Get keywords if requested
    if (include_keywords) {
      const keywordsQuery = `
        SELECT k.name, k.notes
        FROM keywords k
        JOIN test_case_keywords tck ON k.id = tck.keyword_id
        WHERE tck.test_case_id = $1
      `;
      const keywordsResult = await this.db.query(keywordsQuery, [testCaseId]);
      testCase.keywords = keywordsResult.rows;
    }

    // Get requirements if requested
    if (include_requirements) {
      const reqQuery = `
        SELECT r.doc_id, r.title, r.req_spec_title
        FROM requirements r
        JOIN test_case_requirements tcr ON r.id = tcr.requirement_id
        WHERE tcr.test_case_id = $1
      `;
      const reqResult = await this.db.query(reqQuery, [testCaseId]);
      testCase.requirements = reqResult.rows;
    }

    // Get custom fields if requested
    if (include_custom_fields) {
      const cfQuery = `
        SELECT field_name as name, field_value as value
        FROM custom_fields
        WHERE test_case_id = $1
      `;
      const cfResult = await this.db.query(cfQuery, [testCaseId]);
      testCase.custom_fields = cfResult.rows;
    }

    return testCase;
  }

  /**
   * Get test cases in a test suite
   * @param {number} testSuiteId - Test suite ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Test cases array
   */
  async getTestCasesInSuite(testSuiteId, options) {
    const query = `
      SELECT id FROM test_cases WHERE test_suite_id = $1 ORDER BY node_order, title
    `;
    const result = await this.db.query(query, [testSuiteId]);

    const testCases = [];
    for (const row of result.rows) {
      const testCase = await this.getTestCaseForExport(row.id, options);
      if (testCase) {
        testCases.push(testCase);
      }
    }

    return testCases;
  }

  /**
   * Get test cases in a project (not in any test suite)
   * @param {number} projectId - Project ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Test cases array
   */
  async getTestCasesInProject(projectId, options) {
    const query = `
      SELECT id FROM test_cases 
      WHERE project_id = $1 AND test_suite_id IS NULL 
      ORDER BY node_order, title
    `;
    const result = await this.db.query(query, [projectId]);

    const testCases = [];
    for (const row of result.rows) {
      const testCase = await this.getTestCaseForExport(row.id, options);
      if (testCase) {
        testCases.push(testCase);
      }
    }

    return testCases;
  }

  /**
   * Get child test suites
   * @param {number} parentSuiteId - Parent test suite ID
   * @param {Object} options - Options
   * @returns {Promise<Array>} Child test suites array
   */
  async getChildTestSuites(parentSuiteId, options) {
    const query = `
      SELECT id FROM test_suites 
      WHERE parent_suite_id = $1 
      ORDER BY node_order, name
    `;
    const result = await this.db.query(query, [parentSuiteId]);

    const childSuites = [];
    for (const row of result.rows) {
      const childSuite = await this.buildSingleTestSuiteStructure(row.id, options);
      childSuites.push(childSuite);
    }

    return childSuites;
  }

  /**
   * Convert test suite structure to TestLink XML format
   * @param {Object} testSuiteData - Test suite data
   * @returns {Object} TestLink XML structure
   */
  convertToTestLinkXML(testSuiteData) {
    return {
      testsuite: this.convertTestSuiteToXML(testSuiteData)
    };
  }

  /**
   * Convert test suite to XML format
   * @param {Object} testSuite - Test suite data
   * @returns {Object} XML structure
   */
  convertTestSuiteToXML(testSuite) {
    const xmlSuite = {
      $: { name: testSuite.name || 'Test Suite' },
      details: this.wrapInCDATA(testSuite.details || testSuite.description || '')
    };

    // Add test cases (handle both testCases and test_cases property names)
    const testCases = testSuite.testCases || testSuite.test_cases;
    if (testCases && testCases.length > 0) {
      xmlSuite.testcase = testCases.map(tc => this.convertTestCaseToXML(tc));
    }

    // Add child test suites (handle both childSuites and test_suites property names)
    const childSuites = testSuite.childSuites || testSuite.test_suites;
    if (childSuites && childSuites.length > 0) {
      xmlSuite.testsuite = childSuites.map(cs => this.convertTestSuiteToXML(cs));
    }

    return xmlSuite;
  }

  /**
   * Convert test case to TestLink XML format
   * @param {Object} testCase - Test case data
   * @returns {Object} XML structure
   */
  convertTestCaseToXML(testCase) {
    const xmlTestCase = {
      $: {
        name: testCase.title || testCase.name,
        internalid: testCase.internal_id || testCase.id
      },
      node_order: this.wrapInCDATA(String(testCase.node_order || 0)),
      externalid: this.wrapInCDATA(testCase.external_id || ''),
      summary: this.wrapInCDATA(testCase.description || testCase.summary || ''),
      preconditions: this.wrapInCDATA(testCase.prerequisites || testCase.preconditions || ''),
      execution_type: testCase.execution_type || 1,
      importance: testCase.importance || 2
    };

    // Add estimated execution duration if present
    if (testCase.estimated_exec_duration) {
      xmlTestCase.estimated_exec_duration = testCase.estimated_exec_duration;
    }

    // Add test steps in proper TestLink nested structure
    if (testCase.steps && testCase.steps.length > 0) {
      xmlTestCase.steps = {
        step: testCase.steps.map(step => ({
          step_number: step.step_number,
          actions: this.wrapInCDATA(step.action || step.actions),
          expectedresults: this.wrapInCDATA(step.expected_result || step.expected_results),
          execution_type: step.execution_type || 1
        }))
      };
    }

    // Add keywords
    if (testCase.keywords && testCase.keywords.length > 0) {
      xmlTestCase.keywords = {
        keyword: testCase.keywords.map(keyword => ({
          $: { name: keyword.name },
          notes: this.wrapInCDATA(keyword.notes || '')
        }))
      };
    }

    // Add requirements
    if (testCase.requirements && testCase.requirements.length > 0) {
      xmlTestCase.requirements = {
        requirement: testCase.requirements.map(req => ({
          req_spec_title: this.wrapInCDATA(req.req_spec_title || ''),
          doc_id: this.wrapInCDATA(req.doc_id),
          title: this.wrapInCDATA(req.title)
        }))
      };
    }

    // Add custom fields
    if (testCase.custom_fields && testCase.custom_fields.length > 0) {
      xmlTestCase.custom_fields = {
        custom_field: testCase.custom_fields.map(field => ({
          name: this.wrapInCDATA(field.name),
          value: this.wrapInCDATA(field.value || '')
        }))
      };
    }

    return xmlTestCase;
  }

  /**
   * Wrap content in CDATA section if it contains HTML or special characters
   * @param {string} content - Content to potentially wrap
   * @returns {string} Content wrapped in CDATA if necessary
   */
  wrapInCDATA(content) {
    if (!content) return '';
    
    // Check if content contains HTML tags or special XML characters
    const needsCDATA = /<[^>]+>/.test(content) || 
                      content.includes('&') || 
                      content.includes('<') || 
                      content.includes('>') ||
                      content.includes('"');
    
    if (needsCDATA) {
      return `<![CDATA[${content}]]>`;
    }
    
    return content;
  }

  /**
   * Export test cases to file
   * @param {string} filePath - Output file path
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result
   */
  async exportToFile(filePath, options = {}) {
    const fs = require('fs').promises;
    
    try {
      const xmlContent = await this.exportTestCases(options);
      await fs.writeFile(filePath, xmlContent, 'utf8');
      
      return {
        success: true,
        filePath,
        message: 'Export completed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to export to file: ${error.message}`);
    }
  }

  /**
   * Validate exported XML against TestLink format requirements
   * @param {string} xmlContent - XML content to validate
   * @returns {Object} Validation result
   */
  validateExportedXML(xmlContent) {
    const errors = [];
    const warnings = [];

    try {
      // Basic XML structure validation
      if (!xmlContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
        warnings.push('Missing XML declaration with UTF-8 encoding');
      }

      if (!xmlContent.includes('<testsuite') && !xmlContent.includes('<testcases')) {
        errors.push('Missing testsuite or testcases root element');
      }

      // Check for CDATA sections where expected
      if (xmlContent.includes('<summary>') && !xmlContent.includes('<![CDATA[')) {
        warnings.push('Summary content should use CDATA sections for HTML content');
      }

      // Check for proper attribute format
      if (xmlContent.includes('<testcase') && !xmlContent.includes('internalid=')) {
        errors.push('Test cases missing required internalid attribute');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings
      };
    }
  }
}

module.exports = TestLinkXMLExporter;