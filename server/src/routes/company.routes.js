const express = require('express');
const { z } = require('zod');
const companyController = require('../controllers/company.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

const updateCompanySchema = z.object({
  name: z.string().trim().min(2, 'Company name must be at least 2 characters').optional(),
  website: z.string().trim().url('Must be a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  location: z.string().trim().optional(),
  description: z.string().trim().optional()
});

// All company routes are restricted to authenticated Recruiters
router.use(authenticate, requireRole(ROLES.RECRUITER));

router.get('/company', companyController.getMyCompany);
router.put('/company', validate(updateCompanySchema), companyController.updateMyCompany);

module.exports = router;
