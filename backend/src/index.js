const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { pool, testConnection } = require('./services/database');
const MigrationService = require('./services/MigrationService');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimitMiddleware } = require('./middleware/rateLimiter');
const requestTimeout = require('./middleware/requestTimeout');
const config = require('./config/apiConfig');
require('dotenv').config();

const app = express();
const PORT = config.port;

// Security and performance middleware
if (config.security.enableHelmet) {
  app.use(helmet());
}

if (config.performance.enableCompression) {
  app.use(compression());
}

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging
app.use(morgan(config.logging.format));

// Request timeout
app.use(requestTimeout());

// Rate limiting
app.use(rateLimitMiddleware());

// Body parsing
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Set up database connection in app locals
app.locals.db = pool;

// Routes - Current API (maintain backward compatibility)
app.use('/api/projects', require('./routes/projects'));
app.use('/api/testcases', require('./routes/testcases'));
app.use('/api/testsuites', require('./routes/testsuites'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/import', require('./routes/import'));
app.use('/api/export', require('./routes/export'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/migrations', require('./routes/migrations'));

// V1 API Routes - Enhanced versions
app.use('/api/v1/test-cases', require('./routes/v1/testcases'));
app.use('/api/v1/projects', require('./routes/v1/projects'));
app.use('/api/v1/test-suites', require('./routes/v1/testsuites'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});



// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

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