const express = require('express');
const { z } = require('zod');
const applicationController = require('../controllers/application.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { ROLES, APPLICATION_STATUS } = require('../constants');

const router = express.Router();

const updateStatusSchema = z.object({
  status: z.enum(Object.values(APPLICATION_STATUS), {
    errorMap: () => ({ message: 'Invalid status value' })
  }),
  recruiterNote: z.string().trim().optional()
});

// All application routes require authentication
router.use(authenticate);

// Candidate: view own applications
router.get('/mine', requireRole(ROLES.CANDIDATE), applicationController.getCandidateApplications);

// Recruiter: change application status
router.patch('/:id/status', requireRole(ROLES.RECRUITER), validate(updateStatusSchema), applicationController.updateStatus);

// Candidate: withdraw application
router.patch('/:id/withdraw', requireRole(ROLES.CANDIDATE), applicationController.withdrawApplication);

// Candidate or Recruiter: view status timeline history
router.get('/:id/history', applicationController.getApplicationHistory);

// Candidate or Recruiter: protected resume download
router.get('/:id/resume', applicationController.downloadResume);

module.exports = router;
