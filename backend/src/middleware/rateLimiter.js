const config = require('../config/apiConfig');

// Simple in-memory rate limiter
class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map(); // clientId -> [timestamp, timestamp, ...]
  }

  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this client
    let clientRequests = this.requests.get(clientId) || [];
    
    // Remove requests outside the current window
    clientRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if under the limit
    if (clientRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((clientRequests[0] - windowStart) / 1000),
        remaining: 0,
        resetTime: new Date(clientRequests[0] + this.windowMs)
      };
    }
    
    // Add current request
    clientRequests.push(now);
    this.requests.set(clientId, clientRequests);
    
    return {
      allowed: true,
      retryAfter: null,
      remaining: this.maxRequests - clientRequests.length,
      resetTime: new Date(now + this.windowMs)
    };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [clientId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, validRequests);
      }
    }
  }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter(
  config.api.rateLimitWindowMs,
  config.api.rateLimitMax
);

// Cleanup every 5 minutes
setInterval(() => {
  globalRateLimiter.cleanup();
}, 5 * 60 * 1000);

// Rate limiting middleware
const rateLimitMiddleware = (customLimiter = null) => {
  const limiter = customLimiter || globalRateLimiter;
  
  return (req, res, next) => {
    // Determine client identifier
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    
    const result = limiter.isAllowed(clientId);
    
    // Add rate limit headers
    res.set({
      'X-Rate-Limit-Limit': limiter.maxRequests,
      'X-Rate-Limit-Remaining': result.remaining,
      'X-Rate-Limit-Reset': result.resetTime.toISOString()
    });
    
    if (!result.allowed) {
      res.set('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        details: {
          limit: limiter.maxRequests,
          windowMs: limiter.windowMs,
          retryAfter: result.retryAfter,
          resetTime: result.resetTime
        }
      });
    }
    
    next();
  };
};

// Create custom rate limiters for specific endpoints
const createRateLimiter = (windowMs, maxRequests) => {
  return new RateLimiter(windowMs, maxRequests);
};

// Stricter rate limiter for write operations
const writeOperationsLimiter = createRateLimiter(
  60 * 1000, // 1 minute window
  100 // 100 requests per minute
);

// More lenient rate limiter for read operations
const readOperationsLimiter = createRateLimiter(
  60 * 1000, // 1 minute window
  500 // 500 requests per minute
);

module.exports = {
  RateLimiter,
  rateLimitMiddleware,
  createRateLimiter,
  writeOperationsLimiter,
  readOperationsLimiter
};