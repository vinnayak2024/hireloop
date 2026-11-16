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

/**
 * RecruiterCandidateController — Endpoints for Recruiter Dashboard stats,
 * company profile, and Candidate profile.
 */
@RestController
@RequestMapping("/api")
public class RecruiterCandidateController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // ── RECRUITER JOBS ────────────────────────────────────────────────────────
    // GET /api/recruiter/jobs
    @GetMapping("/recruiter/jobs")
    public ResponseEntity<?> getRecruiterJobs() {
        List<Job> jobs = jobRepository.findAll();
        return ResponseEntity.ok(Map.of("jobs", jobs));
    }

    // ── RECRUITER DASHBOARD STATS ─────────────────────────────────────────────
    // GET /api/recruiter/stats
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

    // ── RECRUITER COMPANY PROFILE ─────────────────────────────────────────────
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

    // ── CANDIDATE PROFILE ─────────────────────────────────────────────────────
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
