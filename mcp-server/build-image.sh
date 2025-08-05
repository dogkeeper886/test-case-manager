#!/bin/bash

# Build the MCP server Docker image
echo "Building Test Case Manager MCP Server Docker image..."

docker build -t test-case-manager-mcp-server:latest .

echo "Build complete! Image: test-case-manager-mcp-server:latest"
echo ""
echo "IDE Configuration:"
echo "=================="
echo "Use this Docker command in your IDE MCP configuration:"
echo ""
echo "docker run -i --rm --network host test-case-manager-mcp-server:latest"
echo ""
echo "Or with custom API URL:"
echo "docker run -i --rm --network host -e API_BASE_URL=http://your-host:3001/api test-case-manager-mcp-server:latest"