# Test Case Manager MCP Server

Separated MCP server for Test Case Management System with stdio communication.

## Building the Docker Image

```bash
# Build the image
./build-image.sh

# Or manually:
docker build -t test-case-manager-mcp-server:latest .
```

## IDE Configuration

### Claude Code / Cursor Configuration

Add this to your MCP configuration:

```json
{
  "mcpServers": {
    "test-case-manager": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--network", "host",
        "-e", "API_BASE_URL=http://192.168.4.121:3001/api",
        "test-case-manager-mcp-server:latest"
      ]
    }
  }
}
```

### Environment Variables

- `API_BASE_URL`: URL to the Test Case Management API (default: http://192.168.4.121:3001/api)
- `NODE_ENV`: Node environment (default: production)

## Testing the MCP Server

```bash
# Test with direct Docker run
docker run -i --rm --network host test-case-manager-mcp-server:latest

# Test with custom API URL
docker run -i --rm --network host \
  -e API_BASE_URL=http://localhost:3001/api \
  test-case-manager-mcp-server:latest
```

## Available MCP Tools

- `list_projects` - List all projects
- `create_project` - Create a new project  
- `list_test_cases` - List test cases (optionally by project)
- `create_test_case` - Create a new test case with full TestLink compatibility
- `list_test_suites` - List test suites (optionally by project)
- `create_test_suite` - Create a new test suite
- `export_testlink_xml` - Export test cases in TestLink XML format

## Test Case Creation Fields

The `create_test_case` tool supports full TestLink compatibility with the following parameters:

### Required Fields
- `project_id` (number) - Project ID where the test case belongs
- `title` (string) - Test case name/title

### Core TestLink Fields
- `description` (string) - Test case summary/description
- `steps` (array) - Structured test steps with step_number, action, expected_result, execution_type
- `prerequisites` (string) - Test case preconditions
- `expected_result` (string) - Overall expected result

### TestLink Identity Fields  
- `external_id` (string) - User-defined test case identifier (e.g., "TC-001")
- `internal_id` (string) - Internal system identifier
- `node_order` (number) - Hierarchy position in TestLink (default: 0)
- `version` (string) - Test case version in semantic format (default: "1.0")

### TestLink Metadata Fields
- `execution_type` (number) - 1=Manual, 2=Automated (default: 1)
- `importance` (number) - 1=Low, 2=Medium, 3=High (default: 2)
- `priority` (number) - 1=High, 2=Medium, 3=Low (default: 2) 
- `estimated_duration` (number) - Estimated execution time in minutes

### System Control Fields
- `test_suite_id` (number) - Test suite assignment (optional)
- `status` (number) - 1=Active, 0=Inactive (default: 1)
- `is_open` (boolean) - Whether test case is open for execution (default: true)
- `active` (boolean) - Whether test case is active in system (default: true)

### Step Structure
Each step in the `steps` array should contain:
- `step_number` (number) - Sequential step number (1, 2, 3, etc.)
- `action` (string) - Action to perform in this step
- `expected_result` (string) - Expected outcome for this step  
- `execution_type` (number) - 1=Manual, 2=Automated (optional, default: 1)

### Example Test Case Creation
```json
{
  "project_id": 1,
  "test_suite_id": 5,
  "title": "User Login Validation",
  "description": "Verify user can login with valid credentials",
  "prerequisites": "User account exists with valid credentials",
  "external_id": "TC-LOGIN-001", 
  "version": "1.0",
  "priority": 1,
  "importance": 3,
  "execution_type": 1,
  "estimated_duration": 5,
  "steps": [
    {
      "step_number": 1,
      "action": "Navigate to login page",
      "expected_result": "Login form displayed",
      "execution_type": 1
    },
    {
      "step_number": 2, 
      "action": "Enter valid username and password",
      "expected_result": "Credentials accepted"
    },
    {
      "step_number": 3,
      "action": "Click login button", 
      "expected_result": "User logged in and redirected to dashboard"
    }
  ]
}
```

## TestLink Compatibility

This MCP server provides **100% TestLink compatibility** for test case creation and export:

- ✅ **Core Fields**: All required TestLink fields supported
- ✅ **Identity Fields**: Internal ID, External ID, Node Order support  
- ✅ **Metadata Fields**: Execution type, importance, prerequisites
- ✅ **Structured Steps**: Nested step structure with actions and expected results
- ✅ **XML Export**: TestLink-compatible XML export functionality
- ✅ **CDATA Support**: Proper HTML content handling in exports
- ✅ **Round-trip Compatibility**: Create → Export → Import workflow

### Field Validation
- Required fields validated at creation time
- Data types enforced for all numeric fields
- String length limits respected
- Foreign key relationships verified

For detailed field mapping and troubleshooting, see `/docs/field-mapping.md`.

## Communication

The MCP server uses stdio communication and connects to the backend API via HTTP. It runs independently when called by the IDE and terminates after each session.