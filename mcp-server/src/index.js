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
                test_steps: {
                  type: 'string',
                  description: 'Test execution steps',
                },
                expected_result: {
                  type: 'string',
                  description: 'Expected test result',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Test case priority',
                },
              },
              required: ['project_id', 'title', 'test_steps', 'expected_result'],
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
    const response = await this.makeApiRequest(`/${API_VERSION}/test-cases`, 'POST', args);
    const testCase = response.data || response;
    
    return {
      content: [
        {
          type: 'text',
          text: `Created test case "${testCase.title}" with ID ${testCase.id}`,
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new TestCaseManagerMCPServer();
server.run().catch(console.error);