package com.hireloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * User Entity — Represents the "users" table in the database.
 * Stores login credentials and role (CANDIDATE or RECRUITER).
 */
@Entity // Tells Hibernate this class is mapped to a database table
@Table(name = "users")
public class User {

    @Id // Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID (1, 2, 3...)
    private Long id;

    @Column(nullable = false) // Required field (cannot be null)
    private String name;

    @Column(nullable = false, unique = true) // Unique constraint: no two users with same email
    private String email;

    @Column(nullable = false)
    private String password; // Plain text for demo/viva simplicity

    @Column(nullable = false)
    private String role; // "CANDIDATE" or "RECRUITER"

    private String companyName; // Only populated for Recruiters

    private LocalDateTime createdAt = LocalDateTime.now(); // Auto-timestamp on creation

    // Default no-argument constructor required by JPA
    public User() {}

    // Convenient constructor to initialize a user
    public User(String name, String email, String password, String role, String companyName) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.companyName = companyName;
    }

    // Standard Getters and Setters
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
