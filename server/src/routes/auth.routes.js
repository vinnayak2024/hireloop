const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

// Zod validation schemas
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.CANDIDATE, ROLES.RECRUITER], {
    errorMap: () => ({ message: `Role must be either ${ROLES.CANDIDATE} or ${ROLES.RECRUITER}` })
  }),
  companyName: z.string().trim().optional()
}).refine((data) => {
  if (data.role === ROLES.RECRUITER) {
    return typeof data.companyName === 'string' && data.companyName.trim().length >= 2;
  }
  return true;
}, {
  message: 'Company name is required for recruiter registration (min 2 characters)',
  path: ['companyName']
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Authentication routes with rate limiting and schema validation
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
