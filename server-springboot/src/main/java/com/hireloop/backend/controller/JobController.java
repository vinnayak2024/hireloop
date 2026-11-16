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

/**
 * JobController — REST endpoints for Jobs, fully compatible with React frontend.
 *
 * Base URL: /api/jobs
 */
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationService applicationService;

    // ── GET JOBS (Supports search, filters, pagination, limit) ────────────────
    // GET /api/jobs?q=developer&location=Remote&jobType=FULL_TIME&limit=3
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

        // Job Type filter
        if (jobType != null && !jobType.isBlank()) {
            jobs = jobs.stream()
                    .filter(j -> jobType.equalsIgnoreCase(j.getJobType()))
                    .collect(Collectors.toList());
        }

        // Work Mode filter
        if (workMode != null && !workMode.isBlank()) {
            jobs = jobs.stream()
                    .filter(j -> workMode.equalsIgnoreCase(j.getWorkMode()))
                    .collect(Collectors.toList());
        }

        int total = jobs.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) total / limit));

        // Slice for pagination/limit if requested
        if (limit != null && limit > 0 && jobs.size() > limit) {
            jobs = jobs.subList(0, limit);
        }

        return ResponseEntity.ok(Map.of(
                "data", jobs,
                "total", total,
                "totalPages", totalPages,
                "page", page,
                "limit", limit
        ));
    }

    // ── GET ALL JOBS (Raw list, any status) ───────────────────────────────────
    @GetMapping("/all")
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    // ── GET SINGLE JOB BY ID ──────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(job -> ResponseEntity.ok(Map.of("job", job)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── APPLY TO JOB ──────────────────────────────────────────────────────────
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

    // ── GET APPLICANTS FOR A SPECIFIC JOB ────────────────────────────────────
    // GET /api/jobs/{id}/applications
    @GetMapping("/{id}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable Long id) {
        List<Application> applications = applicationService.getApplicationsForJob(id);
        return ResponseEntity.ok(Map.of("applications", applications));
    }

    // ── GET JOBS BY RECRUITER EMAIL ───────────────────────────────────────────
    @GetMapping("/recruiter/{email}")
    public List<Job> getJobsByRecruiter(@PathVariable String email) {
        return jobService.getJobsByRecruiter(email);
    }

    // ── CREATE JOB ────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        if (job.getCompanyName() == null || job.getCompanyName().isBlank()) {
            job.setCompanyName("CloudNexus Solutions");
        }
        if (job.getRecruiterEmail() == null || job.getRecruiterEmail().isBlank()) {
            job.setRecruiterEmail("sarah@cloudnexus.io");
        }
        Job saved = jobService.createJob(job);
        return ResponseEntity.ok(Map.of("job", saved));
    }

    // ── UPDATE JOB ────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job job) {
        return jobService.updateJob(id, job)
                .map(j -> ResponseEntity.ok(Map.of("job", j)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── CLOSE JOB ─────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/close")
    public ResponseEntity<?> closeJob(@PathVariable Long id) {
        return jobService.closeJob(id)
                .map(j -> ResponseEntity.ok(Map.of("message", "Job closed successfully.", "job", j)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE JOB ────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (jobService.deleteJob(id)) {
            return ResponseEntity.ok(Map.of("message", "Job deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }
}
