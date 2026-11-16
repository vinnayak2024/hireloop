const authService = require('../services/auth.service');
const asyncWrapper = require('../utils/asyncWrapper');

// Controller delegating HTTP requests to auth service
const register = asyncWrapper(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncWrapper(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const me = asyncWrapper(async (req, res) => {
  const user = await authService.getUserDetails(req.user.id);
  res.status(200).json({ user });
});

module.exports = {
  register,
  login,
  me
};
