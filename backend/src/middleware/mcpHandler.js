// MCP HTTP Transport Middleware for Test Case Manager
// Integrates MCP functionality into the main Express backend

// Dynamic imports for ESM modules
let Server, CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError;

async function initializeMCP() {
  if (!Server) {
    const serverModule = await import('@modelcontextprotocol/sdk/server/index.js');
    const typesModule = await import('@modelcontextprotocol/sdk/types.js');
    
    Server = serverModule.Server;
    CallToolRequestSchema = typesModule.CallToolRequestSchema;
    ErrorCode = typesModule.ErrorCode;
    ListToolsRequestSchema = typesModule.ListToolsRequestSchema;
    McpError = typesModule.McpError;
  }
}

// MCP Tool definitions - reused from standalone servers
const TOOLS = {
  // Project Management Tools
  list_projects: {
    name: 'list_projects',
    description: 'Get all projects with their metadata',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },
  
  get_project: {
    name: 'get_project',
    description: 'Get a specific project by ID',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'The ID of the project to retrieve'
        }
      },
      required: ['project_id'],
      additionalProperties: false
    }
  },
  
  create_project: {
    name: 'create_project',
    description: 'Create a new project',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the project'
        },
        description: {
          type: 'string',
          description: 'The description of the project'
        }
      },
      required: ['name'],
      additionalProperties: false
    }
  },

  // Test Suite Management Tools
  list_test_suites: {
    name: 'list_test_suites',
    description: 'Get test suites, optionally filtered by project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'Optional project ID to filter test suites'
        }
      },
      additionalProperties: false
    }
  },

  create_test_suite: {
    name: 'create_test_suite',
    description: 'Create a new test suite within a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'The ID of the project'
        },
        name: {
          type: 'string',
          description: 'The name of the test suite'
        },
        description: {
          type: 'string',
          description: 'The description of the test suite'
        }
      },
      required: ['project_id', 'name'],
      additionalProperties: false
    }
  },

  // Test Case Management Tools
  list_test_cases: {
    name: 'list_test_cases',
    description: 'Get test cases, optionally filtered by project and/or test suite',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'Optional project ID to filter test cases'
        },
        test_suite_id: {
          type: 'number',
          description: 'Optional test suite ID to filter test cases'
        }
      },
      additionalProperties: false
    }
  },

  create_test_case: {
    name: 'create_test_case',
    description: 'Create a new test case within a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'The ID of the project'
        },
        title: {
          type: 'string',
          description: 'The title of the test case'
        },
        description: {
          type: 'string',
          description: 'The description of the test case'
        },
        preconditions: {
          type: 'string',
          description: 'The preconditions for the test case'
        },
        expected_result: {
          type: 'string',
          description: 'The expected result of the test case'
        },
        priority: {
          type: 'string',
          enum: ['Low', 'Medium', 'High', 'Critical'],
          description: 'The priority of the test case'
        },
        status: {
          type: 'string',
          enum: ['Active', 'Inactive', 'Draft'],
          description: 'The status of the test case'
        },
        test_suite_id: {
          type: 'number',
          description: 'Optional test suite ID to assign the test case to'
        }
      },
      required: ['project_id', 'title'],
      additionalProperties: false
    }
  },

  // XML Import Tools
  import_from_testlink_xml: {
    name: 'import_from_testlink_xml',
    description: 'Import test cases from TestLink XML format',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'The ID of the project to import test cases into'
        },
        xml_content: {
          type: 'string',
          description: 'The TestLink XML content to import'
        }
      },
      required: ['project_id', 'xml_content'],
      additionalProperties: false
    }
  },

  // Bulk Operations
  import_test_cases: {
    name: 'import_test_cases',
    description: 'Bulk import multiple test cases into a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'number',
          description: 'The ID of the project to import test cases into'
        },
        test_cases: {
          type: 'array',
          description: 'Array of test case objects to import',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              preconditions: { type: 'string' },
              expected_result: { type: 'string' },
              priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
              status: { type: 'string', enum: ['Active', 'Inactive', 'Draft'] },
              test_suite_id: { type: 'number' }
            },
            required: ['title']
          }
        }
      },
      required: ['project_id', 'test_cases'],
      additionalProperties: false
    }
  }
};

// Helper functions using shared database connection
class MCPService {
  constructor(pool) {
    this.pool = pool;
  }

  async listProjects() {
    try {
      const result = await this.pool.query('SELECT * FROM projects ORDER BY created_at DESC');
      return {
        success: true,
        data: result.rows,
        message: `Found ${result.rows.length} projects`
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'list_projects'
      };
    }
  }

  async getProject(projectId) {
    try {
      const result = await this.pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      if (result.rows.length === 0) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      return {
        success: true,
        data: result.rows[0],
        message: `Project ${projectId} retrieved successfully`
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'get_project'
      };
    }
  }

  async createProject(name, description = '') {
    try {
      const result = await this.pool.query(
        'INSERT INTO projects (name, description, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
        [name.trim(), description.trim()]
      );
      return {
        success: true,
        data: result.rows[0],
        message: `Project "${name}" created successfully`
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'create_project'
      };
    }
  }

  async listTestSuites(projectId) {
    try {
      let query = 'SELECT * FROM test_suites';
      let params = [];
      
      if (projectId) {
        query += ' WHERE project_id = $1';
        params = [projectId];
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await this.pool.query(query, params);
      const message = projectId 
        ? `Found ${result.rows.length} test suites for project ${projectId}`
        : `Found ${result.rows.length} test suites`;
        
      return {
        success: true,
        data: result.rows,
        message
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'list_test_suites'
      };
    }
  }

  async createTestSuite(projectId, testSuiteData) {
    try {
      const result = await this.pool.query(
        'INSERT INTO test_suites (name, description, project_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [testSuiteData.name.trim(), testSuiteData.description?.trim() || '', projectId]
      );
      return {
        success: true,
        data: result.rows[0],
        message: `Test suite "${testSuiteData.name}" created successfully`
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'create_test_suite'
      };
    }
  }

  async listTestCases(projectId, testSuiteId) {
    try {
      let query = 'SELECT * FROM test_cases';
      let params = [];
      let conditions = [];
      
      if (projectId) {
        conditions.push(`project_id = $${params.length + 1}`);
        params.push(projectId);
      }
      
      if (testSuiteId) {
        conditions.push(`test_suite_id = $${params.length + 1}`);
        params.push(testSuiteId);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await this.pool.query(query, params);
      
      let message = `Found ${result.rows.length} test cases`;
      if (projectId) message += ` for project ${projectId}`;
      if (testSuiteId) message += ` in test suite ${testSuiteId}`;
      
      return {
        success: true,
        data: result.rows,
        message
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'list_test_cases'
      };
    }
  }

  async createTestCase(projectId, testCaseData) {
    try {
      const result = await this.pool.query(
        `INSERT INTO test_cases 
         (title, description, preconditions, expected_result, priority, status, project_id, test_suite_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
         RETURNING *`,
        [
          testCaseData.title.trim(),
          testCaseData.description?.trim() || '',
          testCaseData.preconditions?.trim() || '',
          testCaseData.expected_result?.trim() || '',
          testCaseData.priority || 'Medium',
          testCaseData.status || 'Active',
          projectId,
          testCaseData.test_suite_id || null
        ]
      );
      return {
        success: true,
        data: result.rows[0],
        message: `Test case "${testCaseData.title}" created successfully`
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'create_test_case'
      };
    }
  }

  async importFromTestLinkXML(projectId, xmlContent) {
    try {
      // TODO: Integrate with existing TestLink import service
      return {
        success: true,
        data: { message: 'XML import feature coming soon' },
        message: 'TestLink XML import feature is under development'
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'import_from_testlink_xml'
      };
    }
  }

  async importTestCases(projectId, testCasesArray) {
    try {
      const results = {
        imported: 0,
        failed: 0,
        errors: [],
        testCases: []
      };
      
      for (let i = 0; i < testCasesArray.length; i++) {
        try {
          const testCaseResult = await this.createTestCase(projectId, testCasesArray[i]);
          if (testCaseResult.success) {
            results.testCases.push(testCaseResult.data);
            results.imported++;
          } else {
            throw new Error(testCaseResult.message);
          }
        } catch (importError) {
          results.failed++;
          results.errors.push({
            index: i,
            testCase: testCasesArray[i].title || `Test case ${i + 1}`,
            error: importError.message
          });
        }
      }
      
      return {
        success: true,
        data: results,
        message: `Bulk import completed: ${results.imported} imported, ${results.failed} failed`
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
        context: 'import_test_cases'
      };
    }
  }
}

// Create MCP server instance
async function createMCPServer(mcpService) {
  await initializeMCP();
  
  const server = new Server(
    {
      name: 'test-case-manager-integrated',
      version: '1.0.0',
      description: 'Integrated MCP Server for Test Case Manager - Uses shared backend services'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.values(TOOLS)
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      let result;
      
      switch (name) {
        case 'list_projects':
          result = await mcpService.listProjects();
          break;
          
        case 'get_project':
          result = await mcpService.getProject(args.project_id);
          break;
          
        case 'create_project':
          result = await mcpService.createProject(args.name, args.description);
          break;
          
        case 'list_test_suites':
          result = await mcpService.listTestSuites(args.project_id);
          break;
          
        case 'create_test_suite':
          result = await mcpService.createTestSuite(args.project_id, args);
          break;
          
        case 'list_test_cases':
          result = await mcpService.listTestCases(args.project_id, args.test_suite_id);
          break;
          
        case 'create_test_case':
          result = await mcpService.createTestCase(args.project_id, args);
          break;
          
        case 'import_from_testlink_xml':
          result = await mcpService.importFromTestLinkXML(args.project_id, args.xml_content);
          break;
          
        case 'import_test_cases':
          result = await mcpService.importTestCases(args.project_id, args.test_cases);
          break;
          
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify(result, null, 2) 
        }] 
      };
      
    } catch (error) {
      console.error(`Error in MCP tool ${name}:`, error);
      throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
    }
  });

  return server;
}

// Express middleware for MCP HTTP transport
function createMCPMiddleware(pool) {
  const mcpService = new MCPService(pool);
  
  return async (req, res, next) => {
    try {
      console.log('📨 MCP HTTP Request:', JSON.stringify(req.body, null, 2));
      
      const server = await createMCPServer(mcpService);
      const request = req.body;
      
      if (request.method === 'tools/list') {
        // Handle tools/list request directly
        const response = {
          tools: Object.values(TOOLS)
        };
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: response
        });
      } else if (request.method === 'tools/call') {
        // Handle tools/call request by calling the appropriate method
        const { name, arguments: args } = request.params;
        
        let result;
        switch (name) {
          case 'list_projects':
            result = await mcpService.listProjects();
            break;
          case 'get_project':
            result = await mcpService.getProject(args.project_id);
            break;
          case 'create_project':
            result = await mcpService.createProject(args.name, args.description);
            break;
          case 'list_test_suites':
            result = await mcpService.listTestSuites(args.project_id);
            break;
          case 'create_test_suite':
            result = await mcpService.createTestSuite(args.project_id, args);
            break;
          case 'list_test_cases':
            result = await mcpService.listTestCases(args.project_id, args.test_suite_id);
            break;
          case 'create_test_case':
            result = await mcpService.createTestCase(args.project_id, args);
            break;
          case 'import_from_testlink_xml':
            result = await mcpService.importFromTestLinkXML(args.project_id, args.xml_content);
            break;
          case 'import_test_cases':
            result = await mcpService.importTestCases(args.project_id, args.test_cases);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        const response = { 
          content: [{ 
            type: 'text', 
            text: JSON.stringify(result, null, 2) 
          }] 
        };
        
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: response
        });
      } else if (request.method === 'initialize') {
        // Handle initialization
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'test-case-manager-integrated',
              version: '1.0.0'
            }
          }
        });
      } else {
        // Unknown method
        res.status(400).json({
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        });
      }
      
    } catch (error) {
      console.error('❌ MCP HTTP Error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body?.id || null,
          error: {
            code: -32603,
            message: 'Internal server error',
            data: error.message
          }
        });
      }
    }
  };
}

module.exports = {
  createMCPMiddleware,
  MCPService,
  TOOLS
};