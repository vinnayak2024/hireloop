const applicationService = require('../services/application.service');
const asyncWrapper = require('../utils/asyncWrapper');

const applyForJob = asyncWrapper(async (req, res) => {
  const application = await applicationService.applyForJob(
    req.params.id,
    req.user.id,
    req.file,
    req.body.coverLetter
  );
  res.status(201).json({
    message: 'Application submitted successfully',
    application
  });
});

const getCandidateApplications = asyncWrapper(async (req, res) => {
  const applications = await applicationService.getCandidateApplications(
    req.user.id,
    req.query.status
  );
  res.status(200).json({ applications });
});

const getJobApplications = asyncWrapper(async (req, res) => {
  const applications = await applicationService.getJobApplications(
    req.params.id,
    req.user.id,
    {
      status: req.query.status,
      search: req.query.search
    }
  );
  res.status(200).json({ applications });
});

const updateStatus = asyncWrapper(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.user.id,
    req.body
  );
  res.status(200).json({
    message: 'Application status updated',
    application
  });
});

const withdrawApplication = asyncWrapper(async (req, res) => {
  const application = await applicationService.withdrawApplication(
    req.params.id,
    req.user.id
  );
  res.status(200).json({
    message: 'Application withdrawn successfully',
    application
  });
});

const getApplicationHistory = asyncWrapper(async (req, res) => {
  const history = await applicationService.getApplicationHistory(
    req.params.id,
    req.user.id,
    req.user.role
  );
  res.status(200).json({ history });
});

const downloadResume = asyncWrapper(async (req, res) => {
  const { filePath, downloadFilename } = await applicationService.getResumeDownloadInfo(
    req.params.id,
    req.user.id,
    req.user.role
  );

  // Set response headers and stream the protected PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.download(filePath, downloadFilename);
});

const getRecruiterStats = asyncWrapper(async (req, res) => {
  const stats = await applicationService.getRecruiterStats(req.user.id);
  res.status(200).json({ stats });
});

module.exports = {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  updateStatus,
  withdrawApplication,
  getApplicationHistory,
  downloadResume,
  getRecruiterStats
};
