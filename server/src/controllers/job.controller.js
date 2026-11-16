const jobService = require('../services/job.service');
const asyncWrapper = require('../utils/asyncWrapper');

const getJobs = asyncWrapper(async (req, res) => {
  const result = await jobService.getJobs(req.query);
  res.status(200).json(result);
});

const getJobById = asyncWrapper(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json({ job });
});

const createJob = asyncWrapper(async (req, res) => {
  const job = await jobService.createJob(req.user.id, req.body);
  res.status(201).json({ job });
});

const updateJob = asyncWrapper(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.user.id, req.body);
  res.status(200).json({ job });
});

const closeJob = asyncWrapper(async (req, res) => {
  const job = await jobService.closeJob(req.params.id, req.user.id);
  res.status(200).json({ job });
});

const deleteJob = asyncWrapper(async (req, res) => {
  const result = await jobService.deleteJob(req.params.id, req.user.id);
  res.status(200).json(result);
});

const getRecruiterJobs = asyncWrapper(async (req, res) => {
  const jobs = await jobService.getRecruiterJobs(req.user.id);
  res.status(200).json({ jobs });
});

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
  getRecruiterJobs
};
