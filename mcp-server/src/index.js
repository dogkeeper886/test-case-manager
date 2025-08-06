#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const API_VERSION = process.env.API_VERSION || 'v1';

class TestCaseManagerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'test-case-manager-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupErrorHandling();
    this.registerHandlers();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  registerHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_projects',
            description: 'List all projects in the test case management system',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
          },
          {
            name: 'create_project',
            description: 'Create a new project',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Project name',
                },
                description: {
                  type: 'string',
                  description: 'Project description',
                },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_test_cases',
            description: 'List test cases, optionally filtered by project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'number',
                  description: 'Filter by project ID',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'create_test_case',
            description: 'Create a new test case',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'number',
                  description: 'Project ID',
                },
                test_suite_id: {
                  type: 'number',
                  description: 'Test suite ID (optional)',
                },
                title: {
                  type: 'string',
                  description: 'Test case title',
                },
                description: {
                  type: 'string',
                  description: 'Test case description',
                },
                prerequisites: {
                  type: 'string',
                  description: 'Prerequisites for executing the test case',
                },
                steps: {
                  type: 'array',
                  description: 'Array of test step objects with step_number, action, and expected_result',
                  items: {
                    type: 'object',
                    properties: {
                      step_number: {
                        type: 'number',
                        description: 'Step number (1, 2, 3, etc.)',
                      },
                      action: {
                        type: 'string',
                        description: 'Action to perform in this step',
                      },
                      expected_result: {
                        type: 'string',
                        description: 'Expected result for this step',
                      },
                      execution_type: {
                        type: 'number',
                        enum: [1, 2],
                        description: 'Execution type: 1=Manual, 2=Automated',
                      },
                    },
                    required: ['step_number', 'action', 'expected_result'],
                    additionalProperties: false,
                  },
                },
                test_steps: {
                  type: 'string',
                  description: 'Legacy test steps field (use steps array instead)',
                },
                expected_result: {
                  type: 'string',
                  description: 'Overall expected result of the test case',
                },
                priority: {
                  type: 'number',
                  enum: [1, 2, 3],
                  description: 'Test case priority: 1=High, 2=Medium, 3=Low',
                },
                importance: {
                  type: 'number',
                  enum: [1, 2, 3],
                  description: 'Test case importance: 1=Low, 2=Medium, 3=High',
                },
                execution_type: {
                  type: 'number',
                  enum: [1, 2],
                  description: 'Execution type: 1=Manual, 2=Automated',
                },
                external_id: {
                  type: 'string',
                  description: 'External reference ID',
                },
                internal_id: {
                  type: 'string',
                  description: 'Internal reference ID',
                },
                version: {
                  type: 'string',
                  description: 'Test case version (e.g., 1.0, 2.1)',
                },
                estimated_duration: {
                  type: 'number',
                  description: 'Estimated execution duration in minutes',
                },
                status: {
                  type: 'number',
                  description: 'Test case status (1=Active, 0=Inactive)',
                },
                is_open: {
                  type: 'boolean',
                  description: 'Whether the test case is open for execution',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the test case is active',
                },
              },
              required: ['project_id', 'title'],
              additionalProperties: false,
            },
          },
          {
            name: 'list_test_suites',
            description: 'List test suites, optionally filtered by project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'number',
                  description: 'Filter by project ID',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'create_test_suite',
            description: 'Create a new test suite',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'number',
                  description: 'Project ID',
                },
                name: {
                  type: 'string',
                  description: 'Test suite name',
                },
                description: {
                  type: 'string',
                  description: 'Test suite description',
                },
              },
              required: ['project_id', 'name'],
              additionalProperties: false,
            },
          },
          {
            name: 'export_testlink_xml',
            description: 'Export test cases in TestLink-compatible XML format',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'number',
                  description: 'Project ID (optional)',
                },
                test_suite_id: {
                  type: 'number',
                  description: 'Test suite ID (optional)',
                },
                test_case_ids: {
                  type: 'array',
                  items: { type: 'number' },
                  description: 'Specific test case IDs (optional)',
                },
                include_keywords: {
                  type: 'boolean',
                  description: 'Include keywords in export (default: true)',
                },
                include_requirements: {
                  type: 'boolean',
                  description: 'Include requirements in export (default: true)',
                },
                include_custom_fields: {
                  type: 'boolean',
                  description: 'Include custom fields in export (default: true)',
                },
              },
              additionalProperties: false,
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_projects':
            return await this.listProjects();
          
          case 'create_project':
            return await this.createProject(args);
          
          case 'list_test_cases':
            return await this.listTestCases(args);
          
          case 'create_test_case':
            return await this.createTestCase(args);
          
          case 'list_test_suites':
            return await this.listTestSuites(args);
          
          case 'create_test_suite':
            return await this.createTestSuite(args);
          
          case 'export_testlink_xml':
            return await this.exportTestLinkXML(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        console.error(`Error executing tool ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to execute tool: ${error.message}`
        );
      }
    });
  }

  async makeApiRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Network Error: Could not connect to API at ${API_BASE_URL}`);
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  async listProjects() {
    const response = await this.makeApiRequest(`/${API_VERSION}/projects`);
    const projects = response.data || response;
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${projects.length} projects:\n\n` +
                projects.map(p => `• ${p.name} (ID: ${p.id})\n  ${p.description || 'No description'}\n  Status: ${p.status || 'active'}\n  Test Cases: ${p.test_case_count || 0}`).join('\n\n'),
        },
      ],
    };
  }

  async createProject(args) {
    const response = await this.makeApiRequest(`/${API_VERSION}/projects`, 'POST', {
      name: args.name,
      description: args.description || '',
    });
    const project = response.data || response;
    
    return {
      content: [
        {
          type: 'text',
          text: `Created project "${project.name}" with ID ${project.id}`,
        },
      ],
    };
  }

  async listTestCases(args) {
    let endpoint = `/${API_VERSION}/test-cases?limit=10`;
    if (args.project_id) {
      endpoint += `&projectId=${args.project_id}`;
    }
    
    const response = await this.makeApiRequest(endpoint);
    const testCases = response.data || response;
    const total = response.pagination?.total || testCases.length;
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${total} test cases (showing first 10):\n\n` +
                testCases.map(tc => 
                  `• ${tc.title} (ID: ${tc.id})\n  Priority: ${tc.priority}\n  Status: ${tc.status}\n  Suite: ${tc.test_suite_name || 'None'}`
                ).join('\n\n') +
                (total > 10 ? `\n\n... and ${total - 10} more` : ''),
        },
      ],
    };
  }

  async createTestCase(args) {
    // Prepare the test case data for non-versioned API (/api/testcases)
    const testCaseData = {
      test_suite_id: args.test_suite_id,
      title: args.title,
      description: args.description || '',
      prerequisites: args.prerequisites || '',
      execution_type: args.execution_type || 1,
      external_id: args.external_id || '',
      version: args.version || '1.0',
      priority: args.priority || 2,
      is_open: args.is_open !== false, // default to true
      active: args.active !== false,   // default to true
      status: args.status || 1,
      estimated_duration: args.estimated_duration,
    };

    // Handle legacy test_steps and expected_result (REQUIRED by validation)
    if (args.test_steps && !args.steps) {
      testCaseData.test_steps = args.test_steps;
      testCaseData.expected_result = args.expected_result || '';
    } else if (args.steps && Array.isArray(args.steps)) {
      // Convert steps array to legacy format (required by backend validation)
      testCaseData.test_steps = args.steps.map(step => 
        `Step ${step.step_number}: ${step.action}`
      ).join('\n\n');
      testCaseData.expected_result = args.steps.map(step => 
        `Step ${step.step_number}: ${step.expected_result}`
      ).join('\n\n');
    } else {
      // Fallback - ensure required fields are present
      testCaseData.test_steps = args.description || 'Test steps to be defined';
      testCaseData.expected_result = 'Expected results to be defined';
    }

    // Debug logging
    console.log('Creating test case with data:', JSON.stringify(testCaseData, null, 2));
    
    // Create the test case first using non-versioned API
    const response = await this.makeApiRequest(`/testcases`, 'POST', testCaseData);
    const testCase = response.data || response;

    // If we have structured steps, add them via PUT request
    if (args.steps && Array.isArray(args.steps) && testCase.id) {
      try {
        const updateData = {
          steps: args.steps
        };
        await this.makeApiRequest(`/testcases/${testCase.id}`, 'PUT', updateData);
      } catch (stepError) {
        console.warn('Warning: Failed to add structured steps:', stepError.message);
        // Continue - the basic test case was created successfully
      }
    }
    
    // Build response with created fields info
    let responseText = `Created test case "${testCase.title}" with ID ${testCase.id}`;
    
    if (args.steps && Array.isArray(args.steps)) {
      responseText += `\n  ${args.steps.length} test steps added`;
    }
    
    if (args.priority) {
      const priorityText = args.priority === 1 ? 'High' : args.priority === 2 ? 'Medium' : 'Low';
      responseText += `\n  Priority: ${priorityText}`;
    }
    
    if (args.importance) {
      const importanceText = args.importance === 1 ? 'Low' : args.importance === 2 ? 'Medium' : 'High';
      responseText += `\n  Importance: ${importanceText}`;
    }
    
    if (args.execution_type) {
      const executionText = args.execution_type === 1 ? 'Manual' : 'Automated';
      responseText += `\n  Execution: ${executionText}`;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
    };
  }

  async listTestSuites(args) {
    let endpoint = `/${API_VERSION}/test-suites`;
    if (args.project_id) {
      endpoint += `?project_id=${args.project_id}`;
    }
    
    const response = await this.makeApiRequest(endpoint);
    const testSuites = response.data || response;
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${testSuites.length} test suites:\n\n` +
                testSuites.map(ts => `• ${ts.name} (ID: ${ts.id})\n  ${ts.description || 'No description'}\n  Test Cases: ${ts.test_case_count || 0}`).join('\n\n'),
        },
      ],
    };
  }

  async createTestSuite(args) {
    const response = await this.makeApiRequest(`/${API_VERSION}/test-suites`, 'POST', args);
    const testSuite = response.data || response;
    
    return {
      content: [
        {
          type: 'text',
          text: `Created test suite "${testSuite.name}" with ID ${testSuite.id}`,
        },
      ],
    };
  }

  async exportTestLinkXML(args) {
    const exportOptions = {
      project_id: args.project_id,
      test_suite_id: args.test_suite_id,
      test_case_ids: args.test_case_ids,
      include_keywords: args.include_keywords !== false,
      include_requirements: args.include_requirements !== false,
      include_custom_fields: args.include_custom_fields !== false
    };

    try {
      const response = await this.makeApiRequest('/export/testlink', 'POST', exportOptions);
      
      if (!response.success) {
        throw new Error(response.error || 'Export failed');
      }

      // Count elements for summary
      const xmlContent = response.xml_content;
      const testCaseCount = (xmlContent.match(/<testcase/g) || []).length;
      const testSuiteCount = (xmlContent.match(/<testsuite/g) || []).length;

      let exportSummary = `Successfully exported ${testCaseCount} test cases`;
      if (testSuiteCount > 0) {
        exportSummary += ` in ${testSuiteCount} test suites`;
      }

      // Add export details
      if (args.project_id) {
        exportSummary += `\n  Project ID: ${args.project_id}`;
      }
      if (args.test_suite_id) {
        exportSummary += `\n  Test Suite ID: ${args.test_suite_id}`;
      }
      if (args.test_case_ids && args.test_case_ids.length > 0) {
        exportSummary += `\n  Specific Test Cases: ${args.test_case_ids.join(', ')}`;
      }

      exportSummary += `\n  Include Keywords: ${exportOptions.include_keywords}`;
      exportSummary += `\n  Include Requirements: ${exportOptions.include_requirements}`;
      exportSummary += `\n  Include Custom Fields: ${exportOptions.include_custom_fields}`;

      // Add warnings if any
      if (response.validation && response.validation.warnings.length > 0) {
        exportSummary += `\n\nWarnings:`;
        response.validation.warnings.forEach(warning => {
          exportSummary += `\n  • ${warning}`;
        });
      }

      exportSummary += `\n\nTestLink XML (${xmlContent.length} characters):\n\n${xmlContent}`;

      return {
        content: [
          {
            type: 'text',
            text: exportSummary,
          },
        ],
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Export failed: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new TestCaseManagerMCPServer();
server.run().catch(console.error);