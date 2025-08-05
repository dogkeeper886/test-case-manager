// Retry handling utilities for external API calls

class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 10000; // 10 seconds
    this.exponentialBackoff = options.exponentialBackoff !== false;
    this.retryOn = options.retryOn || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
  }

  async retry(fn, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === this.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.shouldRetry(error)) {
          break;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt);
        
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, {
          error: error.message,
          code: error.code,
          context: context
        });

        await this.sleep(delay);
      }
    }

    // All retries exhausted or non-retryable error
    throw lastError;
  }

  shouldRetry(error) {
    // Retry on network errors
    if (error.code && this.retryOn.includes(error.code)) {
      return true;
    }

    // Retry on specific HTTP status codes
    if (error.response) {
      const status = error.response.status;
      return status >= 500 || status === 429; // Server errors or rate limiting
    }

    // Retry on timeout errors
    if (error.message && error.message.toLowerCase().includes('timeout')) {
      return true;
    }

    return false;
  }

  calculateDelay(attempt) {
    if (this.exponentialBackoff) {
      // Exponential backoff with jitter
      const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
      return Math.min(exponentialDelay + jitter, this.maxDelay);
    } else {
      // Linear backoff
      return Math.min(this.baseDelay * (attempt + 1), this.maxDelay);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Database retry handler for connection issues
const dbRetryHandler = new RetryHandler({
  maxRetries: 3,
  baseDelay: 1000,
  retryOn: ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT']
});

// External API retry handler
const apiRetryHandler = new RetryHandler({
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 30000,
  retryOn: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
});

// Express middleware for automatic retry on certain errors
const retryMiddleware = (retryHandler = apiRetryHandler) => {
  return async (req, res, next) => {
    const originalEnd = res.end;
    
    res.end = function(chunk, encoding) {
      // Only retry GET requests that didn't modify state
      if (req.method === 'GET' && res.statusCode >= 500) {
        console.warn('Request failed with server error, retry may be needed:', {
          url: req.url,
          status: res.statusCode,
          method: req.method
        });
      }
      
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

module.exports = {
  RetryHandler,
  dbRetryHandler,
  apiRetryHandler,
  retryMiddleware
};