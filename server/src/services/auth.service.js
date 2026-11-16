const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { signToken } = require('../utils/jwt');
const { ROLES } = require('../constants');

// Service layer handling all authentication business logic
class AuthService {
  async register({ name, email, password, role, companyName }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user with identical email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      const error = new Error('Email is already registered');
      error.status = 409;
      throw error;
    }

    // Hash password with bcrypt cost factor of 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Atomically create user and role-specific profile/company record
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role
        }
      });

      if (role === ROLES.CANDIDATE) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id
          }
        });
      } else if (role === ROLES.RECRUITER) {
        await tx.company.create({
          data: {
            name: companyName ? companyName.trim() : `${name.trim()}'s Company`,
            recruiterId: user.id
          }
        });
      }

      return user;
    });

    // Fetch the created user with associated profile/company for response
    const createdUser = await this.getUserDetails(result.id);
    const token = signToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role
    });

    return {
      token,
      user: createdUser
    };
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const userDetails = await this.getUserDetails(user.id);
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: userDetails
    };
  }

  async getUserDetails(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        candidateProfile: true,
        companies: true
      }
    });

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return user;
  }
}

module.exports = new AuthService();
