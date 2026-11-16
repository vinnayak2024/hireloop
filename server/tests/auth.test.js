process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { ROLES } = require('../src/constants');

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    // Clear existing records before running test suite
    await prisma.applicationStatusHistory.deleteMany();
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.company.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Disconnect Prisma after tests complete
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new candidate successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Candidate',
          email: 'jane.candidate@example.com',
          password: 'password123',
          role: ROLES.CANDIDATE
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        name: 'Jane Candidate',
        email: 'jane.candidate@example.com',
        role: ROLES.CANDIDATE
      });
      expect(res.body.user.candidateProfile).toBeDefined();
    });

    it('should register a new recruiter successfully with company name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Recruiter',
          email: 'john.recruiter@example.com',
          password: 'password123',
          role: ROLES.RECRUITER,
          companyName: 'Acme Corp'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        name: 'John Recruiter',
        email: 'john.recruiter@example.com',
        role: ROLES.RECRUITER
      });
      expect(res.body.user.companies).toHaveLength(1);
      expect(res.body.user.companies[0].name).toBe('Acme Corp');
    });

    it('should reject registration if email is already taken (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Jane',
          email: 'jane.candidate@example.com',
          password: 'password123',
          role: ROLES.CANDIDATE
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.message).toMatch(/already registered/i);
    });

    it('should reject invalid input with field-level validation errors (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'J',
          email: 'not-an-email',
          password: '123',
          role: 'ADMIN' // Invalid role
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.message).toBe('Validation failed');
      expect(res.body.error.details).toHaveProperty('name');
      expect(res.body.error.details).toHaveProperty('email');
      expect(res.body.error.details).toHaveProperty('password');
      expect(res.body.error.details).toHaveProperty('role');
    });

    it('should reject recruiter registration if companyName is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Recruiter No Company',
          email: 'nocompany@example.com',
          password: 'password123',
          role: ROLES.RECRUITER
        });

      expect(res.status).toBe(400);
      expect(res.body.error.details).toHaveProperty('companyName');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.candidate@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('jane.candidate@example.com');
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.candidate@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should reject login for non-existent email (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let candidateToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane.candidate@example.com',
          password: 'password123'
        });
      candidateToken = loginRes.body.token;
    });

    it('should return current user profile when valid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('jane.candidate@example.com');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject request without Bearer token (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.message).toMatch(/Authentication required/i);
    });

    it('should reject request with malformed or invalid token (401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-string');

      expect(res.status).toBe(401);
      expect(res.body.error.message).toMatch(/Invalid or expired/i);
    });
  });
});
