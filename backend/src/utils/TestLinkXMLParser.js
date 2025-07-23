const xml2js = require('xml2js');
const fs = require('fs').promises;

class TestLinkXMLParser {
  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      normalize: true,
      normalizeTags: true,
      trim: true
    });
  }

  /**
   * Parse a TestLink XML file
   * @param {string} filePath - Path to the XML file
   * @returns {Promise<Object>} Parsed data structure
   */
  async parseFile(filePath) {
    try {
      const xmlContent = await fs.readFile(filePath, 'utf8');
      const result = await this.parser.parseStringPromise(xmlContent);
      
      if (!result.testsuite) {
        throw new Error('Invalid TestLink XML: No testsuite root element found');
      }

      return this.parseTestSuite(result.testsuite);
    } catch (error) {
      throw new Error(`Failed to parse TestLink XML file: ${error.message}`);
    }
  }

  /**
   * Parse XML content string
   * @param {string} xmlContent - XML content as string
   * @returns {Promise<Object>} Parsed data structure
   */
  async parseContent(xmlContent) {
    try {
      const result = await this.parser.parseStringPromise(xmlContent);
      
      if (!result.testsuite) {
        throw new Error('Invalid TestLink XML: No testsuite root element found');
      }

      return this.parseTestSuite(result.testsuite);
    } catch (error) {
      throw new Error(`Failed to parse TestLink XML content: ${error.message}`);
    }
  }

  /**
   * Parse a test suite element recursively
   * @param {Object} suiteElement - Test suite XML element
   * @returns {Object} Parsed test suite data
   */
  parseTestSuite(suiteElement) {
    const suite = {
      id: suiteElement.id,
      name: suiteElement.name,
      node_order: parseInt(suiteElement.node_order) || 0,
      details: suiteElement.details || '',
      test_suites: [],
      test_cases: []
    };

    // Parse nested test suites
    if (suiteElement.testsuite) {
      const suites = Array.isArray(suiteElement.testsuite) 
        ? suiteElement.testsuite 
        : [suiteElement.testsuite];
      
      suite.test_suites = suites.map(childSuite => this.parseTestSuite(childSuite));
    }

    // Parse test cases
    if (suiteElement.testcase) {
      const testCases = Array.isArray(suiteElement.testcase) 
        ? suiteElement.testcase 
        : [suiteElement.testcase];
      
      suite.test_cases = testCases.map(testCase => this.parseTestCase(testCase));
    }

    return suite;
  }

  /**
   * Parse a test case element
   * @param {Object} testCaseElement - Test case XML element
   * @returns {Object} Parsed test case data
   */
  parseTestCase(testCaseElement) {
    const testCase = {
      internal_id: testCaseElement.internalid,
      name: testCaseElement.name,
      node_order: parseInt(testCaseElement.node_order) || 0,
      external_id: testCaseElement.externalid || '',
      version: testCaseElement.version || '1',
      summary: testCaseElement.summary || '',
      preconditions: testCaseElement.preconditions || '',
      execution_type: parseInt(testCaseElement.execution_type) || 1,
      importance: parseInt(testCaseElement.importance) || 2,
      status: parseInt(testCaseElement.status) || 1,
      is_open: parseInt(testCaseElement.is_open) || 1,
      active: parseInt(testCaseElement.active) || 1,
      estimated_exec_duration: testCaseElement.estimated_exec_duration || '',
      steps: [],
      custom_fields: []
    };

    // Parse test steps
    if (testCaseElement.steps && testCaseElement.steps.step) {
      const steps = Array.isArray(testCaseElement.steps.step) 
        ? testCaseElement.steps.step 
        : [testCaseElement.steps.step];
      
      testCase.steps = steps.map(step => this.parseTestStep(step));
    }

    // Parse custom fields
    if (testCaseElement.custom_fields && testCaseElement.custom_fields.custom_field) {
      const fields = Array.isArray(testCaseElement.custom_fields.custom_field) 
        ? testCaseElement.custom_fields.custom_field 
        : [testCaseElement.custom_fields.custom_field];
      
      testCase.custom_fields = fields.map(field => this.parseCustomField(field));
    }

    return testCase;
  }

  /**
   * Parse a test step element
   * @param {Object} stepElement - Test step XML element
   * @returns {Object} Parsed test step data
   */
  parseTestStep(stepElement) {
    return {
      step_number: parseInt(stepElement.step_number) || 1,
      actions: stepElement.actions || '',
      expected_results: stepElement.expectedresults || '',
      execution_type: parseInt(stepElement.execution_type) || 1
    };
  }

  /**
   * Parse a custom field element
   * @param {Object} fieldElement - Custom field XML element
   * @returns {Object} Parsed custom field data
   */
  parseCustomField(fieldElement) {
    return {
      name: fieldElement.name || '',
      value: fieldElement.value || ''
    };
  }

  /**
   * Extract CDATA content from XML text
   * @param {string} text - XML text that may contain CDATA
   * @returns {string} Clean text content
   */
  extractCDATAContent(text) {
    if (!text) return '';
    
    // Remove CDATA wrapper if present
    const cdataMatch = text.match(/<!\[CDATA\[(.*?)\]\]>/s);
    if (cdataMatch) {
      return cdataMatch[1].trim();
    }
    
    return text.trim();
  }

  /**
   * Clean HTML content from text
   * @param {string} text - Text that may contain HTML
   * @returns {string} Clean text content
   */
  cleanHTMLContent(text) {
    if (!text) return '';
    
    // Basic HTML tag removal (for security and display purposes)
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .trim();
  }

  /**
   * Validate parsed data structure
   * @param {Object} data - Parsed data to validate
   * @returns {Object} Validation result with errors array
   */
  validateParsedData(data) {
    const errors = [];

    if (!data) {
      errors.push('No data to validate');
      return { isValid: false, errors };
    }

    if (!data.name) {
      errors.push('Test suite name is required');
    }

    // Validate test cases
    if (data.test_cases) {
      data.test_cases.forEach((testCase, index) => {
        if (!testCase.name) {
          errors.push(`Test case ${index + 1}: Name is required`);
        }
        if (!testCase.internal_id) {
          errors.push(`Test case ${index + 1}: Internal ID is required`);
        }
      });
    }

    // Recursively validate nested test suites
    if (data.test_suites) {
      data.test_suites.forEach((suite, index) => {
        const validation = this.validateParsedData(suite);
        validation.errors.forEach(error => {
          errors.push(`Test suite ${index + 1}: ${error}`);
        });
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get statistics about the parsed data
   * @param {Object} data - Parsed data
   * @returns {Object} Statistics object
   */
  getStatistics(data) {
    let totalTestSuites = 1; // Count the root suite
    let totalTestCases = 0;

    const countRecursive = (suite) => {
      if (suite.test_suites) {
        totalTestSuites += suite.test_suites.length;
        suite.test_suites.forEach(countRecursive);
      }
      if (suite.test_cases) {
        totalTestCases += suite.test_cases.length;
      }
    };

    countRecursive(data);

    return {
      totalTestSuites,
      totalTestCases,
      hasNestedSuites: data.test_suites && data.test_suites.length > 0,
      maxDepth: this.calculateMaxDepth(data)
    };
  }

  /**
   * Calculate the maximum depth of nested test suites
   * @param {Object} data - Parsed data
   * @returns {number} Maximum depth
   */
  calculateMaxDepth(data, currentDepth = 1) {
    if (!data.test_suites || data.test_suites.length === 0) {
      return currentDepth;
    }

    const maxChildDepth = Math.max(
      ...data.test_suites.map(suite => this.calculateMaxDepth(suite, currentDepth + 1))
    );

    return maxChildDepth;
  }
}

module.exports = TestLinkXMLParser; 