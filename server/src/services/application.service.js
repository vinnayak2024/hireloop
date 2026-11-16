const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');
const { APPLICATION_STATUS, JOB_STATUS, ROLES } = require('../constants');

class ApplicationService {
  async applyForJob(jobId, candidateId, file, coverLetter) {
    // 1. Verify target job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      const error = new Error('Job posting not found');
      error.status = 404;
      throw error;
    }

    // 2. Business rule: No applying to CLOSED jobs
    if (job.status !== JOB_STATUS.OPEN) {
      const error = new Error('Cannot apply to a closed job posting');
      error.status = 400;
      throw error;
    }

    // 3. Business rule: No applying after deadline
    if (job.deadline && new Date() > new Date(job.deadline)) {
      const error = new Error('The application deadline for this job posting has expired');
      error.status = 400;
      throw error;
    }

    // 4. Business rule: Candidate cannot apply twice to the same job
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId
        }
      }
    });

    if (existingApplication) {
      const error = new Error('You have already applied for this job');
      error.status = 409;
      throw error;
    }

    // 5. Determine resume path (uploaded file takes precedence, fallback to default resume)
    let resumePath = null;
    if (file) {
      resumePath = `uploads/resumes/${file.filename}`;
    } else {
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId: candidateId }
      });
      if (candidateProfile && candidateProfile.defaultResumePath) {
        resumePath = candidateProfile.defaultResumePath;
      }
    }

    if (!resumePath) {
      const error = new Error('Resume is required. Please upload a PDF resume or set a default resume in your profile.');
      error.status = 400;
      throw error;
    }

    // 6. Atomically create Application and initial Status History
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId,
          candidateId,
          resumePath,
          coverLetter: coverLetter ? coverLetter.trim() : null,
          status: APPLICATION_STATUS.APPLIED
        },
        include: {
          job: {
            include: { company: true }
          }
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: 'NONE',
          toStatus: APPLICATION_STATUS.APPLIED,
          changedById: candidateId
        }
      });

      return app;
    });

    return application;
  }

  async getCandidateApplications(candidateId, statusFilter) {
    const where = { candidateId };

    if (statusFilter && Object.values(APPLICATION_STATUS).includes(statusFilter)) {
      where.status = statusFilter;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: { company: true }
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: {
            changedBy: {
              select: { name: true, role: true }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return applications;
  }

  async getJobApplications(jobId, recruiterId, { status, search }) {
    // Ownership check: Verify recruiter owns this job
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      throw error;
    }

    if (job.postedById !== recruiterId) {
      const error = new Error('Access denied: you can only view applications for your own job postings');
      error.status = 403;
      throw error;
    }

    const where = { jobId };

    if (status && Object.values(APPLICATION_STATUS).includes(status)) {
      where.status = status;
    }

    if (search && search.trim()) {
      where.candidate = {
        name: { contains: search.trim() }
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            candidateProfile: true
          }
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: {
            changedBy: {
              select: { name: true, role: true }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return applications;
  }

  async updateApplicationStatus(applicationId, recruiterId, { status: toStatus, recruiterNote }) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      throw error;
    }

    // Ownership check: Recruiter must own the job
    if (application.job.postedById !== recruiterId) {
      const error = new Error('Access denied: you can only update applications for your own jobs');
      error.status = 403;
      throw error;
    }

    const currentStatus = application.status;

    // Business rule: Valid recruiter status transitions
    // APPLIED -> UNDER_REVIEW -> SHORTLISTED or REJECTED.
    // Recruiter may also go APPLIED -> SHORTLISTED/REJECTED directly.
    const allowedRecruiterTransitions = {
      [APPLICATION_STATUS.APPLIED]: [
        APPLICATION_STATUS.UNDER_REVIEW,
        APPLICATION_STATUS.SHORTLISTED,
        APPLICATION_STATUS.REJECTED
      ],
      [APPLICATION_STATUS.UNDER_REVIEW]: [
        APPLICATION_STATUS.SHORTLISTED,
        APPLICATION_STATUS.REJECTED
      ],
      [APPLICATION_STATUS.SHORTLISTED]: [],
      [APPLICATION_STATUS.REJECTED]: [],
      [APPLICATION_STATUS.WITHDRAWN]: []
    };

    const allowed = allowedRecruiterTransitions[currentStatus] || [];
    if (!allowed.includes(toStatus)) {
      const error = new Error(`Invalid status transition from ${currentStatus} to ${toStatus}`);
      error.status = 400;
      throw error;
    }

    // Atomically update status and insert audit history record
    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: toStatus,
          recruiterNote: recruiterNote !== undefined ? recruiterNote : application.recruiterNote
        },
        include: {
          job: { include: { company: true } },
          candidate: { select: { id: true, name: true, email: true } }
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: currentStatus,
          toStatus,
          changedById: recruiterId
        }
      });

      return updated;
    });

    return updatedApplication;
  }

  async withdrawApplication(applicationId, candidateId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      throw error;
    }

    // Ownership check: Candidate can withdraw only their own application
    if (application.candidateId !== candidateId) {
      const error = new Error('Access denied: you can only withdraw your own applications');
      error.status = 403;
      throw error;
    }

    // Business rule: Candidate may only move their application to WITHDRAWN (from APPLIED or UNDER_REVIEW)
    if (application.status === APPLICATION_STATUS.WITHDRAWN) {
      const error = new Error('Application is already withdrawn');
      error.status = 400;
      throw error;
    }

    const withdrawableStatuses = [APPLICATION_STATUS.APPLIED, APPLICATION_STATUS.UNDER_REVIEW];
    if (!withdrawableStatuses.includes(application.status)) {
      const error = new Error(`Cannot withdraw an application that has already been ${application.status.toLowerCase()}`);
      error.status = 400;
      throw error;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.WITHDRAWN }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: APPLICATION_STATUS.WITHDRAWN,
          changedById: candidateId
        }
      });

      return app;
    });

    return updated;
  }

  async getApplicationHistory(applicationId, userId, userRole) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      throw error;
    }

    // Access authorization: only applicant or job-owner recruiter
    const isApplicant = application.candidateId === userId;
    const isJobOwner = application.job.postedById === userId;

    if (!isApplicant && !isJobOwner) {
      const error = new Error('Access denied: you cannot view history for this application');
      error.status = 403;
      throw error;
    }

    const history = await prisma.applicationStatusHistory.findMany({
      where: { applicationId },
      orderBy: { changedAt: 'asc' },
      include: {
        changedBy: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return history;
  }

  async getResumeDownloadInfo(applicationId, userId, userRole) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: {
          select: { name: true }
        }
      }
    });

    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      throw error;
    }

    // Access authorization: applicant or posting recruiter
    const isApplicant = application.candidateId === userId;
    const isJobOwner = application.job.postedById === userId;

    if (!isApplicant && !isJobOwner) {
      const error = new Error('Access denied: you are not authorized to download this resume');
      error.status = 403;
      throw error;
    }

    // Resolve file path on disk
    const absolutePath = path.resolve(__dirname, '../../', application.resumePath);

    if (!fs.existsSync(absolutePath)) {
      const error = new Error('Resume file was not found on server disk');
      error.status = 404;
      throw error;
    }

    // Candidate name formatted for download filename
    const sanitizedName = application.candidate.name.replace(/[^a-zA-Z0-9]/g, '_');
    const downloadFilename = `${sanitizedName}_Resume.pdf`;

    return {
      filePath: absolutePath,
      downloadFilename
    };
  }

  async getRecruiterStats(recruiterId) {
    const [totalJobs, openJobs, applications] = await Promise.all([
      prisma.job.count({
        where: { postedById: recruiterId }
      }),
      prisma.job.count({
        where: { postedById: recruiterId, status: JOB_STATUS.OPEN }
      }),
      prisma.application.findMany({
        where: { job: { postedById: recruiterId } },
        select: { status: true }
      })
    ]);

    const totalApplicants = applications.length;

    // Initialize counts for every status
    const statusCounts = {
      [APPLICATION_STATUS.APPLIED]: 0,
      [APPLICATION_STATUS.UNDER_REVIEW]: 0,
      [APPLICATION_STATUS.SHORTLISTED]: 0,
      [APPLICATION_STATUS.REJECTED]: 0,
      [APPLICATION_STATUS.WITHDRAWN]: 0
    };

    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    return {
      totalJobs,
      openJobs,
      totalApplicants,
      statusCounts
    };
  }
}

module.exports = new ApplicationService();
