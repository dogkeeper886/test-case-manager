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
- `create_test_case` - Create a new test case
- `list_test_suites` - List test suites (optionally by project)
- `create_test_suite` - Create a new test suite

## Communication

The MCP server uses stdio communication and connects to the backend API via HTTP. It runs independently when called by the IDE and terminates after each session.