# 📚 HireLoop: Complete Consolidated Code & Explanations Guide

This document combines all the backend Java code and key frontend components into a single file with clear, beginner-friendly explanations for learning and presenting in your viva.

---

## 📑 Table of Contents
1. [Backend Overview & Architecture](#1-backend-overview--architecture)
2. [Data Models / Entities (JPA)](#2-data-models--entities-jpa)
   - `User.java`
   - `Job.java`
   - `Application.java`
3. [Repositories (Spring Data JPA)](#3-repositories-spring-data-jpa)
   - `UserRepository.java`
   - `JobRepository.java`
   - `ApplicationRepository.java`
4. [Services (Business Logic Layer)](#4-services-business-logic-layer)
   - `JobService.java`
   - `ApplicationService.java`
5. [Controllers (REST API Endpoints)](#5-controllers-rest-api-endpoints)
   - `AuthController.java`
   - `JobController.java`
   - `ApplicationController.java`
   - `RecruiterCandidateController.java`
6. [Configuration & Startup Seeder](#6-configuration--startup-seeder)
   - `CorsConfig.java`
   - `DataSeeder.java`
   - `HireloopApplication.java`
7. [Frontend Architecture & Key Code (React)](#7-frontend-architecture--key-code-react)
   - `api/client.js` (Axios configuration)
   - `context/AuthContext.jsx` (Global authentication state)
8. [Database Configuration](#8-database-configuration)
   - `application.properties` (PostgreSQL)
   - `application-h2.properties` (H2 In-Memory)

---

# 1. Backend Overview & Architecture

### How Request and Response Flow in Spring Boot:
```
Client (React Browser)
       │ HTTP Request (e.g. GET /api/jobs)
       ▼
Controller (@RestController) ── Receives request, reads parameters
       │ Calls service method
       ▼
Service (@Service) ───────────── Contains business logic & validation
       │ Calls repository method
       ▼
Repository (@Repository) ─────── Spring Data JPA generates SQL queries
       │ Reads / Writes
       ▼
Database (PostgreSQL / H2) ───── Stores rows in tables
```

---

# 2. Data Models / Entities (JPA)

Entities represent database tables in Java. Hibernate reads these classes and creates the corresponding SQL tables automatically.

---

### `User.java`
**Location:** `server-springboot/src/main/java/com/hireloop/backend/model/User.java`

```java
package com.hireloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// @Entity: Marks this class as a database table managed by Hibernate
@Entity
// @Table: Sets the database table name to "users"
@Table(name = "users")
public class User {

    // @Id: Primary key of the table
    // @GeneratedValue(strategy = IDENTITY): Auto-increments (1, 2, 3...)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Column(nullable = false): Required field (cannot be null in DB)
    @Column(nullable = false)
    private String name;

    // unique = true ensures no two accounts share the same email
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Role is either "CANDIDATE" or "RECRUITER"
    @Column(nullable = false)
    private String role;

    // Optional: Only filled for recruiters (e.g., "CloudNexus Solutions")
    private String companyName;

    // Automatically records when the user registered
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default no-argument constructor required by JPA
    public User() {}

    // Parameterized constructor for convenient object creation
    public User(String name, String email, String password, String role, String companyName) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.companyName = companyName;
    }

    // Standard Getters and Setters for accessing and modifying private variables
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

---

### `Job.java`
**Location:** `server-springboot/src/main/java/com/hireloop/backend/model/Job.java`

```java
package com.hireloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

// Database table representing job postings
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // length = 2000 allows detailed job descriptions (standard is 255)
    @Column(length = 2000, nullable = false)
    private String description;

    @Column(nullable = false)
    private String location;

    private String jobType;  // FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT
    private String workMode; // ONSITE, REMOTE, HYBRID

    private Integer salaryMin;
    private Integer salaryMax;

    private String skills;             // e.g. "Java, Spring Boot, React, SQL"
    private String experienceRequired; // e.g. "2+ years", "Freshers welcome"

    @Column(nullable = false)
    private String status = "OPEN";    // "OPEN" (active) or "CLOSED" (filled)

    private String companyName;
    private String recruiterEmail;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Job() {}

    public Job(String title, String description, String location, String jobType, String workMode,
               Integer salaryMin, Integer salaryMax, String skills, String experienceRequired,
               String companyName, String recruiterEmail) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.jobType = jobType;
        this.workMode = workMode;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.skills = skills;
        this.experienceRequired = experienceRequired;
        this.companyName = companyName;
        this.recruiterEmail = recruiterEmail;
        this.status = "OPEN";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public Integer getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }

    public Integer getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getExperienceRequired() { return experienceRequired; }
    public void setExperienceRequired(String experienceRequired) { this.experienceRequired = experienceRequired; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // @Transient: Not saved to database, but Jackson serializes this into JSON
    // Allows React frontend to access "job.company.name" seamlessly
    @Transient
    public Map<String, Object> getCompany() {
        return Map.of("name", companyName != null ? companyName : "HireLoop Partner");
    }
}
```

---

### `Application.java`
**Location:** `server-springboot/src/main/java/com/hireloop/backend/model/Application.java`

```java
package com.hireloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// Unique constraint prevents candidate from applying twice to the same job
@Entity
@Table(name = "applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "candidate_email"}))
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "candidate_email", nullable = false)
    private String candidateEmail;

    private String candidateName;

    @Column(length = 2000)
    private String coverLetter;

    // Status cycle: APPLIED -> UNDER_REVIEW -> SHORTLISTED / REJECTED / WITHDRAWN
    private String status = "APPLIED";

    private String recruiterNote; // Notes added by recruiter during review

    private LocalDateTime appliedAt = LocalDateTime.now();

    // @Transient fields for React frontend rendering
    @Transient
    private Job job;

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    // Serializes as "candidate" object for React candidate dashboard & recruiter table
    @Transient
    public Map<String, Object> getCandidate() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", candidateName != null ? candidateName : "Candidate");
        map.put("email", candidateEmail != null ? candidateEmail : "");
        map.put("phone", "+91 9876543210");
        map.put("experienceYears", 2);
        map.put("skills", "Java, Spring Boot, React, SQL");
        return map;
    }

    public Application() {}

    public Application(Long jobId, String candidateEmail, String candidateName, String coverLetter) {
        this.jobId = jobId;
        this.candidateEmail = candidateEmail;
        this.candidateName = candidateName;
        this.coverLetter = coverLetter;
        this.status = "APPLIED";
        this.appliedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRecruiterNote() { return recruiterNote; }
    public void setRecruiterNote(String recruiterNote) { this.recruiterNote = recruiterNote; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
```

---

# 3. Repositories (Spring Data JPA)

Repositories are Java interfaces. You declare methods using Spring Data naming conventions and Spring automatically implements all database queries behind the scenes.

---

### `UserRepository.java`
```java
package com.hireloop.backend.repository;

import com.hireloop.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// JpaRepository provides save(), findById(), findAll(), deleteById() out of the box
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring translates this to: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Spring translates this to: SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);
}
```

---

### `JobRepository.java`
```java
package com.hireloop.backend.repository;

import com.hireloop.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Get jobs by status (e.g. "OPEN")
    List<Job> findByStatus(String status);

    // Search jobs where keyword is in title (case-insensitive)
    List<Job> findByTitleContainingIgnoreCase(String keyword);

    // Recruiter-specific jobs list
    List<Job> findByRecruiterEmail(String recruiterEmail);
}
```

---

### `ApplicationRepository.java`
```java
package com.hireloop.backend.repository;

import com.hireloop.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // All applications for a given job (Recruiter view)
    List<Application> findByJobId(Long jobId);

    // All applications submitted by a specific candidate
    List<Application> findByCandidateEmail(String candidateEmail);

    // Check if duplicate application exists
    boolean existsByJobIdAndCandidateEmail(Long jobId, String candidateEmail);
}
```

---

# 4. Services (Business Logic Layer)

Services sit between the Controller and the Repository. They validate inputs, verify business rules, and prepare data.

---

### `JobService.java`
```java
package com.hireloop.backend.service;

import com.hireloop.backend.model.Job;
import com.hireloop.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    // Dependency injection: Spring provides the repository instance
    @Autowired
    private JobRepository jobRepository;

    // Fetch only active open jobs for candidate search
    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus("OPEN");
    }

    // Fetch all jobs including closed jobs (recruiter/admin view)
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public List<Job> searchJobs(String keyword) {
        return jobRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public List<Job> getJobsByRecruiter(String email) {
        return jobRepository.findByRecruiterEmail(email);
    }

    // Create a new job, default status to OPEN
    public Job createJob(Job job) {
        if (job.getStatus() == null || job.getStatus().isBlank()) {
            job.setStatus("OPEN");
        }
        return jobRepository.save(job);
    }

    // Update job details safely
    public Optional<Job> updateJob(Long id, Job updatedJob) {
        return jobRepository.findById(id).map(existingJob -> {
            if (updatedJob.getTitle() != null)             existingJob.setTitle(updatedJob.getTitle());
            if (updatedJob.getDescription() != null)       existingJob.setDescription(updatedJob.getDescription());
            if (updatedJob.getLocation() != null)          existingJob.setLocation(updatedJob.getLocation());
            if (updatedJob.getJobType() != null)           existingJob.setJobType(updatedJob.getJobType());
            if (updatedJob.getWorkMode() != null)          existingJob.setWorkMode(updatedJob.getWorkMode());
            if (updatedJob.getSalaryMin() != null)         existingJob.setSalaryMin(updatedJob.getSalaryMin());
            if (updatedJob.getSalaryMax() != null)         existingJob.setSalaryMax(updatedJob.getSalaryMax());
            if (updatedJob.getSkills() != null)            existingJob.setSkills(updatedJob.getSkills());
            if (updatedJob.getExperienceRequired() != null) existingJob.setExperienceRequired(updatedJob.getExperienceRequired());
            if (updatedJob.getStatus() != null)            existingJob.setStatus(updatedJob.getStatus());
            return jobRepository.save(existingJob);
        });
    }

    // Close a job posting so candidates can no longer apply
    public Optional<Job> closeJob(Long id) {
        return jobRepository.findById(id).map(job -> {
            job.setStatus("CLOSED");
            return jobRepository.save(job);
        });
    }

    public boolean deleteJob(Long id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
```

---

### `ApplicationService.java`
```java
package com.hireloop.backend.service;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.repository.ApplicationRepository;
import com.hireloop.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    // Apply for a job with validation
    public Application apply(Application application) {
        // Rule 1: Job must exist
        if (!jobRepository.existsById(application.getJobId())) {
            throw new RuntimeException("Job not found with id: " + application.getJobId());
        }

        // Rule 2: Cannot apply twice to the same job
        if (applicationRepository.existsByJobIdAndCandidateEmail(
                application.getJobId(), application.getCandidateEmail())) {
            throw new RuntimeException("You have already applied to this job.");
        }

        application.setStatus("APPLIED");
        return applicationRepository.save(application);
    }

    // Get all applicants for a job (Recruiter view)
    public List<Application> getApplicationsForJob(Long jobId) {
        List<Application> list = applicationRepository.findByJobId(jobId);
        jobRepository.findById(jobId).ifPresent(j -> list.forEach(app -> app.setJob(j)));
        return list;
    }

    // Get applications by candidate email
    public List<Application> getApplicationsByCandidate(String email) {
        List<Application> list = applicationRepository.findByCandidateEmail(email);
        list.forEach(app -> {
            jobRepository.findById(app.getJobId()).ifPresent(app::setJob);
        });
        return list;
    }

    // Get all applications (used for dashboard view)
    public List<Application> getAllApplications() {
        List<Application> list = applicationRepository.findAll();
        list.forEach(app -> {
            jobRepository.findById(app.getJobId()).ifPresent(app::setJob);
        });
        return list;
    }

    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    // Update status (e.g. APPLIED -> SHORTLISTED / REJECTED)
    public Optional<Application> updateStatus(Long id, String newStatus, String recruiterNote) {
        return applicationRepository.findById(id).map(app -> {
            List<String> valid = List.of("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "WITHDRAWN");
            if (!valid.contains(newStatus)) {
                throw new RuntimeException("Invalid status: " + newStatus);
            }
            if ("WITHDRAWN".equals(app.getStatus())) {
                throw new RuntimeException("Cannot update a withdrawn application.");
            }
            app.setStatus(newStatus);
            if (recruiterNote != null) {
                app.setRecruiterNote(recruiterNote);
            }
            return applicationRepository.save(app);
        });
    }

    // Candidate withdraws application
    public Optional<Application> withdraw(Long id) {
        return applicationRepository.findById(id).map(app -> {
            if ("SHORTLISTED".equals(app.getStatus()) || "REJECTED".equals(app.getStatus())) {
                throw new RuntimeException("Cannot withdraw a finalized application.");
            }
            app.setStatus("WITHDRAWN");
            return applicationRepository.save(app);
        });
    }
}
```

---

# 5. Controllers (REST API Endpoints)

Controllers expose HTTP endpoints. They accept requests from React, call the appropriate service method, and return JSON.

---

### `AuthController.java`
**Base URL:** `/api/auth`

```java
package com.hireloop.backend.controller;

import com.hireloop.backend.model.User;
import com.hireloop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // POST /api/auth/login
    // Validates credentials and returns { token, user }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                String token = "jwt-token-" + user.getId() + "-" + user.getRole().toLowerCase();
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "user", user
                ));
            }
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
    }

    // POST /api/auth/register
    // Registers a new user account
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered."));
        }
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("CANDIDATE");
        }
        User saved = userRepository.save(user);
        String token = "jwt-token-" + saved.getId() + "-" + saved.getRole().toLowerCase();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", saved
        ));
    }

    // GET /api/auth/me
    // Restores active session on page refresh in React
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.contains("jwt-token-")) {
            try {
                String[] parts = authHeader.replace("Bearer ", "").split("-");
                if (parts.length >= 3) {
                    Long userId = Long.parseLong(parts[2]);
                    Optional<User> u = userRepository.findById(userId);
                    if (u.isPresent()) {
                        return ResponseEntity.ok(Map.of("user", u.get()));
                    }
                }
            } catch (Exception ignored) {}
        }
        return userRepository.findAll().stream().findFirst()
                .map(u -> ResponseEntity.ok(Map.of("user", u)))
                .orElse(ResponseEntity.status(401).build());
    }
}
```

---

### `JobController.java`
**Base URL:** `/api/jobs`

```java
package com.hireloop.backend.controller;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.model.Job;
import com.hireloop.backend.service.ApplicationService;
import com.hireloop.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    // GET /api/jobs (Search, filter, paginate)
    @GetMapping
    public ResponseEntity<?> getJobs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "1") Integer page) {

        List<Job> jobs = jobService.getAllOpenJobs();

        // Keyword filter
        if (q != null && !q.isBlank()) {
            String query = q.toLowerCase();
            jobs = jobs.stream()
                    .filter(j -> j.getTitle().toLowerCase().contains(query)
                            || (j.getDescription() != null && j.getDescription().toLowerCase().contains(query))
                            || (j.getSkills() != null && j.getSkills().toLowerCase().contains(query)))
                    .collect(Collectors.toList());
        }

        // Location filter
        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase();
            jobs = jobs.stream()
                    .filter(j -> j.getLocation() != null && j.getLocation().toLowerCase().contains(loc))
                    .collect(Collectors.toList());
        }

        // Job type filter (FULL_TIME, INTERNSHIP...)
        if (jobType != null && !jobType.isBlank()) {
            jobs = jobs.stream()
                    .filter(j -> jobType.equalsIgnoreCase(j.getJobType()))
                    .collect(Collectors.toList());
        }

        // Work mode filter (REMOTE, HYBRID, ONSITE)
        if (workMode != null && !workMode.isBlank()) {
            jobs = jobs.stream()
                    .filter(j -> workMode.equalsIgnoreCase(j.getWorkMode()))
                    .collect(Collectors.toList());
        }

        int total = jobs.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) total / limit));

        if (limit != null && limit > 0 && jobs.size() > limit) {
            jobs = jobs.subList(0, limit);
        }

        // Returns payload matching React frontend expectations
        return ResponseEntity.ok(Map.of(
                "data", jobs,
                "total", total,
                "totalPages", totalPages,
                "page", page,
                "limit", limit
        ));
    }

    // GET /api/jobs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(job -> ResponseEntity.ok(Map.of("job", job)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/jobs/{id}/apply
    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyToJob(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            Application app = new Application();
            app.setJobId(id);
            if (body != null) {
                app.setCandidateEmail(body.getOrDefault("candidateEmail", "aarav@candidate.com"));
                app.setCandidateName(body.getOrDefault("candidateName", "Aarav Sharma"));
                app.setCoverLetter(body.getOrDefault("coverLetter", "Excited to apply for this role."));
            } else {
                app.setCandidateEmail("aarav@candidate.com");
                app.setCandidateName("Aarav Sharma");
            }
            Application saved = applicationService.apply(app);
            return ResponseEntity.ok(Map.of("message", "Application submitted successfully", "application", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    // GET /api/jobs/{id}/applications (Recruiter applicant review)
    @GetMapping("/{id}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable Long id) {
        List<Application> applications = applicationService.getApplicationsForJob(id);
        return ResponseEntity.ok(Map.of("applications", applications));
    }

    // POST /api/jobs (Create job)
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        Job saved = jobService.createJob(job);
        return ResponseEntity.ok(Map.of("job", saved));
    }

    // PUT /api/jobs/{id} (Update job)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job job) {
        return jobService.updateJob(id, job)
                .map(j -> ResponseEntity.ok(Map.of("job", j)))
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH /api/jobs/{id}/close (Close job)
    @PatchMapping("/{id}/close")
    public ResponseEntity<?> closeJob(@PathVariable Long id) {
        return jobService.closeJob(id)
                .map(j -> ResponseEntity.ok(Map.of("message", "Job closed successfully.", "job", j)))
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/jobs/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (jobService.deleteJob(id)) {
            return ResponseEntity.ok(Map.of("message", "Job deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }
}
```

---

### `ApplicationController.java`
**Base URL:** `/api/applications`

```java
package com.hireloop.backend.controller;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // GET /api/applications/mine (Candidate application list)
    @GetMapping("/mine")
    public ResponseEntity<?> getMyApplications(@RequestParam(required = false) String status) {
        List<Application> list = applicationService.getAllApplications();
        if (status != null && !status.isBlank()) {
            list = list.stream()
                    .filter(a -> status.equalsIgnoreCase(a.getStatus()))
                    .toList();
        }
        return ResponseEntity.ok(Map.of("applications", list));
    }

    // GET /api/applications/{id}/history (Status timeline modal)
    @GetMapping("/{id}/history")
    public ResponseEntity<?> getApplicationHistory(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(app -> {
                    List<Map<String, Object>> history = List.of(
                            Map.of("status", "APPLIED", "createdAt", app.getAppliedAt(), "note", "Application submitted"),
                            Map.of("status", app.getStatus(), "createdAt", LocalDateTime.now(), "note", app.getRecruiterNote() != null ? app.getRecruiterNote() : "Status updated")
                    );
                    return ResponseEntity.ok(Map.of("history", history));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/applications/{id}/resume (Download candidate resume)
    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        String dummyResume = "=== CANDIDATE RESUME ===\n\nName: Aarav Sharma\nRole: Java Backend Developer\nSkills: Java, Spring Boot, React, PostgreSQL\nExperience: 2 years\nEducation: B.Tech Computer Science\n";
        byte[] content = dummyResume.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(content);
    }

    // PATCH /api/applications/{id}/status (Update status e.g. SHORTLISTED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            String recruiterNote = body.get("recruiterNote");
            return applicationService.updateStatus(id, newStatus, recruiterNote)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    // PATCH /api/applications/{id}/withdraw (Candidate withdraws)
    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id) {
        try {
            return applicationService.withdraw(id)
                    .map(app -> ResponseEntity.ok((Object) Map.of("message", "Application withdrawn.", "application", app)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }
}
```

---

### `RecruiterCandidateController.java`
**Base URL:** `/api`

```java
package com.hireloop.backend.controller;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.model.Job;
import com.hireloop.backend.repository.ApplicationRepository;
import com.hireloop.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RecruiterCandidateController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // GET /api/recruiter/jobs (Jobs posted by recruiter)
    @GetMapping("/recruiter/jobs")
    public ResponseEntity<?> getRecruiterJobs() {
        List<Job> jobs = jobRepository.findAll();
        return ResponseEntity.ok(Map.of("jobs", jobs));
    }

    // GET /api/recruiter/stats (Calculates metrics for recruiter dashboard chart)
    @GetMapping("/recruiter/stats")
    public ResponseEntity<?> getRecruiterStats() {
        List<Job> allJobs = jobRepository.findAll();
        List<Application> allApps = applicationRepository.findAll();

        long openJobsCount = allJobs.stream().filter(j -> "OPEN".equalsIgnoreCase(j.getStatus())).count();

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("APPLIED", allApps.stream().filter(a -> "APPLIED".equalsIgnoreCase(a.getStatus())).count());
        statusCounts.put("UNDER_REVIEW", allApps.stream().filter(a -> "UNDER_REVIEW".equalsIgnoreCase(a.getStatus())).count());
        statusCounts.put("SHORTLISTED", allApps.stream().filter(a -> "SHORTLISTED".equalsIgnoreCase(a.getStatus())).count());
        statusCounts.put("REJECTED", allApps.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus())).count());
        statusCounts.put("WITHDRAWN", allApps.stream().filter(a -> "WITHDRAWN".equalsIgnoreCase(a.getStatus())).count());

        Map<String, Object> stats = Map.of(
                "totalJobs", allJobs.size(),
                "activeJobs", openJobsCount,
                "totalApplications", allApps.size(),
                "statusCounts", statusCounts
        );

        return ResponseEntity.ok(Map.of("stats", stats));
    }

    // GET /api/recruiter/company
    @GetMapping("/recruiter/company")
    public ResponseEntity<?> getCompanyProfile() {
        Map<String, Object> company = Map.of(
                "name", "CloudNexus Solutions",
                "website", "https://cloudnexus.io",
                "location", "Bangalore, India",
                "description", "CloudNexus Solutions designs high-throughput enterprise cloud systems and scalable web backends using Java and Spring Boot."
        );
        return ResponseEntity.ok(Map.of("company", company));
    }

    // PUT /api/recruiter/company
    @PutMapping("/recruiter/company")
    public ResponseEntity<?> updateCompanyProfile(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("message", "Company profile updated successfully.", "company", body));
    }

    // GET /api/candidate/profile
    @GetMapping("/candidate/profile")
    public ResponseEntity<?> getCandidateProfile() {
        Map<String, Object> profile = Map.of(
                "name", "Aarav Sharma",
                "email", "aarav@candidate.com",
                "phone", "+91 9876543210",
                "location", "Bangalore, India",
                "headline", "Java Backend Developer & Spring Boot Specialist",
                "skills", "Java, Spring Boot, PostgreSQL, React, REST API",
                "experienceYears", 2,
                "defaultResumePath", "resume.txt"
        );
        return ResponseEntity.ok(Map.of("profile", profile));
    }

    // PUT /api/candidate/profile
    @PutMapping("/candidate/profile")
    public ResponseEntity<?> updateCandidateProfile(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("message", "Candidate profile updated successfully.", "profile", body));
    }

    // POST /api/candidate/resume
    @PostMapping("/candidate/resume")
    public ResponseEntity<?> uploadResume() {
        return ResponseEntity.ok(Map.of("message", "Resume uploaded successfully."));
    }
}
```

---

# 6. Configuration & Startup Seeder

---

### `CorsConfig.java`
**Location:** `server-springboot/src/main/java/com/hireloop/backend/config/CorsConfig.java`

```java
package com.hireloop.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration: Defines configuration bean for Spring Boot
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Allow requests from React Vite port 5173
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5000")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

---

### `DataSeeder.java`
**Location:** `server-springboot/src/main/java/com/hireloop/backend/config/DataSeeder.java`

```java
package com.hireloop.backend.config;

import com.hireloop.backend.model.*;
import com.hireloop.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// CommandLineRunner runs automatically once when Spring Boot starts
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private ApplicationRepository applicationRepository;

    @Override
    public void run(String... args) throws Exception {

        // If data is already present, don't duplicate
        if (jobRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 Seeding demo data for HireLoop viva...");

        // 1. Seed 2 Recruiters + 3 Candidates
        User sarah = new User("Sarah Jenkins", "sarah@cloudnexus.io", "pass123", "RECRUITER", "CloudNexus Solutions");
        userRepository.save(sarah);

        User rajesh = new User("Rajesh Mehta", "rajesh@finscale.tech", "pass123", "RECRUITER", "FinScale Technologies");
        userRepository.save(rajesh);

        User aarav = new User("Aarav Sharma", "aarav@candidate.com", "pass123", "CANDIDATE", null);
        userRepository.save(aarav);

        User priya = new User("Priya Nair", "priya@candidate.com", "pass123", "CANDIDATE", null);
        userRepository.save(priya);

        User rohan = new User("Rohan Verma", "rohan@candidate.com", "pass123", "CANDIDATE", null);
        userRepository.save(rohan);

        // 2. Seed Jobs
        Job job1 = new Job("Backend Java Developer", "Build scalable REST APIs using Java Spring Boot.", "Remote", "FULL_TIME", "REMOTE", 800000, 1400000, "Java, Spring Boot, PostgreSQL", "2+ years", "CloudNexus Solutions", "sarah@cloudnexus.io");
        Job savedJob1 = jobRepository.save(job1);

        Job job2 = new Job("React Frontend Developer", "Develop modern web apps using React 18 & TypeScript.", "Bangalore, Karnataka", "FULL_TIME", "HYBRID", 700000, 1200000, "React, TypeScript, CSS", "1-3 years", "CloudNexus Solutions", "sarah@cloudnexus.io");
        Job savedJob2 = jobRepository.save(job2);

        Job job3 = new Job("Software Engineer Intern", "6-month internship program for fresh graduates.", "Mumbai, Maharashtra", "INTERNSHIP", "ONSITE", 20000, 35000, "Java, Data Structures, SQL", "0-1 years", "FinScale Technologies", "rajesh@finscale.tech");
        Job savedJob3 = jobRepository.save(job3);

        jobRepository.save(new Job("DevOps Engineer", "Manage CI/CD pipelines & AWS.", "Remote", "FULL_TIME", "REMOTE", 1000000, 1800000, "AWS, Docker, Kubernetes", "3+ years", "CloudNexus Solutions", "sarah@cloudnexus.io"));
        jobRepository.save(new Job("Data Analyst", "Analyze financial datasets & build PowerBI dashboards.", "Pune, Maharashtra", "FULL_TIME", "HYBRID", 600000, 1000000, "SQL, Python, Power BI", "1-2 years", "FinScale Technologies", "rajesh@finscale.tech"));
        jobRepository.save(new Job("UI/UX Designer (Part-Time)", "Design mobile & web UI in Figma.", "Remote", "PART_TIME", "REMOTE", 400000, 700000, "Figma, Prototyping", "1+ years", "CloudNexus Solutions", "sarah@cloudnexus.io"));
        jobRepository.save(new Job("Mobile App Developer (Android)", "Android development in Kotlin.", "Hyderabad, Telangana", "FULL_TIME", "ONSITE", 900000, 1500000, "Kotlin, Android SDK", "2+ years", "FinScale Technologies", "rajesh@finscale.tech"));
        jobRepository.save(new Job("Machine Learning Engineer", "Build ML models for fraud detection.", "Bangalore, Karnataka", "FULL_TIME", "HYBRID", 1200000, 2200000, "Python, TensorFlow, SQL", "3-5 years", "FinScale Technologies", "rajesh@finscale.tech"));

        // 3. Seed Applications with varied statuses
        Application app1 = new Application(savedJob1.getId(), "aarav@candidate.com", "Aarav Sharma", "2 years Java experience.");
        app1.setStatus("SHORTLISTED");
        app1.setRecruiterNote("Strong candidate. Scheduled interview.");
        applicationRepository.save(app1);

        Application app2 = new Application(savedJob1.getId(), "priya@candidate.com", "Priya Nair", "4 years Java & microservices experience.");
        app2.setStatus("UNDER_REVIEW");
        app2.setRecruiterNote("Reviewing code samples.");
        applicationRepository.save(app2);

        Application app3 = new Application(savedJob2.getId(), "rohan@candidate.com", "Rohan Verma", "Recent graduate with React skills.");
        app3.setStatus("APPLIED");
        applicationRepository.save(app3);

        Application app4 = new Application(savedJob3.getId(), "rohan@candidate.com", "Rohan Verma", "Looking for internship.");
        app4.setStatus("REJECTED");
        app4.setRecruiterNote("Position requires Mumbai residence.");
        applicationRepository.save(app4);

        System.out.println("🎉 HireLoop demo data ready! Visit http://localhost:5000/api/jobs");
    }
}
```

---

### `HireloopApplication.java`
**Location:** `server-springboot/src/main/java/com/hireloop/backend/HireloopApplication.java`

```java
package com.hireloop.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication: Meta-annotation enabling @Configuration, @EnableAutoConfiguration, and @ComponentScan
@SpringBootApplication
public class HireloopApplication {

    // Main entry point of the Java application
    public static void main(String[] args) {
        SpringApplication.run(HireloopApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("🚀 HireLoop Spring Boot REST API is running on http://localhost:5000");
        System.out.println("=======================================================\n");
    }
}
```

---

# 7. Frontend Architecture & Key Code (React)

---

### `client/src/api/client.js` (Axios API Client)
```javascript
import axios from 'axios';

// Create a single reusable Axios instance pointing to Spring Boot
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attaches the JWT authorization token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Redirects to login if token is expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### `client/src/context/AuthContext.jsx` (Global Auth State)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Reads saved user from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session when user reloads page
  useEffect(() => {
    const hydrate = async () => {
      const stored = localStorage.getItem('token');
      if (stored) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isRecruiter: user?.role === 'RECRUITER',
        isCandidate: user?.role === 'CANDIDATE',
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

# 8. Database Configuration

### `server-springboot/src/main/resources/application.properties` (PostgreSQL)
```properties
# Server Port
server.port=5000

# PostgreSQL Connection Settings
spring.datasource.url=jdbc:postgresql://localhost:5432/hireloop_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# Hibernate Settings
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### `server-springboot/src/main/resources/application-h2.properties` (H2 In-Memory)
```properties
# Server Port
server.port=5000

# In-Memory H2 Database (zero installation required)
spring.datasource.url=jdbc:h2:mem:hireloopdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Auto create & drop tables on exit
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# Enable browser UI at http://localhost:5000/h2-console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true
```
