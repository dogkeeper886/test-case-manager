const ContentParserService = require('./ContentParserService');
const OpenAI = require('openai');

class LLMTestCaseService {
  constructor(db, options = {}) {
    this.db = db;
    this.contentParser = new ContentParserService();
    this.initialized = false;
    
    // Store options for later initialization
    this.options = options;
  }

  /**
   * Initialize LLM service with settings from database
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) return;

    try {
      // Load LLM settings from database
      const settings = await this.loadLLMSettings();
      
      this.provider = this.options.provider || settings.provider || 'openai';
      this.model = this.options.model || settings.model || 'gpt-4-turbo-preview';
      this.maxTokens = this.options.maxTokens || settings.maxTokens || 4000;
      this.temperature = this.options.temperature || settings.temperature || 0.1;
      
      // Initialize provider
      if (this.provider === 'openai') {
        this.openai = new OpenAI({
          apiKey: settings.apiKey
        });
      } else if (this.provider === 'anthropic') {
        // Future: Add Anthropic initialization
        throw new Error('Anthropic provider not yet implemented');
      }
      
      this.initialized = true;
    } catch (error) {
      // Fallback to environment variables if database settings fail
      console.warn('Failed to load LLM settings from database, falling back to environment variables:', error.message);
      
      this.provider = this.options.provider || process.env.LLM_PROVIDER || 'openai';
      this.model = this.options.model || process.env.LLM_MODEL || 'gpt-4-turbo-preview';
      this.maxTokens = this.options.maxTokens || parseInt(process.env.LLM_MAX_TOKENS) || 4000;
      this.temperature = this.options.temperature || parseFloat(process.env.LLM_TEMPERATURE) || 0.1;
      
      if (this.provider === 'openai') {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      }
      
      this.initialized = true;
    }
  }

  /**
   * Load LLM settings from database
   * @returns {Promise<Object>} LLM settings
   */
  async loadLLMSettings() {
    const result = await this.db.query(
      'SELECT setting_value FROM app_settings WHERE setting_key = $1',
      ['llm_config']
    );
    
    if (result.rows.length === 0) {
      throw new Error('LLM settings not configured. Please configure in Settings.');
    }
    
    const encryptedSettings = result.rows[0].setting_value;
    
    // Decrypt settings (assuming they're stored encrypted)
    let settings;
    try {
      // If settings are encrypted, decrypt them
      if (typeof encryptedSettings === 'string' && encryptedSettings.includes('encrypted:')) {
        const crypto = require('crypto');
        const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
        const [, encryptedData] = encryptedSettings.split('encrypted:');
        const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        settings = JSON.parse(decrypted);
      } else {
        // Settings are stored as plain JSON
        settings = typeof encryptedSettings === 'string' ? JSON.parse(encryptedSettings) : encryptedSettings;
      }
    } catch (decryptError) {
      throw new Error('Failed to decrypt LLM settings. Please reconfigure in Settings.');
    }
    
    return settings;
  }

  /**
   * Generate test cases from file content
   * @param {string} filePath - Path to uploaded file
   * @param {string} originalName - Original filename
   * @param {number} projectId - Target project ID
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated test cases with metadata
   */
  async generateFromFile(filePath, originalName, projectId, options = {}) {
    try {
      // Ensure service is initialized
      await this.init();
      
      // Parse the file content
      const parsedContent = await this.contentParser.parseFile(filePath, originalName);
      
      // Generate test cases from parsed content
      return await this.generateTestCases(parsedContent, projectId, {
        ...options,
        sourceFile: originalName
      });
    } catch (error) {
      throw new Error(`Failed to generate test cases from file: ${error.message}`);
    }
  }

  /**
   * Generate test cases from parsed content
   * @param {Object} parsedContent - Content parsed by ContentParserService
   * @param {number} projectId - Target project ID
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated test cases with metadata
   */
  async generateTestCases(parsedContent, projectId, options = {}) {
    try {
      // Ensure service is initialized
      await this.init();
      
      // Get project context for better generation
      const projectContext = await this.getProjectContext(projectId);
      
      // Build the prompt for LLM
      const prompt = this.buildGenerationPrompt(parsedContent, projectContext, options);
      
      // Call LLM to generate test cases
      const llmResponse = await this.callLLM(prompt);
      
      // Parse and validate the LLM response
      const testCases = this.parseTestCasesFromResponse(llmResponse);
      
      // Enrich test cases with project context and validation
      const enrichedTestCases = await this.enrichTestCases(testCases, projectId, parsedContent);
      
      return {
        testCases: enrichedTestCases,
        sourceMetadata: parsedContent.metadata,
        generationMetadata: {
          model: this.model,
          provider: this.provider,
          generatedAt: new Date().toISOString(),
          sourceFormat: parsedContent.format,
          prompt: options.includePrompt ? prompt : undefined
        },
        statistics: {
          totalGenerated: enrichedTestCases.length,
          averageConfidence: this.calculateAverageConfidence(enrichedTestCases),
          sourceIndicators: parsedContent.testPatterns?.summary || {}
        }
      };
    } catch (error) {
      throw new Error(`Test case generation failed: ${error.message}`);
    }
  }

  /**
   * Build the generation prompt for LLM
   * @param {Object} parsedContent - Parsed content
   * @param {Object} projectContext - Project information
   * @param {Object} options - Generation options
   * @returns {string} Complete prompt for LLM
   */
  buildGenerationPrompt(parsedContent, projectContext, options = {}) {
    const { content, testPatterns, format } = parsedContent;
    
    // Handle missing or invalid project context gracefully
    const projectName = projectContext?.name || 'Unknown Project';
    const testSuites = projectContext?.testSuites || [];
    const suitesText = testSuites.length > 0 ? testSuites.map(ts => ts.name).join(', ') : 'None';
    
    return `You are an expert test case analyst. Extract structured test cases from the following ${format || 'document'} document.

PROJECT CONTEXT:
- Project: ${projectName}
- Existing test suites: ${suitesText}
- Testing standards: Follow structured test case format with clear steps and expected results

DOCUMENT CONTENT:
${content}

EXTRACTION GUIDELINES:
1. Only extract genuine test scenarios, not general requirements or descriptions
2. Each test case must have: title, description, preconditions, actionable steps, and expected results
3. Steps should be numbered and specific enough for manual execution
4. Use original terminology from the document
5. Assign realistic priority levels (high/medium/low) based on context
6. Include relevant tags for categorization

OUTPUT FORMAT (valid JSON only):
{
  "testCases": [
    {
      "title": "Clear, descriptive test case title",
      "description": "Brief description of what this test validates",
      "preconditions": "Prerequisites or setup requirements",
      "steps": [
        {
          "stepNumber": 1,
          "action": "Specific action to perform",
          "expectedResult": "Expected outcome of this step"
        }
      ],
      "finalExpectedResult": "Overall expected result of the test case",
      "priority": "high|medium|low",
      "testType": "functional|integration|regression|performance|security",
      "tags": ["relevant", "tags"],
      "estimatedDuration": "5-10 minutes",
      "confidence": 0.85
    }
  ]
}

REQUIREMENTS:
- Generate only test cases that can be clearly executed
- Minimum 2 steps per test case, maximum 10 steps
- Each step must have both action and expected result
- Confidence score (0-1) based on how clearly the test case is defined in source
- Return empty array if no clear test cases can be extracted
- Ensure JSON is valid and properly formatted

Extract test cases now:`;
  }

  /**
   * Call the LLM provider
   * @param {string} prompt - Prompt to send
   * @returns {Promise<string>} LLM response
   */
  async callLLM(prompt) {
    try {
      if (this.provider === 'openai') {
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional test case analyst. Always respond with valid JSON formatted test cases.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          response_format: { type: 'json_object' }
        });
        
        return completion.choices[0].message.content;
      } else {
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      throw new Error(`LLM API call failed: ${error.message}`);
    }
  }

  /**
   * Parse test cases from LLM response
   * @param {string} response - Raw LLM response
   * @returns {Array} Parsed test cases
   */
  parseTestCasesFromResponse(response) {
    try {
      const parsed = JSON.parse(response);
      
      if (!parsed.testCases || !Array.isArray(parsed.testCases)) {
        throw new Error('Invalid response format: missing testCases array');
      }
      
      // Validate each test case structure
      const validTestCases = parsed.testCases.filter(testCase => {
        return testCase.title && 
               testCase.steps && 
               Array.isArray(testCase.steps) && 
               testCase.steps.length > 0;
      });
      
      return validTestCases;
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }

  /**
   * Enrich test cases with project context and validation
   * @param {Array} testCases - Raw test cases from LLM
   * @param {number} projectId - Project ID
   * @param {Object} parsedContent - Original parsed content
   * @returns {Promise<Array>} Enriched test cases
   */
  async enrichTestCases(testCases, projectId, parsedContent) {
    const enriched = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        // Validate and clean the test case
        const cleanedTestCase = this.validateAndCleanTestCase(testCase);
        
        // Add metadata
        cleanedTestCase.sourceFile = parsedContent.metadata.originalName;
        cleanedTestCase.generatedAt = new Date().toISOString();
        cleanedTestCase.projectId = projectId;
        
        // Generate external ID
        cleanedTestCase.external_id = `GEN_${Date.now()}_${i + 1}`;
        
        // Map to database schema
        const mappedTestCase = this.mapToSchema(cleanedTestCase);
        
        enriched.push(mappedTestCase);
      } catch (error) {
        console.warn(`Skipping invalid test case: ${error.message}`, testCase);
      }
    }
    
    return enriched;
  }

  /**
   * Validate and clean a single test case
   * @param {Object} testCase - Raw test case
   * @returns {Object} Cleaned test case
   */
  validateAndCleanTestCase(testCase) {
    // Required fields validation
    if (!testCase.title || testCase.title.trim().length === 0) {
      throw new Error('Test case title is required');
    }
    
    if (!testCase.steps || !Array.isArray(testCase.steps) || testCase.steps.length === 0) {
      throw new Error('Test case must have at least one step');
    }
    
    // Clean and validate steps
    const cleanedSteps = testCase.steps.map((step, index) => {
      if (!step.action || step.action.trim().length === 0) {
        throw new Error(`Step ${index + 1} must have an action`);
      }
      
      return {
        step_number: step.stepNumber || index + 1,
        action: step.action.trim(),
        expected_result: step.expectedResult?.trim() || 'Step completed successfully',
        execution_type: 1 // Manual execution
      };
    });
    
    // Set defaults and clean values
    return {
      ...testCase,
      title: testCase.title.trim(),
      description: testCase.description?.trim() || testCase.title,
      preconditions: testCase.preconditions?.trim() || '',
      steps: cleanedSteps,
      priority: this.validatePriority(testCase.priority),
      testType: this.validateTestType(testCase.testType),
      tags: Array.isArray(testCase.tags) ? testCase.tags : [],
      confidence: Math.max(0, Math.min(1, testCase.confidence || 0.5))
    };
  }

  /**
   * Map test case to database schema
   * @param {Object} testCase - Cleaned test case
   * @returns {Object} Schema-mapped test case
   */
  mapToSchema(testCase) {
    // Map priority to numeric value
    const priorityMap = { high: 1, medium: 2, low: 3 };
    const priority = priorityMap[testCase.priority] || 2;
    
    return {
      title: testCase.title,
      description: testCase.description,
      prerequisites: testCase.preconditions,
      external_id: testCase.external_id,
      version: 1,
      priority: priority,
      is_open: true,
      active: true,
      status: 1, // Draft status
      execution_type: 1, // Manual
      estimated_duration: testCase.estimatedDuration,
      steps: testCase.steps,
      custom_fields: [
        { field_name: 'generated_source', field_value: testCase.sourceFile },
        { field_name: 'generation_confidence', field_value: testCase.confidence.toString() },
        { field_name: 'test_type', field_value: testCase.testType },
        { field_name: 'tags', field_value: testCase.tags.join(',') }
      ]
    };
  }

  /**
   * Get project context for better generation
   * @param {number} projectId - Project ID (can be null for new project creation)
   * @returns {Promise<Object>} Project context
   */
  async getProjectContext(projectId) {
    try {
      // Handle null projectId (new project creation flow)
      if (!projectId || projectId === null) {
        return {
          id: null,
          name: 'New Project',
          description: 'Smart import into new project',
          testSuites: []
        };
      }
      
      // Get project details for existing project
      const projectResult = await this.db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      const project = projectResult.rows[0];
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Get existing test suites
      const suitesResult = await this.db.query(
        'SELECT id, name, description FROM test_suites WHERE project_id = $1',
        [projectId]
      );
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        testSuites: suitesResult.rows
      };
    } catch (error) {
      throw new Error(`Failed to get project context: ${error.message}`);
    }
  }

  /**
   * Validate priority value
   * @param {string} priority - Priority string
   * @returns {string} Valid priority
   */
  validatePriority(priority) {
    const validPriorities = ['high', 'medium', 'low'];
    return validPriorities.includes(priority?.toLowerCase()) ? priority.toLowerCase() : 'medium';
  }

  /**
   * Validate test type value
   * @param {string} testType - Test type string
   * @returns {string} Valid test type
   */
  validateTestType(testType) {
    const validTypes = ['functional', 'integration', 'regression', 'performance', 'security'];
    return validTypes.includes(testType?.toLowerCase()) ? testType.toLowerCase() : 'functional';
  }

  /**
   * Calculate average confidence score
   * @param {Array} testCases - Test cases with confidence scores
   * @returns {number} Average confidence
   */
  calculateAverageConfidence(testCases) {
    if (testCases.length === 0) return 0;
    
    const totalConfidence = testCases.reduce((sum, tc) => {
      const confidence = tc.custom_fields?.find(cf => cf.field_name === 'generation_confidence');
      return sum + (confidence ? parseFloat(confidence.field_value) : 0.5);
    }, 0);
    
    return totalConfidence / testCases.length;
  }

  /**
   * Get supported file formats from content parser
   * @returns {Array} Supported formats
   */
  getSupportedFormats() {
    return this.contentParser.getSupportedFormats();
  }
}

module.exports = LLMTestCaseService;