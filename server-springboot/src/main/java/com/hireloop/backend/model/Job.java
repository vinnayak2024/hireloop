package com.hireloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Job Entity — Represents the "jobs" table in the database.
 * Stores job listings created by recruiters.
 */
@Entity // Mapped to the database table by Hibernate
@Table(name = "jobs")
public class Job {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000, nullable = false) // Length 2000 allows longer job descriptions
    private String description;

    @Column(nullable = false)
    private String location; // e.g. "Remote", "Bangalore, Karnataka"

    private String jobType;  // FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT
    private String workMode; // ONSITE, REMOTE, HYBRID

    private Integer salaryMin; // e.g. 800000
    private Integer salaryMax; // e.g. 1400000

    private String skills;             // e.g. "Java, Spring Boot, React, SQL"
    private String experienceRequired; // e.g. "2+ years", "Freshers welcome"

    @Column(nullable = false)
    private String status = "OPEN"; // "OPEN" (active) or "CLOSED" (filled)

    private String companyName;    // e.g. "CloudNexus Solutions"
    private String recruiterEmail; // Email of the recruiter who posted this job

    private LocalDateTime createdAt = LocalDateTime.now(); // Auto-timestamp

    // Default no-argument constructor required by JPA
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

    /**
     * @Transient: Not saved into the database table as a column.
     * Jackson automatically includes this in the JSON response so the React
     * frontend can read "job.company.name" without extra DTO conversions.
     */
    @Transient
    public Map<String, Object> getCompany() {
        return Map.of("name", companyName != null ? companyName : "HireLoop Partner");
    }
}
