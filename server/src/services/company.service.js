const prisma = require('../utils/prisma');

// Service managing recruiter company profile operations
class CompanyService {
  async getRecruiterCompany(recruiterId) {
    const company = await prisma.company.findFirst({
      where: { recruiterId }
    });

    if (!company) {
      const error = new Error('Company profile not found for this recruiter');
      error.status = 404;
      throw error;
    }

    return company;
  }

  async updateRecruiterCompany(recruiterId, updateData) {
    const company = await prisma.company.findFirst({
      where: { recruiterId }
    });

    if (!company) {
      const error = new Error('Company profile not found for this recruiter');
      error.status = 404;
      throw error;
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: updateData.name !== undefined ? updateData.name.trim() : company.name,
        website: updateData.website !== undefined ? updateData.website?.trim() || null : company.website,
        location: updateData.location !== undefined ? updateData.location?.trim() || null : company.location,
        description: updateData.description !== undefined ? updateData.description?.trim() || null : company.description
      }
    });

    return updated;
  }
}

module.exports = new CompanyService();
