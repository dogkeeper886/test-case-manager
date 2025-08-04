# MCP Test Case Manager - Implementation Plan

## 🎯 Status: PIVOT TO MCP SERVER ARCHITECTURE

**Date**: August 2025  
**Decision**: Abandon complex in-app AI processing in favor of MCP (Model Context Protocol) server approach

## 📋 Cleanup Required

### 🗑️ Components to Remove

**Phase 1: Remove Smart Import Infrastructure**
- ❌ `frontend/src/components/import/SmartImportTab.jsx` - Smart import frontend
- ❌ `backend/src/services/LLMTestCaseService.js` - LLM processing service
- ❌ `backend/src/services/ContentParserService.js` - Document parsing service
- ❌ Smart import routes in `backend/src/routes/import.js`
- ❌ Smart import API methods in `frontend/src/services/api.js`

**Phase 2: Remove LLM Settings Infrastructure**
- ❌ `frontend/src/components/settings/LLMSettingsModal.jsx` - Settings modal
- ❌ Settings icon and integration in `frontend/src/components/layout/TopNav.jsx`
- ❌ `backend/src/routes/settings.js` - Settings API routes
- ❌ LLM settings methods in `frontend/src/services/api.js`
- ❌ Database migration and app_settings table (optional - can leave for future use)

**Phase 3: Remove Dependencies**
- ❌ Remove unused npm packages: `openai`, `pdf-parse`, `mammoth`, `marked`
- ❌ Remove LLM environment variables from `.env`
- ❌ Clean up import references throughout codebase

## 🏗️ MCP Server Implementation

### Phase 1: Core MCP Server (This Week)

**Create New MCP Server Project:**
```bash
mkdir test-case-manager-mcp
cd test-case-manager-mcp
npm init -y
npm install @modelcontextprotocol/sdk pg dotenv
```

**Project Structure:**
```
test-case-manager-mcp/
├── package.json
├── .env
├── src/
│   ├── index.js           // MCP server entry point
│   ├── tools/
│   │   ├── projects.js    // Project CRUD operations
│   │   ├── testSuites.js  // Test suite operations
│   │   ├── testCases.js   // Test case CRUD operations
│   │   └── bulk.js        // Bulk import/export operations
│   ├── database/
│   │   └── connection.js  // PostgreSQL connection
│   └── utils/
│       ├── validation.js  // Data validation helpers
│       └── formatting.js  // Response formatting
├── README.md
└── claude-code-config.json // Claude Code configuration
```

### Phase 2: Core Tools Implementation

**Essential MCP Tools:**
1. **Project Management**
   - `list_projects()` - Get all projects
   - `get_project(id)` - Get specific project details
   - `create_project(name, description)` - Create new project

2. **Test Suite Management**
   - `list_test_suites(project_id)` - Get suites for project
   - `create_test_suite(project_id, suite_data)` - Create new suite

3. **Test Case CRUD**
   - `list_test_cases(project_id, suite_id?)` - Get test cases
   - `get_test_case(id)` - Get specific test case
   - `create_test_case(project_id, test_case_data)` - Create single test case
   - `update_test_case(id, updates)` - Update existing test case
   - `delete_test_case(id)` - Delete test case

4. **Bulk Operations**
   - `import_test_cases(project_id, test_cases_array)` - Bulk import
   - `export_test_cases(project_id, format)` - Export test cases

### Phase 3: Database Integration

**Connection Configuration:**
```javascript
// src/database/connection.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'test_case_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

export default pool;
```

**Reuse Existing Schema:**
- Connect to existing PostgreSQL database
- Use existing tables: `projects`, `test_suites`, `test_cases`, `test_steps`
- Maintain existing relationships and constraints
- No schema changes required

### Phase 4: Claude Code Integration

**Configuration File:**
```json
{
  "name": "test-case-manager",
  "description": "Test Case Manager MCP Server - Manage test cases, projects, and test suites",
  "version": "1.0.0",
  "tools": [
    {
      "name": "list_projects",
      "description": "Get all projects with their metadata"
    },
    {
      "name": "create_test_case",
      "description": "Create a new test case with steps and expected results"
    },
    {
      "name": "import_test_cases",
      "description": "Bulk import multiple test cases into a project"
    }
  ]
}
```

## 🎯 Implementation Timeline

### Week 1: Cleanup & MCP Foundation
- **Day 1-2**: Remove smart import components and LLM settings
- **Day 3-4**: Create MCP server structure and core tools
- **Day 5**: Test basic MCP integration with Claude Code

### Week 2: Full MCP Implementation
- **Day 1-2**: Implement all CRUD operations
- **Day 3-4**: Add bulk import/export capabilities
- **Day 5**: Testing and documentation

## ✅ Success Criteria

### Technical Goals
1. **Clean Codebase** - Remove all AI-related infrastructure (70% code reduction)
2. **Working MCP Server** - All tools functional and discoverable
3. **Database Integration** - Reliable connection to existing database
4. **Claude Code Integration** - Server properly configured and working

### User Experience Goals
1. **Seamless AI Integration** - Users can process documents in Claude Code
2. **No Learning Curve** - Familiar Claude interaction patterns
3. **Full AI Capabilities** - Access to Claude's complete document processing
4. **Clean App Focus** - Test Case Manager focused purely on management

## 🚀 Benefits Realized

### For Users
- **Superior AI Experience** - Claude Code's full interface vs limited custom chat
- **No Timeouts** - Claude Code handles long operations seamlessly
- **Document Flexibility** - Any format supported by Claude
- **Familiar Interface** - No new UI to learn

### For Developers
- **Simplified Codebase** - Remove complex AI infrastructure
- **Focused Development** - Concentrate on test case management features
- **Standard Patterns** - Well-documented MCP approach
- **Easier Maintenance** - No AI provider integrations to maintain

---

*This pivot eliminates the complexity that caused multiple failures while providing a superior user experience through proven MCP patterns.*