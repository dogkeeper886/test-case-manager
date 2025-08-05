const config = require('../config/apiConfig');

// Request timeout middleware
const requestTimeout = (timeoutMs = config.api.requestTimeoutMs) => {
  return (req, res, next) => {
    // Set timeout for the request
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: `Request exceeded ${timeoutMs}ms timeout`,
          details: {
            timeout: timeoutMs,
            url: req.url,
            method: req.method
          }
        });
      }
    });

    // Set timeout for the response
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Response Timeout',
          message: `Response exceeded ${timeoutMs}ms timeout`,
          details: {
            timeout: timeoutMs,
            url: req.url,
            method: req.method
          }
        });
      }
    });

    next();
  };
};

module.exports = requestTimeout;