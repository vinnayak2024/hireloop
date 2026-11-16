package com.hireloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Application Entity — Represents job applications submitted by candidates.
 * Enforces a unique constraint so a candidate cannot apply to the same job twice.
 */
@Entity
@Table(name = "applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "candidate_email"}))
public class Application {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false) // Foreign key reference to Job ID
    private Long jobId;

    @Column(name = "candidate_email", nullable = false)
    private String candidateEmail;

    private String candidateName;

    @Column(length = 2000)
    private String coverLetter;

    // Status lifecycle: APPLIED -> UNDER_REVIEW -> SHORTLISTED / REJECTED / WITHDRAWN
    private String status = "APPLIED";

    private String recruiterNote; // Notes left by the recruiter during review

    private LocalDateTime appliedAt = LocalDateTime.now();

    /**
     * @Transient: Populated at runtime by ApplicationService so React can access:
     * application.job.title, application.job.company.name, application.job.location
     */
    @Transient
    private Job job;

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    /**
     * @Transient: Serializes into a candidate summary map for recruiter table view
     */
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

    // Getters and Setters
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
