# 🎓 HireLoop Full-Stack Project & Viva Study Guide
**Tech Stack:** React (Vite) + Java Spring Boot 3 + PostgreSQL / H2 Database

---

## 1. High-Level Architecture (The Big Picture)

```
┌────────────────────────────────────────────────────────┐
│               REACT FRONTEND (Port 5173)               │
│  - React 19 + Vite + Tailwind CSS                      │
│  - Axios for HTTP calls to http://localhost:5000/api   │
│  - React Router for page navigation                    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON over HTTP)
┌───────────────────────────▼────────────────────────────┐
│            JAVA SPRING BOOT BACKEND (Port 5000)        │
│                                                        │
│  [1] Controller Layer (@RestController)                │
│      - Receives HTTP requests (GET, POST, PUT, DELETE) │
│      - Validates inputs, sends back JSON responses     │
│                                                        │
│  [2] Service Layer (@Service)                          │
│      - Business logic (e.g., job validation, status)   │
│                                                        │
│  [3] Repository Layer (@Repository)                    │
│      - Spring Data JPA (extends JpaRepository)         │
│      - Auto-generates SQL queries without writing SQL! │
│                                                        │
│  [4] Entity / Model Layer (@Entity)                    │
│      - Java classes mapped to Database tables          │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC Connection
┌───────────────────────────▼────────────────────────────┐
│                    DATABASE LAYER                      │
│  - H2 Database (In-Memory for zero-setup demo)         │
│  - PostgreSQL ready (via application.properties)       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Java Spring Boot: Key Concepts & Explanations

### A. The 4 Layers (Memorize this order for Viva)
1. **Model / Entity (`User.java`, `Job.java`, `Application.java`)**:
   - Represents the tables in the database.
   - Annotations:
     - `@Entity`: Tells Hibernate this Java class is a database table.
     - `@Id` & `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Marks the primary key (auto-incrementing ID).
     - `@Column`: Specifies table column constraints (e.g. `nullable = false`).

2. **Repository (`JobRepository.java`, etc.)**:
   - Extends `JpaRepository<Job, Long>`.
   - Spring Boot automatically creates SQL queries based on method names:
     - `findByStatus("OPEN")` -> `SELECT * FROM jobs WHERE status = 'OPEN'`
     - `findByTitleContainingIgnoreCase("Java")` -> `SELECT * FROM jobs WHERE LOWER(title) LIKE '%java%'`

3. **Service (`JobService.java`, `ApplicationService.java`)**:
   - Marked with `@Service`.
   - Handles the business rules (e.g. verifying that a user hasn't applied twice before saving).

4. **Controller (`JobController.java`, `AuthController.java`, etc.)**:
   - Marked with `@RestController` and `@RequestMapping("/api/...")`.
   - Maps HTTP methods to Java functions:
     - `@GetMapping`: Read data.
     - `@PostMapping`: Create new record.
     - `@PutMapping`: Update existing record.
     - `@PatchMapping`: Partially update a field (e.g., closing a job).
     - `@DeleteMapping`: Remove a record.

### B. Dependency Injection (`@Autowired`)
- Instead of writing `JobRepository repo = new JobRepository()`, Spring automatically instantiates and injects it using `@Autowired` (Inversion of Control).

### C. CORS (`CorsConfig.java`)
- Browsers block frontend requests from port 5173 to backend port 5000 for security.
- `CorsConfig.java` enables Cross-Origin Resource Sharing so the React app can communicate with the backend.

### D. Temporary Dataset Seeder (`DataSeeder.java`)
- Implements `CommandLineRunner`.
- Runs once on application startup.
- Pre-loads 5 users, 8 jobs, and 4 applications into the database so the demo is ready immediately.

---

## 3. React Frontend: Key Concepts & Explanations

1. **Vite (`npm run dev`)**:
   - The modern build tool that bundles and serves the React application on port 5173.

2. **State & Effects (`useState` & `useEffect`)**:
   - `useState`: Holds component data (e.g. list of jobs, form inputs).
   - `useEffect`: Triggers when the page loads to fetch data from the Spring Boot API.

3. **Centralized API Client (`client/src/api/client.js`)**:
   - Uses `axios` with `baseURL: 'http://localhost:5000/api'`.
   - Automatically attaches the authentication token to every outgoing request.

4. **Global Authentication (`AuthContext.jsx`)**:
   - Uses React Context API (`createContext`, `useContext`).
   - Stores current logged-in user in `localStorage` so the session persists on page refresh.

---

## 4. Common Viva Questions & Quick Answers

| Question | Short, Perfect Answer |
|---|---|
| **What is Spring Boot?** | An open-source Java framework used to build production-ready, standalone REST APIs with minimal boilerplate configuration. |
| **Why use JPA / Hibernate?** | JPA is an Object-Relational Mapping (ORM) standard that maps Java objects directly to database tables, eliminating the need to write raw SQL strings. |
| **How does Frontend talk to Backend?** | The React client sends HTTP requests using Axios to the Spring Boot REST endpoints, and Spring Boot responds with JSON data. |
| **What is the difference between `@RestController` and `@Controller`?** | `@RestController` combines `@Controller` and `@ResponseBody`. It automatically serializes return values directly into JSON. |
| **Which database did you use?** | The project is configured for PostgreSQL, and includes an embedded H2 in-memory database with a web console at `/h2-console` for zero-setup demonstration. |
| **How did you prevent duplicate applications?** | At database level using a unique constraint `(job_id, candidate_email)`, and at service level checking `applicationRepository.existsByJobIdAndCandidateEmail()`. |

---

## 5. Quick Run Cheat Sheet

### Terminal 1: Backend
```powershell
cd "c:\Users\vinay\FSWD PROJECT (VINAYAK)\server-springboot"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
```

### Terminal 2: Frontend
```powershell
cd "c:\Users\vinay\FSWD PROJECT (VINAYAK)\client"
npm run dev
```

### URLs
- **App:** http://localhost:5173
- **API Test:** http://localhost:5000/api/jobs
- **Database Console:** http://localhost:5000/h2-console (JDBC URL: `jdbc:h2:mem:hireloopdb`, Username: `sa`, Password: blank)
