package com.hireloop.backend.service;

import com.hireloop.backend.model.Job;
import com.hireloop.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * JobService — Contains all business logic for job operations.
 * Controllers call this service; service talks to the repository (database).
 * Pattern: Controller → Service → Repository → Database
 */
@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    // ── GET ALL OPEN JOBS ─────────────────────────────────────────────────────
    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus("OPEN");
    }

    // ── GET ALL JOBS (admin view) ─────────────────────────────────────────────
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // ── GET JOB BY ID ─────────────────────────────────────────────────────────
    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    // ── SEARCH JOBS BY KEYWORD ────────────────────────────────────────────────
    public List<Job> searchJobs(String keyword) {
        return jobRepository.findByTitleContainingIgnoreCase(keyword);
    }

    // ── GET JOBS BY RECRUITER EMAIL ───────────────────────────────────────────
    public List<Job> getJobsByRecruiter(String email) {
        return jobRepository.findByRecruiterEmail(email);
    }

    // ── CREATE JOB ────────────────────────────────────────────────────────────
    public Job createJob(Job job) {
        // Default status to OPEN when creating a new job
        if (job.getStatus() == null || job.getStatus().isBlank()) {
            job.setStatus("OPEN");
        }
        return jobRepository.save(job);
    }

    // ── UPDATE JOB ────────────────────────────────────────────────────────────
    public Optional<Job> updateJob(Long id, Job updatedJob) {
        return jobRepository.findById(id).map(existingJob -> {
            // Only update fields that are provided
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

    // ── CLOSE JOB ─────────────────────────────────────────────────────────────
    public Optional<Job> closeJob(Long id) {
        return jobRepository.findById(id).map(job -> {
            job.setStatus("CLOSED");
            return jobRepository.save(job);
        });
    }

    // ── DELETE JOB ────────────────────────────────────────────────────────────
    public boolean deleteJob(Long id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
