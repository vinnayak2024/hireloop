const companyService = require('../services/company.service');
const asyncWrapper = require('../utils/asyncWrapper');

const getMyCompany = asyncWrapper(async (req, res) => {
  const company = await companyService.getRecruiterCompany(req.user.id);
  res.status(200).json({ company });
});

const updateMyCompany = asyncWrapper(async (req, res) => {
  const company = await companyService.updateRecruiterCompany(req.user.id, req.body);
  res.status(200).json({ company });
});

module.exports = {
  getMyCompany,
  updateMyCompany
};
