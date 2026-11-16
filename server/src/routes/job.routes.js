const express = require('express');
const { z } = require('zod');
const jobController = require('../controllers/job.controller');
const applicationController = require('../controllers/application.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { handleResumeUpload } = require('../middleware/upload.middleware');
const { ROLES, JOB_TYPES, WORK_MODES, JOB_STATUS } = require('../constants');

const router = express.Router();

// Base schema without refinement to allow partial extension
const jobBaseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  location: z.string().trim().min(2, 'Location is required'),
  jobType: z.enum([JOB_TYPES.FULL_TIME, JOB_TYPES.PART_TIME, JOB_TYPES.INTERNSHIP, JOB_TYPES.CONTRACT], {
    errorMap: () => ({ message: 'Invalid job type' })
  }),
  workMode: z.enum([WORK_MODES.ONSITE, WORK_MODES.REMOTE, WORK_MODES.HYBRID], {
    errorMap: () => ({ message: 'Invalid work mode' })
  }),
  salaryMin: z.coerce.number().int().nonnegative('Minimum salary must be 0 or greater'),
  salaryMax: z.coerce.number().int().nonnegative('Maximum salary must be 0 or greater'),
  skills: z.string().trim().min(2, 'Skills list cannot be empty'),
  experienceRequired: z.coerce.number().int().nonnegative('Experience required must be 0 or greater'),
  deadline: z.string().datetime().optional().nullable().or(z.literal(''))
});

const createJobSchema = jobBaseSchema.refine(data => data.salaryMax >= data.salaryMin, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax']
});

const updateJobSchema = jobBaseSchema.partial().extend({
  status: z.enum([JOB_STATUS.OPEN, JOB_STATUS.CLOSED]).optional()
}).refine(data => {
  if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax']
});

const jobQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  jobType: z.enum([JOB_TYPES.FULL_TIME, JOB_TYPES.PART_TIME, JOB_TYPES.INTERNSHIP, JOB_TYPES.CONTRACT]).optional(),
  workMode: z.enum([WORK_MODES.ONSITE, WORK_MODES.REMOTE, WORK_MODES.HYBRID]).optional(),
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  experience: z.coerce.number().optional(),
  skills: z.string().optional(),
  sort: z.enum(['newest', 'salary_high', 'salary_low']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional()
});

// Public endpoints
router.get('/', validate(jobQuerySchema, 'query'), jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Recruiter-only endpoints
router.post('/', authenticate, requireRole(ROLES.RECRUITER), validate(createJobSchema), jobController.createJob);
router.put('/:id', authenticate, requireRole(ROLES.RECRUITER), validate(updateJobSchema), jobController.updateJob);
router.patch('/:id/close', authenticate, requireRole(ROLES.RECRUITER), jobController.closeJob);
router.delete('/:id', authenticate, requireRole(ROLES.RECRUITER), jobController.deleteJob);
router.get('/:id/applications', authenticate, requireRole(ROLES.RECRUITER), applicationController.getJobApplications);

// Candidate application submission
router.post('/:id/apply', authenticate, requireRole(ROLES.CANDIDATE), handleResumeUpload('resume'), applicationController.applyForJob);

module.exports = router;
