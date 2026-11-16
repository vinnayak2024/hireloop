process.env.NODE_ENV = 'test';

const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { ROLES, JOB_TYPES, WORK_MODES, APPLICATION_STATUS } = require('../src/constants');

const SAMPLE_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
);

describe('Applications, File Upload & Recruiter Stats API', () => {
  let recruiter1Token;
  let recruiter2Token;
  let candidateToken;
  let recruiter1JobId;
  let recruiter2JobId;
  let candidateId;
  let testAppId;

  const tempPdfPath = path.join(__dirname, 'test_resume.pdf');
  const tempTxtPath = path.join(__dirname, 'test_fake.txt');

  beforeAll(async () => {
    // Write temporary test files for multer upload testing
    fs.writeFileSync(tempPdfPath, SAMPLE_PDF_BUFFER);
    fs.writeFileSync(tempTxtPath, 'This is plain text, not a PDF.');

    // Reset database
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.user.deleteMany();

    // Register Recruiter 1
    const r1 = await request(app).post('/api/auth/register').send({
      name: 'Sarah Cloud',
      email: 'sarah.cloud@test.com',
      password: 'password123',
      role: ROLES.RECRUITER,
      companyName: 'Cloud Systems'
    });
    recruiter1Token = r1.body.token;

    // Register Recruiter 2
    const r2 = await request(app).post('/api/auth/register').send({
      name: 'Rajesh Fin',
      email: 'rajesh.fin@test.com',
      password: 'password123',
      role: ROLES.RECRUITER,
      companyName: 'Fintech Inc'
    });
    recruiter2Token = r2.body.token;

    // Register Candidate
    const cand = await request(app).post('/api/auth/register').send({
      name: 'Alex Developer',
      email: 'alex.dev@test.com',
      password: 'password123',
      role: ROLES.CANDIDATE
    });
    candidateToken = cand.body.token;
    candidateId = cand.body.user.id;

    // Recruiter 1 posts a job
    const j1 = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter1Token}`)
      .send({
        title: 'Senior Cloud Engineer',
        description: 'Design distributed architectures on cloud infrastructure.',
        location: 'Bangalore, India',
        jobType: JOB_TYPES.FULL_TIME,
        workMode: WORK_MODES.REMOTE,
        salaryMin: 1500000,
        salaryMax: 2200000,
        skills: 'Node.js, AWS, Docker',
        experienceRequired: 3
      });
    recruiter1JobId = j1.body.job.id;

    // Recruiter 2 posts a job
    const j2 = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter2Token}`)
      .send({
        title: 'Payment Gateway Engineer',
        description: 'Implement secure payment interfaces.',
        location: 'Mumbai, India',
        jobType: JOB_TYPES.FULL_TIME,
        workMode: WORK_MODES.HYBRID,
        salaryMin: 1200000,
        salaryMax: 1800000,
        skills: 'Node.js, Express, SQL',
        experienceRequired: 2
      });
    recruiter2JobId = j2.body.job.id;
  });

  afterAll(async () => {
    // Clean up temporary test files
    if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
    if (fs.existsSync(tempTxtPath)) fs.unlinkSync(tempTxtPath);
    await prisma.$disconnect();
  });

  describe('Candidate Profile & Default Resume Upload', () => {
    it('should allow candidate to update their profile', async () => {
      const res = await request(app)
        .put('/api/candidate/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          phone: '+91 9999999999',
          location: 'Bangalore',
          headline: 'Full Stack Engineer',
          skills: 'Node.js, React, SQL',
          experienceYears: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.profile.phone).toBe('+91 9999999999');
      expect(res.body.profile.experienceYears).toBe(3);
    });

    it('should reject non-PDF default resume upload (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/candidate/resume')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', tempTxtPath);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Only PDF documents/i);
    });

    it('should allow candidate to upload a default PDF resume', async () => {
      const res = await request(app)
        .post('/api/candidate/resume')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', tempPdfPath);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('defaultResumePath');
      expect(res.body.defaultResumePath).toMatch(/\.pdf$/);
    });
  });

  describe('Application Submission (POST /api/jobs/:id/apply)', () => {
    it('should allow candidate to apply using default profile resume', async () => {
      const res = await request(app)
        .post(`/api/jobs/${recruiter1JobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .field('coverLetter', 'Excited to apply for Senior Cloud Engineer.');

      expect(res.status).toBe(201);
      expect(res.body.application).toHaveProperty('id');
      expect(res.body.application.status).toBe(APPLICATION_STATUS.APPLIED);
      testAppId = res.body.application.id;
    });

    it('should reject duplicate application from same candidate (409 Conflict)', async () => {
      const res = await request(app)
        .post(`/api/jobs/${recruiter1JobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .field('coverLetter', 'Trying to apply again.');

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already applied/i);
    });

    it('should reject application with non-PDF resume file', async () => {
      const res = await request(app)
        .post(`/api/jobs/${recruiter2JobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', tempTxtPath);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Only PDF documents/i);
    });
  });

  describe('Status Transitions & History (Section 5 Rules)', () => {
    it('should allow Recruiter 1 to move application to UNDER_REVIEW with note', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          status: APPLICATION_STATUS.UNDER_REVIEW,
          recruiterNote: 'Shortlisted for technical review'
        });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe(APPLICATION_STATUS.UNDER_REVIEW);
      expect(res.body.application.recruiterNote).toBe('Shortlisted for technical review');
    });

    it('should reject invalid transition: UNDER_REVIEW -> APPLIED (400 Bad Request)', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          status: APPLICATION_STATUS.APPLIED
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Invalid status transition/i);
    });

    it('should allow Recruiter 1 to move application from UNDER_REVIEW to SHORTLISTED', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          status: APPLICATION_STATUS.SHORTLISTED
        });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe(APPLICATION_STATUS.SHORTLISTED);
    });

    it('should reject transition from terminal status SHORTLISTED to REJECTED (400 Bad Request)', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/status`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          status: APPLICATION_STATUS.REJECTED
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Invalid status transition/i);
    });

    it('should reject candidate withdrawing a SHORTLISTED application (400 Bad Request)', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testAppId}/withdraw`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/Cannot withdraw/i);
    });

    it('should allow candidate to withdraw an application in APPLIED status', async () => {
      // Candidate applies to Recruiter 2's job
      const appRes = await request(app)
        .post(`/api/jobs/${recruiter2JobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', tempPdfPath);

      const newAppId = appRes.body.application.id;

      // Candidate withdraws it
      const withdrawRes = await request(app)
        .patch(`/api/applications/${newAppId}/withdraw`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(withdrawRes.status).toBe(200);
      expect(withdrawRes.body.application.status).toBe(APPLICATION_STATUS.WITHDRAWN);
    });

    it('should track status history timeline entries accurately', async () => {
      const res = await request(app)
        .get(`/api/applications/${testAppId}/history`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.history.length).toBeGreaterThanOrEqual(3);
      expect(res.body.history[0].toStatus).toBe(APPLICATION_STATUS.APPLIED);
      expect(res.body.history[1].toStatus).toBe(APPLICATION_STATUS.UNDER_REVIEW);
      expect(res.body.history[2].toStatus).toBe(APPLICATION_STATUS.SHORTLISTED);
    });
  });

  describe('Authorization & Cross-Recruiter Isolation', () => {
    it('should deny Recruiter 2 access to Recruiter 1 job applicants (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/jobs/${recruiter1JobId}/applications`)
        .set('Authorization', `Bearer ${recruiter2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/only view applications for your own/i);
    });

    it('should deny Recruiter 2 from downloading resume for Recruiter 1 job (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/applications/${testAppId}/resume`)
        .set('Authorization', `Bearer ${recruiter2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/not authorized to download/i);
    });

    it('should allow Recruiter 1 and Candidate to download resume file', async () => {
      const res = await request(app)
        .get(`/api/applications/${testAppId}/resume`)
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/i);
    });
  });

  describe('Recruiter Stats (GET /api/recruiter/stats)', () => {
    it('should return aggregated stats for recruiter jobs and applicants', async () => {
      const res = await request(app)
        .get('/api/recruiter/stats')
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toHaveProperty('totalJobs', 1);
      expect(res.body.stats).toHaveProperty('openJobs', 1);
      expect(res.body.stats).toHaveProperty('totalApplicants', 1);
      expect(res.body.stats.statusCounts[APPLICATION_STATUS.SHORTLISTED]).toBe(1);
    });
  });
});
