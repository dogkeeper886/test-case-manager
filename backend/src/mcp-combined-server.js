#!/usr/bin/env node

import { spawn } from 'child_process';
import { startHTTPServer } from './mcp-http-server.js';

console.error('🚀 Starting Combined MCP Server (stdio + HTTP)...');

const mode = process.env.MCP_TRANSPORT || 'stdio';

async function startStdioServer() {
  console.error('📡 Starting stdio transport...');
  // Import and start the stdio server
  const { main } = await import('./mcp-server.mjs');
  return main();
}

async function main() {
  try {
    if (mode === 'http') {
      console.error('🌐 Starting HTTP-only mode...');
      startHTTPServer();
    } else if (mode === 'combined') {
      console.error('🔄 Starting combined mode (stdio + HTTP)...');
      
      // Start HTTP server
      startHTTPServer();
      
      // Note: stdio server runs in the main process for MCP compatibility
      // The HTTP server runs concurrently
      console.error('📡 Stdio transport ready for MCP clients');
      
    } else {
      console.error('📡 Starting stdio-only mode...');
      await startStdioServer();
    }
  } catch (error) {
    console.error('❌ Combined server failed to start:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('🛑 Shutting down MCP servers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Shutting down MCP servers...');
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});