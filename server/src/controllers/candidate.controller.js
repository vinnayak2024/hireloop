const candidateService = require('../services/candidate.service');
const asyncWrapper = require('../utils/asyncWrapper');

const getProfile = asyncWrapper(async (req, res) => {
  const profile = await candidateService.getProfile(req.user.id);
  res.status(200).json({ profile });
});

const updateProfile = asyncWrapper(async (req, res) => {
  const profile = await candidateService.updateProfile(req.user.id, req.body);
  res.status(200).json({ profile });
});

const uploadResume = asyncWrapper(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: {
        message: 'No resume file uploaded. Please upload a PDF file.'
      }
    });
  }

  const profile = await candidateService.uploadDefaultResume(req.user.id, req.file.filename);
  res.status(200).json({
    message: 'Resume uploaded successfully',
    defaultResumePath: profile.defaultResumePath
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadResume
};
