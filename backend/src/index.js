const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool, testConnection } = require('./services/database');
const MigrationService = require('./services/MigrationService');
const { createMCPMiddleware } = require('./middleware/mcpHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up database connection in app locals
app.locals.db = pool;

// Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/testcases', require('./routes/testcases'));
app.use('/api/testsuites', require('./routes/testsuites'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/import', require('./routes/import'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/migrations', require('./routes/migrations'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MCP HTTP transport endpoint
app.post('/mcp', createMCPMiddleware(pool));

// MCP SSE endpoint - for Server-Sent Events transport
app.get('/mcp/sse', (req, res) => {
  console.log('📡 MCP SSE Connection established');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write('event: open\n');
  res.write('data: {"type": "connection_established"}\n\n');

  // Handle client disconnect
  req.on('close', () => {
    console.log('📡 MCP SSE Connection closed');
  });

  // Keep connection alive with periodic pings
  const pingInterval = setInterval(() => {
    res.write('event: ping\n');
    res.write('data: {"type": "ping"}\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(pingInterval);
  });
});

// MCP health check endpoint
app.get('/mcp/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Test Case Manager MCP HTTP Server',
    transport: 'HTTP',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT} and accepting connections from all interfaces`);
  
  // Test database connection and run migrations on startup
  try {
    await testConnection();
    console.log('✅ Database connection successful');
    
    // Run database migrations
    const migrationService = new MigrationService(pool);
    const migrationResult = await migrationService.runMigrations();
    console.log(`✅ Database migrations completed: ${migrationResult.applied} applied, ${migrationResult.failed} failed`);
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1); // Exit if database initialization fails
  }
});

module.exports = app;