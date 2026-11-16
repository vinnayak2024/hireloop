# HireLoop - Full-Stack Job Portal Web Application

HireLoop is a production-grade, beginner-friendly full-stack job portal web application built as a clean monorepo with `/server` and `/client`. It is designed with clean architecture, zero-external-setup SQLite database persistence, strict security controls, and clear code comments tailored for academic viva demonstrations.

---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 + Vite (Plain JavaScript / JSX)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (configured with request/response JWT interceptors)
- **Forms & Validation**: React Hook Form + Zod
- **Notifications**: `react-hot-toast`
- **Analytics Visualization**: Recharts (clean bar chart for application pipeline)

### Backend (`/server`)
- **Runtime & Framework**: Node.js 20 + Express (CommonJS)
- **Database & ORM**: SQLite via Prisma ORM (portable to PostgreSQL)
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcrypt` 10 rounds)
- **File Uploads**: `multer` (Strict MIME & `.pdf` validation, 2MB size limit, UUID filenames)
- **Validation**: Zod (Field-level error reporting)
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Testing**: Jest + Supertest (Backend unit and integration tests)

---

## 📁 Monorepo Folder Structure

```
HireLoop/
├── client/                     # Frontend Vite + React application
│   ├── src/
│   │   ├── api/                # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── candidate/      # TimelineModal
│   │   │   ├── common/         # ProtectedRoute, StatusBadge, LoadingSpinner, EmptyState
│   │   │   └── layout/         # Navbar, Footer
│   │   ├── context/            # AuthContext (user, token, login, logout)
│   │   ├── pages/              # Home, JobsList, JobDetails, Login, Register
│   │   │   ├── candidate/      # CandidateDashboard, CandidateProfile, MyApplications
│   │   │   └── recruiter/      # RecruiterDashboard, MyJobs, JobForm, Applicants, CompanyProfile
│   │   ├── App.jsx             # React Router route registry
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind directives
│   ├── .env                    # Frontend environment variables
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Express API & Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma       # 6-model database schema
│   │   ├── migrations/         # Prisma SQLite migration history
│   │   └── seed.js             # Seed script (2 recruiters, 3 candidates, 12 jobs, 7 applications)
│   ├── src/
│   │   ├── config/             # Environment configuration (env.js)
│   │   ├── constants/          # Roles, JobTypes, WorkModes, JobStatus, ApplicationStatus
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # Auth, RBAC, Validation, Error Handler, Upload, Rate Limiter
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic & Prisma queries
│   │   ├── utils/              # JWT helpers, Prisma singleton, AsyncWrapper
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server entry point
│   ├── tests/                  # Jest + Supertest suites (auth, jobs, applications)
│   ├── uploads/resumes/        # Private disk storage for uploaded PDF resumes (.gitkeep)
│   ├── .env                    # Backend environment variables
│   ├── .env.example
│   └── package.json
├── docs/                       # Architecture and Mermaid documentation
│   ├── er-diagram.md           # Mermaid ER diagram
│   ├── architecture-diagram.md # Layered architecture diagram
│   └── sequence-apply-job.md   # Application lifecycle sequence diagram
└── README.md                   # Complete documentation
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=supersecret_hireloop_jwt_key_2026_student_viva
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Setup and Running Locally

Because HireLoop uses **SQLite**, there is **zero external database server installation** required.

### 1. Install Backend and Initialize Database
```bash
cd server
npm install
npm run prisma:migrate
npm run seed
```

### 2. Run Backend Automated Test Suite
```bash
npm test
```
*Runs 44 automated tests across `auth.test.js`, `jobs.test.js`, and `applications.test.js`.*

### 3. Start Backend Server
```bash
npm run dev
# Server will start on http://localhost:5000
```

### 4. Install Frontend and Start Development Server
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend will be live at http://localhost:5173
```

---

## 🔑 Demo Credentials

All accounts use the password: `password123` *(pre-seeded for easy evaluation)*

| Role | Name | Email | Company / Experience |
|---|---|---|---|
| **Recruiter** | Sarah Jenkins | `sarah@cloudnexus.io` | CloudNexus Solutions |
| **Recruiter** | Rajesh Mehta | `rajesh@finscale.tech` | FinScale Technologies |
| **Candidate** | Aarav Sharma | `aarav@candidate.com` | 2 Years Exp &bull; Full Stack MERN |
| **Candidate** | Priya Nair | `priya@candidate.com` | 4 Years Exp &bull; Backend Architect |
| **Candidate** | Rohan Verma | `rohan@candidate.com` | 0 Years Exp &bull; Fresh Graduate |

> **Viva Tip:** The Login page includes **1-Click Demo Buttons** to autofill credentials instantly without typing.

---

## 📡 API Endpoint Reference

All endpoints return JSON responses. Errors follow `{ error: { message, details? } }`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new Candidate or Recruiter |
| `POST` | `/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/auth/me` | Auth | Get current authenticated user profile |

### Candidate (`/api/candidate`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/candidate/profile` | Candidate | Retrieve candidate profile details |
| `PUT` | `/candidate/profile` | Candidate | Update candidate profile & experience |
| `POST` | `/candidate/resume` | Candidate | Upload default PDF resume (max 2MB) |

### Jobs (`/api/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/jobs` | Public | Search, filter, sort, and paginate open jobs |
| `GET` | `/jobs/:id` | Public | View individual job posting specifications |
| `POST` | `/jobs` | Recruiter | Create a new job posting |
| `PUT` | `/jobs/:id` | Recruiter | Update own job posting |
| `PATCH`| `/jobs/:id/close` | Recruiter | Close own job posting |
| `DELETE`| `/jobs/:id` | Recruiter | Soft-close if applications exist; hard-delete if 0 |
| `GET` | `/recruiter/jobs` | Recruiter | View own jobs with applicant counts |

### Applications (`/api/applications` & `/api/jobs/:id`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/jobs/:id/apply` | Candidate | Submit application with PDF resume & cover letter |
| `GET` | `/applications/mine` | Candidate | View submitted applications with status filter |
| `GET` | `/jobs/:id/applications`| Recruiter | View applicants for own job with search/filter |
| `PATCH`| `/applications/:id/status`| Recruiter | Transition status (`UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`) + note |
| `PATCH`| `/applications/:id/withdraw`| Candidate | Withdraw application (`APPLIED`/`UNDER_REVIEW` only) |
| `GET` | `/applications/:id/history`| Candidate / Recruiter | View application status audit timeline |
| `GET` | `/applications/:id/resume`| Candidate / Recruiter | Securely stream & download candidate PDF resume |

### Recruiter Analytics (`/api/recruiter`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/recruiter/stats` | Recruiter | Metrics: total jobs, open jobs, total applicants, status breakdown |
| `GET` | `/recruiter/company` | Recruiter | View recruiter company profile |
| `PUT` | `/recruiter/company` | Recruiter | Update recruiter company profile |

---

## 🛡️ Business Rules & Security Enforcements

1. **Role Separation**: Recruiters cannot apply to jobs; Candidates cannot create or manage jobs.
2. **Strict Ownership Checks**:
   - Recruiters can only edit, close, delete, and view applicants for jobs **they posted**.
   - Candidates can only view and withdraw **their own applications**.
3. **Status State Machine**:
   - Allowed Recruiter Transitions: `APPLIED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `SHORTLISTED` or `REJECTED` (or direct to `SHORTLISTED`/`REJECTED`).
   - Allowed Candidate Transitions: Candidate may only move to `WITHDRAWN` while the application is in `APPLIED` or `UNDER_REVIEW`.
   - Every status transition inserts an immutable row in `ApplicationStatusHistory`.
4. **Duplicate Prevention**: A unique compound index on `(jobId, candidateId)` prevents a candidate from applying multiple times to the same job (`409 Conflict`).
5. **Private Resume Storage**:
   - Resumes are validated for both `.pdf` extension and `application/pdf` MIME type with a 2MB ceiling.
   - Saved with non-colliding UUID filenames.
   - Files are stored outside public directories and served **only** through protected endpoint `GET /api/applications/:id/resume` to the applicant or the job-owner recruiter.

---

## ⏱️ 2-Minute Student Viva Demo Script

Use this step-by-step walkthrough to present the app during an examination:

1. **Step 1: Recruiter Posts a Job**
   - Go to `http://localhost:5173/login`.
   - Click the **"Recruiter 1"** quick button (`sarah@cloudnexus.io`). Click **Sign In**.
   - Observe the **Recruiter Dashboard** displaying key metric cards and the **Recharts Bar Chart** showing applicant pipeline distribution.
   - Click **"+ Post a Job"** or navigate to `/recruiter/jobs/new`.
   - Fill in:
     - Title: `Full Stack AI Engineer`
     - Type: `Full Time`, Mode: `Hybrid`, Location: `Bangalore`
     - Min Salary: `1200000`, Max Salary: `1800000`, Experience: `1`
     - Skills: `React, Node.js, Python, OpenAI`
     - Description: `Building agentic developer tools.`
   - Click **Publish Job Posting**. The job appears in the **My Jobs** table.
   - Click **Logout**.

2. **Step 2: Candidate Searches and Applies with Resume**
   - Click **Sign In**, click the **"Candidate 1"** button (`aarav@candidate.com`).
   - Click **Find Jobs** in the navbar.
   - Type `AI Engineer` into the keyword filter.
   - Click on the new job posting to open **Job Details**.
   - Click **Apply Now**. Check "Use profile default resume" (or upload a PDF) and add a short cover letter: *"Excited to build AI products!"*.
   - Click **Submit Application**. A success toast confirms submission and the button updates to *"Already Applied"*.
   - Navigate to **My Applications**. Notice the job is in **APPLIED** status (blue badge).
   - Click **Logout**.

3. **Step 3: Recruiter Reviews, Downloads Resume, and Shortlists**
   - Sign in as **Recruiter 1** (`sarah@cloudnexus.io`).
   - Navigate to **My Jobs** $\rightarrow$ Click **"Applicants"** on the `Full Stack AI Engineer` job.
   - Candidate `Aarav Sharma` appears in the roster.
   - Click **"Download PDF"** to verify the secure streaming file download.
   - Click **"Change Status"** $\rightarrow$ Select `SHORTLISTED` $\rightarrow$ Enter note: *"Outstanding portfolio. Selected for interview!"* $\rightarrow$ Click **Save Status Update**.
   - Click **Logout**.

4. **Step 4: Candidate Inspects Updated Status & Timeline**
   - Sign in as **Candidate 1** (`aarav@candidate.com`).
   - Navigate to **My Applications**.
   - Observe the badge is now **SHORTLISTED** (green badge) with the recruiter's feedback note displayed.
   - Click **"Status Timeline"** to show the examiner the complete chronological audit trail from `APPLIED` to `SHORTLISTED`.

---

## 📋 Viva Presentation Checklist

- [x] Monorepo clean structure with plain JavaScript (`/server` and `/client`).
- [x] Zero-setup portable SQLite database via Prisma ORM.
- [x] Full RBAC implementation (`CANDIDATE` and `RECRUITER`).
- [x] 44 automated backend Jest + Supertest tests passing.
- [x] Strict Multer PDF file validation and protected download streaming.
- [x] Complete public search, multi-facet filtering, sorting, and pagination.
- [x] Interactive status state machine with immutable audit logging.
- [x] Interactive Recharts analytics visualization on recruiter dashboard.
- [x] 3 Mermaid architecture and ER diagrams in `/docs`.
- [x] 1-Click demo credentials for fast viva execution.
