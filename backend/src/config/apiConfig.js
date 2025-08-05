// API Configuration with environment variables
require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'testcasemanager',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20
  },

  // API configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}/api`,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // requests per window
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 100,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 1000,
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'xml,csv,xlsx,json').split(','),
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    tempDir: process.env.TEMP_DIR || '/tmp'
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    encryptionKey: process.env.SETTINGS_ENCRYPTION_KEY || 'test-case-manager-encryption-key-2025-change-in-production',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    enableHelmet: process.env.ENABLE_HELMET !== 'false'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logDir: process.env.LOG_DIR || 'logs'
  },

  // External service configuration
  external: {
    testlinkApiUrl: process.env.TESTLINK_API_URL,
    testlinkApiKey: process.env.TESTLINK_API_KEY,
    enableTestlinkSync: process.env.ENABLE_TESTLINK_SYNC === 'true'
  },

  // Performance configuration
  performance: {
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    enableEtag: process.env.ENABLE_ETAG !== 'false',
    enableCaching: process.env.ENABLE_CACHING === 'true',
    cacheTimeoutMs: parseInt(process.env.CACHE_TIMEOUT_MS) || 300000 // 5 minutes
  },

  // Development configuration
  development: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true',
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true'
  },

  // Feature flags
  features: {
    enableActivityLogging: process.env.ENABLE_ACTIVITY_LOGGING !== 'false',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
    enableBulkOperations: process.env.ENABLE_BULK_OPERATIONS !== 'false'
  }
};

// Validate required configuration
const validateConfig = () => {
  const errors = [];

  if (!config.database.host) {
    errors.push('DB_HOST is required');
  }

  if (!config.database.password && config.nodeEnv === 'production') {
    errors.push('DB_PASSWORD is required in production');
  }

  if (config.security.jwtSecret === 'your-super-secret-jwt-key-change-in-production' && config.nodeEnv === 'production') {
    errors.push('JWT_SECRET must be changed in production');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Environment-specific overrides
if (config.nodeEnv === 'production') {
  // Production overrides
  config.logging.level = 'warn';
  config.development.enableSwagger = false;
  config.development.enableDebugRoutes = false;
  config.development.enableMockData = false;
} else if (config.nodeEnv === 'test') {
  // Test overrides
  config.database.name = config.database.name + '_test';
  config.logging.level = 'error';
  config.features.enableActivityLogging = false;
}

// Validate configuration on load
try {
  validateConfig();
} catch (error) {
  console.error('Configuration Error:', error.message);
  process.exit(1);
}

module.exports = config;