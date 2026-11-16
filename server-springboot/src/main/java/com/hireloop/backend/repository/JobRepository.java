package com.hireloop.backend.repository;

import com.hireloop.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repository for Job entity — Spring generates all SQL automatically
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Get all jobs with a specific status (e.g., "OPEN")
    List<Job> findByStatus(String status);

    // Search jobs by title keyword (case-insensitive)
    List<Job> findByTitleContainingIgnoreCase(String keyword);

    // Get all jobs posted by a specific recruiter (by their email)
    List<Job> findByRecruiterEmail(String recruiterEmail);

    // Get open jobs filtered by location (case-insensitive)
    List<Job> findByStatusAndLocationContainingIgnoreCase(String status, String location);

    // Get open jobs filtered by job type (FULL_TIME, INTERNSHIP, etc.)
    List<Job> findByStatusAndJobType(String status, String jobType);
}
