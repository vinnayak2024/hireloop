const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const prisma = require('../src/utils/prisma');
const { ROLES, JOB_TYPES, WORK_MODES, JOB_STATUS, APPLICATION_STATUS } = require('../src/constants');

// Minimal valid 1-page PDF binary string
const MINIMAL_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
);

async function main() {
  console.log('Seeding HireLoop database...');

  // 1. Clean existing records in correct referential order
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.user.deleteMany();

  // Ensure resumes directory exists and seed dummy sample PDFs
  const resumesDir = path.join(__dirname, '../uploads/resumes');
  if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
  }

  const aaravResumePath = 'uploads/resumes/aarav_sharma_resume.pdf';
  const priyaResumePath = 'uploads/resumes/priya_nair_resume.pdf';
  const rohanResumePath = 'uploads/resumes/rohan_verma_resume.pdf';

  fs.writeFileSync(path.join(__dirname, '../', aaravResumePath), MINIMAL_PDF_BUFFER);
  fs.writeFileSync(path.join(__dirname, '../', priyaResumePath), MINIMAL_PDF_BUFFER);
  fs.writeFileSync(path.join(__dirname, '../', rohanResumePath), MINIMAL_PDF_BUFFER);

  const commonPassword = await bcrypt.hash('password123', 10);

  // 2. Create 2 Recruiters with Companies
  const recruiter1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@cloudnexus.io',
      passwordHash: commonPassword,
      role: ROLES.RECRUITER,
      companies: {
        create: {
          name: 'CloudNexus Solutions',
          website: 'https://cloudnexus.io',
          location: 'Bangalore, India',
          description: 'Leading enterprise cloud computing and distributed systems engineering firm.'
        }
      }
    },
    include: { companies: true }
  });

  const recruiter2 = await prisma.user.create({
    data: {
      name: 'Rajesh Mehta',
      email: 'rajesh@finscale.tech',
      passwordHash: commonPassword,
      role: ROLES.RECRUITER,
      companies: {
        create: {
          name: 'FinScale Technologies',
          website: 'https://finscale.tech',
          location: 'Mumbai, India',
          description: 'Next-generation fintech platforms providing algorithmic trading and payment APIs.'
        }
      }
    },
    include: { companies: true }
  });

  const company1 = recruiter1.companies[0];
  const company2 = recruiter2.companies[0];

  // 3. Create 3 Candidates with Profiles and default resumes
  const candidate1 = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'aarav@candidate.com',
      passwordHash: commonPassword,
      role: ROLES.CANDIDATE,
      candidateProfile: {
        create: {
          phone: '+91 9876543210',
          location: 'Bangalore, India',
          headline: 'Full Stack MERN Developer | React & Node.js Enthusiast',
          skills: 'React, Node.js, Express, JavaScript, MongoDB, Tailwind CSS, Git',
          experienceYears: 2,
          defaultResumePath: aaravResumePath
        }
      }
    }
  });

  const candidate2 = await prisma.user.create({
    data: {
      name: 'Priya Nair',
      email: 'priya@candidate.com',
      passwordHash: commonPassword,
      role: ROLES.CANDIDATE,
      candidateProfile: {
        create: {
          phone: '+91 9876543211',
          location: 'Pune, India',
          headline: 'Backend Engineer & Distributed Systems Specialist',
          skills: 'Node.js, PostgreSQL, Docker, Microservices, Python, Redis, REST APIs',
          experienceYears: 4,
          defaultResumePath: priyaResumePath
        }
      }
    }
  });

  const candidate3 = await prisma.user.create({
    data: {
      name: 'Rohan Verma',
      email: 'rohan@candidate.com',
      passwordHash: commonPassword,
      role: ROLES.CANDIDATE,
      candidateProfile: {
        create: {
          phone: '+91 9876543212',
          location: 'Hyderabad, India',
          headline: 'Fresh Graduate & Frontend Developer',
          skills: 'JavaScript, React, HTML, CSS, Tailwind CSS, UI/UX Design',
          experienceYears: 0,
          defaultResumePath: rohanResumePath
        }
      }
    }
  });

  // 4. Create 12 Realistic Jobs
  const createdJobs = {};

  const jobsData = [
    // Recruiter 1 Jobs (CloudNexus)
    {
      key: 'job_fs_sr',
      title: 'Senior Full Stack Engineer',
      description: 'Looking for an experienced Full Stack Engineer to architect high-throughput web applications using React, Node.js, and SQL databases. You will mentor juniors and design resilient APIs.',
      location: 'Bangalore, India',
      jobType: JOB_TYPES.FULL_TIME,
      workMode: WORK_MODES.HYBRID,
      salaryMin: 1800000,
      salaryMax: 2600000,
      skills: 'React, Node.js, Express, PostgreSQL, REST APIs, Architecture',
      experienceRequired: 4,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyId: company1.id,
      postedById: recruiter1.id
    },
    {
      key: 'job_frontend',
      title: 'Frontend React Developer',
      description: 'Join our customer dashboard team to build slick, accessible, and responsive user interfaces with React and Tailwind CSS. Experience with state management is required.',
      location: 'Bangalore, India',
      jobType: JOB_TYPES.FULL_TIME,
      workMode: WORK_MODES.REMOTE,
      salaryMin: 900000,
      salaryMax: 1400000,
      skills: 'React, JavaScript, Tailwind CSS, HTML5, CSS3, Git',
      experienceRequired: 2,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      companyId: company1.id,
      postedById: recruiter1.id
    },
    {
      key: 'job_devops_intern',
      title: 'Cloud DevOps Intern',
      description: 'Exciting internship opportunity for engineering students eager to learn AWS, Docker containerization, CI/CD pipelines, and Linux server management.',
      location: 'Bangalore, India',
      jobType: JOB_TYPES.INTERNSHIP,
      workMode: WORK_MODES.ONSITE,
      salaryMin: 300000,
      salaryMax: 450000,
      skills: 'Linux, Docker, AWS, Bash, Git',
      experienceRequired: 0,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      companyId: company1.id,
      postedById: recruiter1.id
    },
    {
      key: 'job_node_arch',
      title: 'Backend Node.js Architect',
      description: 'Lead backend microservice architecture for multi-tenant cloud systems. Strong expertise with Express, Redis caching, and SQL query tuning essential.',
      location: 'Hyderabad, India',
      jobType: JOB_TYPES.FULL_TIME,
      workMode: WORK_MODES.REMOTE,
      salaryMin: 2400000,
      salaryMax: 3500000,
      skills: 'Node.js, Express, Microservices, SQL, Redis, System Design',
      experienceRequired: 5,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      companyId: company1.id,
      postedById: recruiter1.id
    },
    {
      key: 'job_writer',
      title: 'Part-Time Technical Content Writer',
      description: 'Create comprehensive developer guides, API references, and tutorials for our cloud developer portal. Flexible 20 hours per week.',
      location: 'Remote',
      jobType: JOB_TYPES.PART_TIME,
      workMode: WORK_MODES.REMOTE,
      salaryMin: 400000,
      salaryMax: 600000,
      skills: 'Technical Writing, Markdown, REST APIs, Developer Documentation',
      experienceRequired: 1,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      companyId: company1.id,
      postedById: recruiter1.id
    },
    {
      key: 'job_migration',
      title: 'Legacy Systems Migration Consultant',
      description: 'Six-month contract to help transition legacy monolith workloads to modular Node.js services.',
      location: 'Bangalore, India',
      jobType: JOB_TYPES.CONTRACT,
      workMode: WORK_MODES.HYBRID,
      salaryMin: 1500000,
      salaryMax: 2000000,
      skills: 'Node.js, Migration, SQL, Architecture, Monolith to Microservices',
      experienceRequired: 3,
      status: JOB_STATUS.CLOSED,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      companyId: company1.id,
      postedById: recruiter1.id
    },

    // Recruiter 2 Jobs (FinScale)
    {
      key: 'job_fintech_be',
      title: 'Fintech Backend Engineer',
      description: 'Build secure, fault-tolerant transaction processing services handling thousands of orders per second. You will implement idempotency, audit trails, and strict schema validation.',
      location: 'Mumbai, India',
      jobType: JOB_TYPES.FULL_TIME,
      workMode: WORK_MODES.ONSITE,
      salaryMin: 1600000,
      salaryMax: 2400000,
      skills: 'Node.js, Express, PostgreSQL, Financial Transactions, Security',
      experienceRequired: 3,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyId: company2.id,
      postedById: recruiter2.id
    },
    {
      key: 'job_jr_web',
      title: 'Junior Web Developer',
      description: 'Great role for junior engineers with basic knowledge of JavaScript, modern HTML/CSS, and backend basics. You will work on internal analytics dashboards.',
      location: 'Mumbai, India',
      jobType: JOB_TYPES.FULL_TIME,
      workMode: WORK_MODES.HYBRID,
      salaryMin: 600000,
      salaryMax: 850000,
      skills: 'JavaScript, React, Node.js, CSS, Git',
      experienceRequired: 1,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      companyId: company2.id,
      postedById: recruiter2.id
    },
    {
      key: 'job_ui_fe',
      title: 'UI/UX Frontend Engineer',
      description: 'Collaborate with product designers to implement pixel-perfect trading screens and market charts with React and Recharts.',
      location: 'Pune, India',
      jobType: JOB_TYPES.FULL_TIME,
      workMode: WORK_MODES.HYBRID,
      salaryMin: 1100000,
      salaryMax: 1700000,
      skills: 'React, Tailwind CSS, Recharts, Responsive Design, Accessibility',
      experienceRequired: 2,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      companyId: company2.id,
      postedById: recruiter2.id
    },
    {
      key: 'job_intern_prod',
      title: 'Full Stack Product Intern',
      description: 'Summer internship for computer science students to build prototype features using React and Express.',
      location: 'Mumbai, India',
      jobType: JOB_TYPES.INTERNSHIP,
      workMode: WORK_MODES.ONSITE,
      salaryMin: 350000,
      salaryMax: 500000,
      skills: 'React, Node.js, Express, JavaScript, Tailwind CSS',
      experienceRequired: 0,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      companyId: company2.id,
      postedById: recruiter2.id
    },
    {
      key: 'job_sec_audit',
      title: 'Security & Compliance Auditor',
      description: 'Review backend APIs for OWASP compliance, rate limiting, and RBAC vulnerabilities.',
      location: 'Mumbai, India',
      jobType: JOB_TYPES.CONTRACT,
      workMode: WORK_MODES.REMOTE,
      salaryMin: 1800000,
      salaryMax: 2500000,
      skills: 'Cybersecurity, OWASP, Penetration Testing, Audit, Node.js',
      experienceRequired: 4,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      companyId: company2.id,
      postedById: recruiter2.id
    },
    {
      key: 'job_support',
      title: 'Part-Time Support Engineer',
      description: 'Handle customer technical escalations and inspect API logs during weekend trading sessions.',
      location: 'Remote',
      jobType: JOB_TYPES.PART_TIME,
      workMode: WORK_MODES.REMOTE,
      salaryMin: 500000,
      salaryMax: 700000,
      skills: 'API Support, Debugging, SQL Queries, Customer Communication',
      experienceRequired: 1,
      status: JOB_STATUS.OPEN,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      companyId: company2.id,
      postedById: recruiter2.id
    }
  ];

  for (const item of jobsData) {
    const { key, ...data } = item;
    const created = await prisma.job.create({ data });
    createdJobs[key] = created;
  }

  // 5. Seed Sample Applications across different statuses with Status History
  console.log('Seeding sample applications and status timelines...');

  // Application 1: Aarav -> Senior Full Stack Engineer (CloudNexus) -> SHORTLISTED
  const app1 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_fs_sr'].id,
      candidateId: candidate1.id,
      resumePath: aaravResumePath,
      coverLetter: 'I have 2 years of experience building scalable applications using React, Node.js, and Express.',
      status: APPLICATION_STATUS.SHORTLISTED,
      recruiterNote: 'Strong portfolio and clear system design concepts in technical screening.'
    }
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app1.id,
        fromStatus: 'NONE',
        toStatus: APPLICATION_STATUS.APPLIED,
        changedById: candidate1.id,
        changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app1.id,
        fromStatus: APPLICATION_STATUS.APPLIED,
        toStatus: APPLICATION_STATUS.UNDER_REVIEW,
        changedById: recruiter1.id,
        changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app1.id,
        fromStatus: APPLICATION_STATUS.UNDER_REVIEW,
        toStatus: APPLICATION_STATUS.SHORTLISTED,
        changedById: recruiter1.id,
        changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Application 2: Aarav -> Fintech Backend Engineer (FinScale) -> UNDER_REVIEW
  const app2 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_fintech_be'].id,
      candidateId: candidate1.id,
      resumePath: aaravResumePath,
      coverLetter: 'Interested in fintech backend architecture and transaction safety.',
      status: APPLICATION_STATUS.UNDER_REVIEW,
      recruiterNote: 'Reviewing SQL query performance experience.'
    }
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app2.id,
        fromStatus: 'NONE',
        toStatus: APPLICATION_STATUS.APPLIED,
        changedById: candidate1.id,
        changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app2.id,
        fromStatus: APPLICATION_STATUS.APPLIED,
        toStatus: APPLICATION_STATUS.UNDER_REVIEW,
        changedById: recruiter2.id,
        changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Application 3: Priya -> Fintech Backend Engineer (FinScale) -> SHORTLISTED
  const app3 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_fintech_be'].id,
      candidateId: candidate2.id,
      resumePath: priyaResumePath,
      coverLetter: '4 years experience with distributed systems, PostgreSQL, and high-concurrency microservices.',
      status: APPLICATION_STATUS.SHORTLISTED,
      recruiterNote: 'Superb qualifications in ACID transactions and microservices.'
    }
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app3.id,
        fromStatus: 'NONE',
        toStatus: APPLICATION_STATUS.APPLIED,
        changedById: candidate2.id,
        changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app3.id,
        fromStatus: APPLICATION_STATUS.APPLIED,
        toStatus: APPLICATION_STATUS.SHORTLISTED,
        changedById: recruiter2.id,
        changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Application 4: Priya -> Backend Node.js Architect (CloudNexus) -> UNDER_REVIEW
  const app4 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_node_arch'].id,
      candidateId: candidate2.id,
      resumePath: priyaResumePath,
      coverLetter: 'Eager to apply enterprise architectural design for CloudNexus.',
      status: APPLICATION_STATUS.UNDER_REVIEW
    }
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app4.id,
        fromStatus: 'NONE',
        toStatus: APPLICATION_STATUS.APPLIED,
        changedById: candidate2.id,
        changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app4.id,
        fromStatus: APPLICATION_STATUS.APPLIED,
        toStatus: APPLICATION_STATUS.UNDER_REVIEW,
        changedById: recruiter1.id,
        changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Application 5: Rohan -> Cloud DevOps Intern (CloudNexus) -> APPLIED
  const app5 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_devops_intern'].id,
      candidateId: candidate3.id,
      resumePath: rohanResumePath,
      coverLetter: 'Recent computer science graduate passionate about learning Linux and Docker.',
      status: APPLICATION_STATUS.APPLIED
    }
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app5.id,
      fromStatus: 'NONE',
      toStatus: APPLICATION_STATUS.APPLIED,
      changedById: candidate3.id,
      changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  // Application 6: Rohan -> Full Stack Product Intern (FinScale) -> WITHDRAWN
  const app6 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_intern_prod'].id,
      candidateId: candidate3.id,
      resumePath: rohanResumePath,
      coverLetter: 'Interested in frontend internships.',
      status: APPLICATION_STATUS.WITHDRAWN
    }
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app6.id,
        fromStatus: 'NONE',
        toStatus: APPLICATION_STATUS.APPLIED,
        changedById: candidate3.id,
        changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app6.id,
        fromStatus: APPLICATION_STATUS.APPLIED,
        toStatus: APPLICATION_STATUS.WITHDRAWN,
        changedById: candidate3.id,
        changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Application 7: Rohan -> Frontend React Developer (CloudNexus) -> REJECTED
  const app7 = await prisma.application.create({
    data: {
      jobId: createdJobs['job_frontend'].id,
      candidateId: candidate3.id,
      resumePath: rohanResumePath,
      coverLetter: 'Applying for React developer role.',
      status: APPLICATION_STATUS.REJECTED,
      recruiterNote: 'Position requires at least 2 years of production experience.'
    }
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app7.id,
        fromStatus: 'NONE',
        toStatus: APPLICATION_STATUS.APPLIED,
        changedById: candidate3.id,
        changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        applicationId: app7.id,
        fromStatus: APPLICATION_STATUS.APPLIED,
        toStatus: APPLICATION_STATUS.REJECTED,
        changedById: recruiter1.id,
        changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('\nHireLoop Database Seeded Successfully!');
  console.log('=====================================================');
  console.log('DEMO CREDENTIALS:');
  console.log('=====================================================');
  console.log('1. RECRUITER 1 (CloudNexus Solutions):');
  console.log('   Email:    sarah@cloudnexus.io');
  console.log('   Password: password123');
  console.log('-----------------------------------------------------');
  console.log('2. RECRUITER 2 (FinScale Technologies):');
  console.log('   Email:    rajesh@finscale.tech');
  console.log('   Password: password123');
  console.log('-----------------------------------------------------');
  console.log('3. CANDIDATE 1 (2 yrs exp - Full Stack):');
  console.log('   Email:    aarav@candidate.com');
  console.log('   Password: password123');
  console.log('-----------------------------------------------------');
  console.log('4. CANDIDATE 2 (4 yrs exp - Backend Architect):');
  console.log('   Email:    priya@candidate.com');
  console.log('   Password: password123');
  console.log('-----------------------------------------------------');
  console.log('5. CANDIDATE 3 (0 yrs exp - Fresh Graduate):');
  console.log('   Email:    rohan@candidate.com');
  console.log('   Password: password123');
  console.log('=====================================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
