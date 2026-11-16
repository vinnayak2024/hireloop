const rateLimit = require('express-rate-limit');

// Rate limiting on sensitive authentication routes to prevent brute-force attacks
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 100, // generous in test, 100 in dev/prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
  }
});

module.exports = {
  authRateLimiter
};
