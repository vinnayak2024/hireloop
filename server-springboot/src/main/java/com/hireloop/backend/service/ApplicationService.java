package com.hireloop.backend.service;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.repository.ApplicationRepository;
import com.hireloop.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * ApplicationService — Business logic for job applications.
 * Handles: apply, view applicants, update status, withdraw.
 */
@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    // ── APPLY FOR A JOB ───────────────────────────────────────────────────────
    public Application apply(Application application) {
        // Check if job exists
        if (!jobRepository.existsById(application.getJobId())) {
            throw new RuntimeException("Job not found with id: " + application.getJobId());
        }

        // Check if candidate already applied to this job (no duplicates)
        if (applicationRepository.existsByJobIdAndCandidateEmail(
                application.getJobId(), application.getCandidateEmail())) {
            throw new RuntimeException("You have already applied to this job.");
        }

        // Default status = APPLIED
        application.setStatus("APPLIED");
        return applicationRepository.save(application);
    }

    // ── GET ALL APPLICATIONS FOR A JOB (Recruiter View) ──────────────────────
    public List<Application> getApplicationsForJob(Long jobId) {
        List<Application> list = applicationRepository.findByJobId(jobId);
        jobRepository.findById(jobId).ifPresent(j -> list.forEach(app -> app.setJob(j)));
        return list;
    }

    // ── GET ALL APPLICATIONS BY A CANDIDATE ──────────────────────────────────
    public List<Application> getApplicationsByCandidate(String email) {
        List<Application> list = applicationRepository.findByCandidateEmail(email);
        list.forEach(app -> {
            jobRepository.findById(app.getJobId()).ifPresent(app::setJob);
        });
        return list;
    }

    // ── GET ALL APPLICATIONS (for demo/recruiter view) ─────────────────────────
    public List<Application> getAllApplications() {
        List<Application> list = applicationRepository.findAll();
        list.forEach(app -> {
            jobRepository.findById(app.getJobId()).ifPresent(app::setJob);
        });
        return list;
    }

    // ── GET APPLICATION BY ID ─────────────────────────────────────────────────
    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    // ── UPDATE APPLICATION STATUS (Recruiter Action) ──────────────────────────
    // Valid transitions: APPLIED → UNDER_REVIEW → SHORTLISTED or REJECTED
    public Optional<Application> updateStatus(Long id, String newStatus, String recruiterNote) {
        return applicationRepository.findById(id).map(app -> {
            // Simple validation — only allow valid status values
            List<String> validStatuses = List.of("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "WITHDRAWN");
            if (!validStatuses.contains(newStatus)) {
                throw new RuntimeException("Invalid status: " + newStatus);
            }
            // Can't change a withdrawn application
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

    // ── WITHDRAW APPLICATION (Candidate Action) ───────────────────────────────
    public Optional<Application> withdraw(Long id) {
        return applicationRepository.findById(id).map(app -> {
            // Can only withdraw if still active
            if ("SHORTLISTED".equals(app.getStatus()) || "REJECTED".equals(app.getStatus())) {
                throw new RuntimeException("Cannot withdraw a " + app.getStatus() + " application.");
            }
            app.setStatus("WITHDRAWN");
            return applicationRepository.save(app);
        });
    }
}
