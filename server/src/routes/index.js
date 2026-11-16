const express = require('express');
const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');
const recruiterRoutes = require('./recruiter.routes');
const candidateRoutes = require('./candidate.routes');
const applicationRoutes = require('./application.routes');

const router = express.Router();

// Mount domain routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/candidate', candidateRoutes);
router.use('/applications', applicationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
