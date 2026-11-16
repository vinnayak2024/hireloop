const prisma = require('../utils/prisma');

class CandidateService {
  async getProfile(userId) {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    if (!profile) {
      const error = new Error('Candidate profile not found');
      error.status = 404;
      throw error;
    }

    return profile;
  }

  async updateProfile(userId, updateData) {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      const error = new Error('Candidate profile not found');
      error.status = 404;
      throw error;
    }

    const updated = await prisma.candidateProfile.update({
      where: { userId },
      data: {
        phone: updateData.phone !== undefined ? updateData.phone?.trim() || null : profile.phone,
        location: updateData.location !== undefined ? updateData.location?.trim() || null : profile.location,
        headline: updateData.headline !== undefined ? updateData.headline?.trim() || null : profile.headline,
        skills: updateData.skills !== undefined ? updateData.skills?.trim() || '' : profile.skills,
        experienceYears: updateData.experienceYears !== undefined ? parseInt(updateData.experienceYears, 10) : profile.experienceYears
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updated;
  }

  async uploadDefaultResume(userId, filename) {
    const relativePath = `uploads/resumes/${filename}`;

    const profile = await prisma.candidateProfile.update({
      where: { userId },
      data: {
        defaultResumePath: relativePath
      }
    });

    return profile;
  }
}

module.exports = new CandidateService();
