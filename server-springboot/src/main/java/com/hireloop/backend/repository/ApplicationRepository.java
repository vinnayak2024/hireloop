package com.hireloop.backend.repository;

import com.hireloop.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Repository for Application entity
@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Get all applications for a specific job (recruiter view)
    List<Application> findByJobId(Long jobId);

    // Get all applications submitted by a candidate (candidate view)
    List<Application> findByCandidateEmail(String candidateEmail);

    // Check if a candidate has already applied to a job (prevent duplicates)
    boolean existsByJobIdAndCandidateEmail(Long jobId, String candidateEmail);
}
