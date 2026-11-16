const express = require('express');
const { z } = require('zod');
const candidateController = require('../controllers/candidate.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { handleResumeUpload } = require('../middleware/upload.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

const updateProfileSchema = z.object({
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  headline: z.string().trim().optional(),
  skills: z.string().trim().optional(),
  experienceYears: z.coerce.number().int().nonnegative('Experience years must be 0 or greater').optional()
});

// Enforce CANDIDATE role on all candidate profile routes
router.use(authenticate, requireRole(ROLES.CANDIDATE));

router.get('/profile', candidateController.getProfile);
router.put('/profile', validate(updateProfileSchema), candidateController.updateProfile);
router.post('/resume', handleResumeUpload('resume'), candidateController.uploadResume);

module.exports = router;
