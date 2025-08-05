// Enhanced error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details || {}
    });
  }

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate Entry',
          message: 'A record with this information already exists',
          details: { constraint: err.constraint }
        });
      
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Invalid Reference',
          message: 'Referenced record does not exist',
          details: { constraint: err.constraint }
        });
      
      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Missing Required Field',
          message: 'Required field cannot be null',
          details: { column: err.column }
        });
    }
  }

  // HTTP errors
  if (err.status) {
    return res.status(err.status).json({
      error: err.name || 'HTTP Error',
      message: err.message,
      details: err.details || {}
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}
  });
};

// Custom error classes
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  NotFoundError,
  ConflictError
};