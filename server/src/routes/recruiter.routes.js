const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');
const companyRoutes = require('./company.routes');
const jobController = require('../controllers/job.controller');
const applicationController = require('../controllers/application.controller');

const router = express.Router();

// Enforce recruiter role on all /api/recruiter/* routes
router.use(authenticate, requireRole(ROLES.RECRUITER));

// Recruiter company profile
router.use('/', companyRoutes);

// Recruiter jobs list with applicant counts
router.get('/jobs', jobController.getRecruiterJobs);

// Recruiter dashboard summary statistics
router.get('/stats', applicationController.getRecruiterStats);

module.exports = router;
