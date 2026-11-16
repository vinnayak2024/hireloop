const prisma = require('../utils/prisma');
const { JOB_STATUS } = require('../constants');

// Service handling all job posting lifecycle, search, filtering, and ownership enforcement
class JobService {
  async getJobs({
    q,
    location,
    jobType,
    workMode,
    minSalary,
    maxSalary,
    experience,
    skills,
    sort = 'newest',
    page = 1,
    limit = 10
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma where clause
    const where = {
      status: JOB_STATUS.OPEN
    };

    // Keyword search across title, company name, or skills
    if (q && q.trim()) {
      const keyword = q.trim();
      where.OR = [
        { title: { contains: keyword } },
        { skills: { contains: keyword } },
        { company: { name: { contains: keyword } } }
      ];
    }

    if (location && location.trim()) {
      where.location = { contains: location.trim() };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (workMode) {
      where.workMode = workMode;
    }

    // Salary range filters
    if (minSalary !== undefined && minSalary !== '') {
      const min = parseInt(minSalary, 10);
      if (!isNaN(min)) {
        where.salaryMax = { gte: min };
      }
    }

    if (maxSalary !== undefined && maxSalary !== '') {
      const max = parseInt(maxSalary, 10);
      if (!isNaN(max)) {
        where.salaryMin = { lte: max };
      }
    }

    // Filter by max required experience (jobs accessible to candidate with X years)
    if (experience !== undefined && experience !== '') {
      const exp = parseInt(experience, 10);
      if (!isNaN(exp)) {
        where.experienceRequired = { lte: exp };
      }
    }

    if (skills && skills.trim()) {
      where.skills = { contains: skills.trim() };
    }

    // Sorting strategy
    let orderBy = { createdAt: 'desc' };
    if (sort === 'salary_high') {
      orderBy = { salaryMax: 'desc' };
    } else if (sort === 'salary_low') {
      orderBy = { salaryMin: 'asc' };
    }

    // Fetch paginated jobs and total count concurrently
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              location: true,
              website: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.job.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      data: jobs,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    };
  }

  async getJobById(jobId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      const error = new Error('Job posting not found');
      error.status = 404;
      throw error;
    }

    return job;
  }

  async createJob(recruiterId, jobData) {
    // Ensure recruiter has a registered company
    const company = await prisma.company.findFirst({
      where: { recruiterId }
    });

    if (!company) {
      const error = new Error('Recruiter must have an associated company to post jobs');
      error.status = 400;
      throw error;
    }

    const job = await prisma.job.create({
      data: {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        location: jobData.location.trim(),
        jobType: jobData.jobType,
        workMode: jobData.workMode,
        salaryMin: parseInt(jobData.salaryMin, 10),
        salaryMax: parseInt(jobData.salaryMax, 10),
        skills: jobData.skills.trim(),
        experienceRequired: parseInt(jobData.experienceRequired, 10),
        deadline: jobData.deadline ? new Date(jobData.deadline) : null,
        companyId: company.id,
        postedById: recruiterId
      },
      include: {
        company: true
      }
    });

    return job;
  }

  async updateJob(jobId, recruiterId, updateData) {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      throw error;
    }

    // Business rule: Recruiters can edit ONLY their own jobs
    if (job.postedById !== recruiterId) {
      const error = new Error('Access denied: you can only edit jobs you posted');
      error.status = 403;
      throw error;
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: updateData.title !== undefined ? updateData.title.trim() : job.title,
        description: updateData.description !== undefined ? updateData.description.trim() : job.description,
        location: updateData.location !== undefined ? updateData.location.trim() : job.location,
        jobType: updateData.jobType || job.jobType,
        workMode: updateData.workMode || job.workMode,
        salaryMin: updateData.salaryMin !== undefined ? parseInt(updateData.salaryMin, 10) : job.salaryMin,
        salaryMax: updateData.salaryMax !== undefined ? parseInt(updateData.salaryMax, 10) : job.salaryMax,
        skills: updateData.skills !== undefined ? updateData.skills.trim() : job.skills,
        experienceRequired: updateData.experienceRequired !== undefined ? parseInt(updateData.experienceRequired, 10) : job.experienceRequired,
        deadline: updateData.deadline !== undefined ? (updateData.deadline ? new Date(updateData.deadline) : null) : job.deadline,
        status: updateData.status || job.status
      },
      include: {
        company: true
      }
    });

    return updatedJob;
  }

  async closeJob(jobId, recruiterId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      throw error;
    }

    // Business rule: Recruiters can close ONLY their own jobs
    if (job.postedById !== recruiterId) {
      const error = new Error('Access denied: you can only close jobs you posted');
      error.status = 403;
      throw error;
    }

    const closedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: JOB_STATUS.CLOSED },
      include: { company: true }
    });

    return closedJob;
  }

  async deleteJob(jobId, recruiterId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      throw error;
    }

    // Business rule: Recruiters can delete ONLY their own jobs
    if (job.postedById !== recruiterId) {
      const error = new Error('Access denied: you can only delete jobs you posted');
      error.status = 403;
      throw error;
    }

    // Business rule: If it has applications, soft-close it (status CLOSED); if zero, hard delete
    if (job._count.applications > 0) {
      const closedJob = await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.CLOSED }
      });
      return {
        softDeleted: true,
        message: 'Job posting has active applications. Status was set to CLOSED instead of permanent deletion.',
        job: closedJob
      };
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    return {
      softDeleted: false,
      message: 'Job posting permanently deleted'
    };
  }

  async getRecruiterJobs(recruiterId) {
    const jobs = await prisma.job.findMany({
      where: { postedById: recruiterId },
      include: {
        company: true,
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return jobs;
  }
}

module.exports = new JobService();
