const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool, testConnection } = require('./services/database');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Test database connection on startup
  try {
    await testConnection();
  } catch (error) {
    console.error('Failed to connect to database on startup:', error);
  }
});

module.exports = app;