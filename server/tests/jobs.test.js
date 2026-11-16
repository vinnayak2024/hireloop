process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { ROLES, JOB_TYPES, WORK_MODES, JOB_STATUS } = require('../src/constants');

describe('Jobs & Recruiter Company API Endpoints', () => {
  let recruiter1Token;
  let recruiter2Token;
  let candidateToken;
  let recruiter1Id;
  let recruiter2Id;
  let candidateId;
  let sampleJobId;

  beforeAll(async () => {
    // Clean and seed fresh test database
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.user.deleteMany();

    // Register Recruiter 1
    const r1Res = await request(app).post('/api/auth/register').send({
      name: 'Recruiter Alpha',
      email: 'alpha@test.com',
      password: 'password123',
      role: ROLES.RECRUITER,
      companyName: 'Alpha Tech'
    });
    recruiter1Token = r1Res.body.token;
    recruiter1Id = r1Res.body.user.id;

    // Register Recruiter 2
    const r2Res = await request(app).post('/api/auth/register').send({
      name: 'Recruiter Beta',
      email: 'beta@test.com',
      password: 'password123',
      role: ROLES.RECRUITER,
      companyName: 'Beta Labs'
    });
    recruiter2Token = r2Res.body.token;
    recruiter2Id = r2Res.body.user.id;

    // Register Candidate
    const cRes = await request(app).post('/api/auth/register').send({
      name: 'Candidate One',
      email: 'cand@test.com',
      password: 'password123',
      role: ROLES.CANDIDATE
    });
    candidateToken = cRes.body.token;
    candidateId = cRes.body.user.id;

    // Recruiter 1 creates an initial sample job
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter1Token}`)
      .send({
        title: 'Full Stack React Engineer',
        description: 'Design and build responsive web apps with React and Node.js.',
        location: 'Bangalore, India',
        jobType: JOB_TYPES.FULL_TIME,
        workMode: WORK_MODES.REMOTE,
        salaryMin: 1000000,
        salaryMax: 1500000,
        skills: 'React, Node.js, Express',
        experienceRequired: 2
      });
    sampleJobId = jobRes.body.job.id;

    // Create a second job for Recruiter 1 with different criteria
    await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter1Token}`)
      .send({
        title: 'Python DevOps Intern',
        description: 'Learn AWS, Docker, and automation scripting.',
        location: 'Mumbai, India',
        jobType: JOB_TYPES.INTERNSHIP,
        workMode: WORK_MODES.ONSITE,
        salaryMin: 300000,
        salaryMax: 500000,
        skills: 'Python, Docker, AWS',
        experienceRequired: 0
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Company Profile (Recruiter)', () => {
    it('should allow recruiter to get their company profile', async () => {
      const res = await request(app)
        .get('/api/recruiter/company')
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe('Alpha Tech');
    });

    it('should allow recruiter to update their company profile', async () => {
      const res = await request(app)
        .put('/api/recruiter/company')
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          name: 'Alpha Technologies Inc.',
          website: 'https://alphatech.example.com',
          location: 'Bangalore Cyber City'
        });

      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe('Alpha Technologies Inc.');
      expect(res.body.company.location).toBe('Bangalore Cyber City');
    });

    it('should deny candidate access to recruiter company endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/recruiter/company')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/requires RECRUITER role/i);
    });
  });

  describe('Public Job Search & Filters (GET /api/jobs)', () => {
    it('should list all open jobs with pagination structure', async () => {
      const res = await request(app).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 10);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter jobs by keyword (q)', async () => {
      const res = await request(app).get('/api/jobs?q=DevOps');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toContain('DevOps');
    });

    it('should filter jobs by jobType and workMode', async () => {
      const res = await request(app).get(`/api/jobs?jobType=${JOB_TYPES.INTERNSHIP}&workMode=${WORK_MODES.ONSITE}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].jobType).toBe(JOB_TYPES.INTERNSHIP);
      expect(res.body.data[0].workMode).toBe(WORK_MODES.ONSITE);
    });

    it('should filter jobs by experienceRequired', async () => {
      // Experience = 0 should return the intern job, not the 2-yr experience job
      const res = await request(app).get('/api/jobs?experience=0');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].experienceRequired).toBe(0);
    });

    it('should sort jobs by salary descending (salary_high)', async () => {
      const res = await request(app).get('/api/jobs?sort=salary_high');

      expect(res.status).toBe(200);
      expect(res.body.data[0].salaryMax).toBeGreaterThanOrEqual(res.body.data[1].salaryMax);
    });

    it('should return 404 for a non-existent job ID', async () => {
      const res = await request(app).get('/api/jobs/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  describe('Job Ownership & Lifecycle', () => {
    it('should prevent Recruiter 2 from editing Recruiter 1 job (403 Forbidden)', async () => {
      const res = await request(app)
        .put(`/api/jobs/${sampleJobId}`)
        .set('Authorization', `Bearer ${recruiter2Token}`)
        .send({
          title: 'Hacked Job Title'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/only edit jobs you posted/i);
    });

    it('should allow Recruiter 1 to edit their own job', async () => {
      const res = await request(app)
        .put(`/api/jobs/${sampleJobId}`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          title: 'Senior Full Stack React Engineer'
        });

      expect(res.status).toBe(200);
      expect(res.body.job.title).toBe('Senior Full Stack React Engineer');
    });

    it('should prevent Recruiter 2 from closing Recruiter 1 job (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${sampleJobId}/close`)
        .set('Authorization', `Bearer ${recruiter2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/only close jobs you posted/i);
    });

    it('should allow Recruiter 1 to close their own job', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${sampleJobId}/close`)
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.job.status).toBe(JOB_STATUS.CLOSED);

      // Verify closed job is excluded from public GET /api/jobs
      const publicRes = await request(app).get('/api/jobs');
      const found = publicRes.body.data.find(j => j.id === sampleJobId);
      expect(found).toBeUndefined();
    });

    it('should soft-close job on delete if applications exist', async () => {
      // Re-open job and create an application directly in DB
      await prisma.job.update({
        where: { id: sampleJobId },
        data: { status: JOB_STATUS.OPEN }
      });

      await prisma.application.create({
        data: {
          jobId: sampleJobId,
          candidateId,
          resumePath: 'uploads/resumes/dummy.pdf'
        }
      });

      // Recruiter 1 attempts to delete
      const res = await request(app)
        .delete(`/api/jobs/${sampleJobId}`)
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.softDeleted).toBe(true);

      const jobInDb = await prisma.job.findUnique({ where: { id: sampleJobId } });
      expect(jobInDb).not.toBeNull();
      expect(jobInDb.status).toBe(JOB_STATUS.CLOSED);
    });

    it('should permanently hard-delete job if zero applications exist', async () => {
      // Create a temporary job without applications
      const tempJob = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          title: 'Temporary Job',
          description: 'This job will be immediately deleted.',
          location: 'Remote',
          jobType: JOB_TYPES.CONTRACT,
          workMode: WORK_MODES.REMOTE,
          salaryMin: 500000,
          salaryMax: 600000,
          skills: 'Testing',
          experienceRequired: 1
        });

      const tempId = tempJob.body.job.id;

      const deleteRes = await request(app)
        .delete(`/api/jobs/${tempId}`)
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.softDeleted).toBe(false);

      const jobInDb = await prisma.job.findUnique({ where: { id: tempId } });
      expect(jobInDb).toBeNull();
    });

    it('should return recruiter own jobs with applicant counts (GET /api/recruiter/jobs)', async () => {
      const res = await request(app)
        .get('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiter1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.jobs).toBeInstanceOf(Array);
      expect(res.body.jobs[0]).toHaveProperty('_count');
      expect(res.body.jobs[0]._count).toHaveProperty('applications');
    });
  });
});
