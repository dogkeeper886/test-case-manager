# MCP Test Case Manager - Design Plan

## 🎯 New Approach: MCP Server Architecture

**Status: PIVOT TO MCP** - Abandoning complex in-app AI processing for a much simpler and more powerful approach.

**Vision**: Transform the Test Case Manager into an MCP (Model Context Protocol) server that Claude Code can interact with directly, enabling users to leverage Claude's full AI capabilities for test case generation without the complexity of building AI infrastructure within the app.

**Why MCP is Superior:**
- ✅ **Zero AI Infrastructure** - No need to manage LLM providers, API keys, or timeouts
- ✅ **Full Claude Capabilities** - Users get Claude's complete AI power, not a limited interface
- ✅ **Separation of Concerns** - App focuses on test case management, Claude handles AI processing
- ✅ **No Timeout Issues** - Claude Code handles long-running operations seamlessly
- ✅ **Better UX** - Users work in Claude Code's excellent interface, not a custom chat UI
- ✅ **Simplified Architecture** - Just expose CRUD operations via MCP tools

## 🗑️ Removed Infrastructure (No Longer Needed)

**Deprecated Components:**
- ❌ **LLM Settings Modal** - Users configure AI in Claude Code, not in the app
- ❌ **Backend LLM API Routes** - No need for `/api/settings/llm` endpoints
- ❌ **Database LLM Schema** - Remove app_settings table LLM configurations
- ❌ **Smart Import Components** - No frontend AI processing interface needed
- ❌ **Content Parser Services** - Claude Code handles document processing
- ❌ **LLM Provider Integrations** - No OpenAI/Anthropic client code needed

## 🏗️ MCP Server Implementation Plan

### Core MCP Tools to Expose

**Test Case Management Operations:**
```javascript
export const tools = {
  // Project Operations
  list_projects: () => /* Get all projects with metadata */,
  get_project: (project_id) => /* Get specific project details */,
  create_project: (name, description) => /* Create new project */,
  
  // Test Suite Operations  
  list_test_suites: (project_id) => /* Get suites for project */,
  create_test_suite: (project_id, suite_data) => /* Create new suite */,
  
  // Test Case CRUD
  list_test_cases: (project_id, suite_id?) => /* Get test cases */,
  get_test_case: (test_case_id) => /* Get specific test case */,
  create_test_case: (project_id, test_case_data) => /* Create single test case */,
  update_test_case: (test_case_id, updates) => /* Update existing test case */,
  delete_test_case: (test_case_id) => /* Delete test case */,
  
  // Bulk Operations
  import_test_cases: (project_id, test_cases_array) => /* Bulk import */,
  export_test_cases: (project_id, format) => /* Export in various formats */
};
```

### User Workflow with MCP

**AI-Powered Test Case Generation:**
1. **User uploads document to Claude Code** (any format: MD, TXT, PDF, DOCX)
2. **Claude processes with full AI capabilities** (no timeouts, streaming, complex UI)
3. **Claude calls MCP tools to:**
   - List existing projects: `list_projects()`
   - Create new project if needed: `create_project(name, description)`
   - Import generated test cases: `import_test_cases(project_id, test_cases)`
4. **User views results in Test Case Manager** (clean, focused interface)

**Benefits:**
- Users get Claude's full document processing power
- No complex frontend AI interface needed
- No timeout/streaming complications
- App stays focused on test case management
- Much simpler codebase to maintain

## MCP Server Architecture

### Implementation Strategy

**Phase 1: MCP Server Development** (This Week)
- Create MCP server that exposes Test Case Manager operations
- Implement core tools: projects, test suites, test cases CRUD
- Add bulk import/export capabilities
- Test integration with Claude Code

**Phase 2: Enhanced Operations** (Next Week)  
- Add advanced search and filtering tools
- Implement test case relationship management
- Add reporting and analytics tools
- Performance optimization

### Technical Implementation

**MCP Server Structure:**
```
test-case-manager-mcp/
├── package.json
├── src/
│   ├── index.js           // MCP server entry point
│   ├── tools/
│   │   ├── projects.js    // Project operations
│   │   ├── testSuites.js  // Test suite operations
│   │   ├── testCases.js   // Test case CRUD
│   │   └── bulk.js        // Batch operations
│   ├── database/
│   │   └── connection.js  // Database connection
│   └── utils/
│       └── validation.js  // Data validation
└── README.md
```

**Database Integration:**
- Reuse existing PostgreSQL database
- Connect directly to existing tables
- Maintain data consistency and relationships
- Leverage existing schema (no changes needed)

## Success Criteria

### Phase 1: MCP Server Ready (This Week)
1. ✅ **Core Tools Implementation** - All CRUD operations working
2. ✅ **Claude Code Integration** - Server discoverable and functional
3. ✅ **Database Connectivity** - Reliable connection to existing database
4. ✅ **Documentation** - Clear usage instructions for Claude Code users

### Phase 2: Production Ready (Next Week)
1. ✅ **Advanced Operations** - Search, filtering, relationships
2. ✅ **Performance** - Fast response times for large datasets
3. ✅ **Error Handling** - Graceful failure management
4. ✅ **Testing** - Comprehensive test coverage

### User Experience Benefits
**For Users:**
- Use Claude Code's superior AI interface instead of custom chat
- No learning curve - familiar Claude interaction patterns
- Access to Claude's full document processing capabilities
- Seamless integration with existing test case management workflow

**For Developers:**
- Dramatically simplified codebase (remove ~70% of AI-related code)
- No timeout/streaming complexity to maintain
- Focus on core test case management features
- Standard MCP patterns, well-documented approach

## MCP Architecture

### System Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User uploads  │ => │  Claude Code     │ => │  Claude AI      │
│   document to   │    │  receives file   │    │  processes      │
│   Claude Code   │    │  & processes     │    │  with full      │
└─────────────────┘    └──────────────────┘    │  capabilities   │
                                                └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Test Case      │ <= │  MCP Server      │ <= │  Claude calls   │
│  Manager shows  │    │  receives data   │    │  MCP tools to   │
│  imported cases │    │  via tools       │    │  import cases   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **Document Upload**: User uploads to Claude Code (any format)
2. **AI Processing**: Claude processes with full capabilities  
3. **MCP Tool Calls**: Claude calls test case management tools
4. **Database Operations**: MCP server executes CRUD operations
5. **User Views Results**: Test Case Manager shows imported data

