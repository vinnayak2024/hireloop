# 🔄 HireLoop - Full-Stack Job Portal Web Application

HireLoop is a clean, modern full-stack job portal web application built with **React (Vite)** on the frontend and **Java Spring Boot 3** on the backend, using **Spring Data JPA / Hibernate** with **PostgreSQL / H2** database.

Designed to be beginner-friendly, well-commented, and easy to explain for viva presentations and project evaluations.

---

## 🌟 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router v7, React Hot Toast
- **Backend:** Java 21+, Spring Boot 3.4, Spring Data JPA / Hibernate, REST API
- **Database:** H2 In-Memory (Zero-setup instant demo) / PostgreSQL ready
- **Tooling:** Maven Wrapper (`mvnw` / `mvnw.cmd` included — no need to install Maven globally)

---

## 🚀 How to Clone & Run (For You & Teammates)

Anyone can clone and run this project in 2 minutes:

### 1. Clone the Repository
```bash
git clone https://github.com/vinnayak2024/hireloop.git
cd hireloop
```

---

### 2. Run the Spring Boot Backend (Port 5000)

> 💡 **Zero Setup:** The project includes the Maven Wrapper (`mvnw`). You do NOT need to install Maven globally!

**On Windows (PowerShell or CMD):**
```powershell
cd server-springboot
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
```

**On macOS / Linux:**
```bash
cd server-springboot
chmod +x mvnw
./mvnw spring-boot:run "-Dspring-boot.run.profiles=h2"
```

When started, it auto-populates demo data and shows:
```
🌱 Seeding demo data for HireLoop viva...
   ✔ 5 users seeded
   ✔ 8 jobs seeded (7 OPEN, 1 CLOSED)
   ✔ 4 applications seeded
🚀 HireLoop Spring Boot REST API is running on http://localhost:5000
```

---

### 3. Run the React Frontend (Port 5173)

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

Visit **http://localhost:5173** in your browser!

---

## 🔑 Demo Logins (Pre-loaded Accounts)

| Role | Email | Password | Features to Test |
|---|---|---|---|
| **Recruiter** | `sarah@cloudnexus.io` | `pass123` | Post jobs, review applicants, change status, close jobs, dashboard charts |
| **Candidate** | `aarav@candidate.com` | `pass123` | Search jobs, 1-click apply, track application status timeline |

---

## 🗄️ Database Console (H2 Web UI)

- **URL:** [http://localhost:5000/h2-console](http://localhost:5000/h2-console)
- **JDBC URL:** `jdbc:h2:mem:hireloopdb`
- **User Name:** `sa`
- **Password:** *(leave blank)*

---

## 📁 Repository Structure

```
hireloop/
├── client/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── api/client.js       # Central Axios instance (points to http://localhost:5000/api)
│   │   ├── context/AuthContext # User authentication state
│   │   ├── pages/              # Home, JobsList, JobDetails, Login, Register
│   │   │   ├── candidate/      # Candidate dashboard, applications list, profile
│   │   │   └── recruiter/      # Recruiter dashboard, applicants table, job form
│   │   └── components/         # Navbar, Footer, StatusBadge, TimelineModal
│   └── package.json
│
├── server-springboot/          # Java Spring Boot 3 REST API backend
│   ├── src/main/java/com/hireloop/backend/
│   │   ├── model/              # JPA Entities (User, Job, Application)
│   │   ├── repository/         # Spring Data JPA Repositories (Auto SQL)
│   │   ├── service/            # Business logic & validation layer
│   │   ├── controller/         # REST Controllers (@RestController)
│   │   └── config/             # CorsConfig, DataSeeder (seeds demo users/jobs)
│   ├── src/main/resources/
│   │   ├── application.properties    # PostgreSQL configuration
│   │   └── application-h2.properties # H2 in-memory configuration
│   ├── pom.xml                 # Maven dependencies
│   ├── mvnw & mvnw.cmd         # Maven wrapper scripts
│   └── .mvn/wrapper/           # Wrapper binaries
│
├── COMPLETE_PROJECT_CODE_AND_EXPLANATIONS.md  # All code combined with explanations
├── VIVA_AND_PROJECT_GUIDE.md                  # Viva study guide & architecture breakdown
└── README.md
```

---

## 📚 Study Guides Included

- **[VIVA_AND_PROJECT_GUIDE.md](./VIVA_AND_PROJECT_GUIDE.md)**: 4-layer architecture diagram, Spring Boot annotations explained, and common viva questions with answers.
- **[COMPLETE_PROJECT_CODE_AND_EXPLANATIONS.md](./COMPLETE_PROJECT_CODE_AND_EXPLANATIONS.md)**: All backend Java and React code combined with line-by-line comments for learning.
