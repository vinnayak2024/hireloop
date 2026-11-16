package com.hireloop.backend.repository;

import com.hireloop.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Spring Data JPA generates all SQL automatically — no need to write queries manually!
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by their email (used for login check)
    Optional<User> findByEmail(String email);

    // Check if an email already exists (used during registration)
    boolean existsByEmail(String email);
}
