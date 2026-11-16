package com.hireloop.backend.controller;

import com.hireloop.backend.model.User;
import com.hireloop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UserController — REST endpoints for User operations.
 *
 * Base URL: /api/users
 *
 * Endpoints:
 *   POST   /api/users/register   → Register a new user
 *   GET    /api/users            → List all users
 *   GET    /api/users/{id}       → Get user by ID
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ── REGISTER A NEW USER ───────────────────────────────────────────────────
    // POST /api/users/register
    // Body: { "name": "...", "email": "...", "password": "...", "role": "CANDIDATE" }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered."));
        }
        // NOTE: For viva demo — storing plain password (no encryption for simplicity)
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    // ── LIST ALL USERS ────────────────────────────────────────────────────────
    // GET /api/users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── GET USER BY ID ────────────────────────────────────────────────────────
    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── SIMPLE LOGIN (not secure — demo only) ─────────────────────────────────
    // POST /api/users/login
    // Body: { "email": "...", "password": "..." }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))  // plain text compare (demo only)
                .map(u -> ResponseEntity.ok((Object) u))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid email or password.")));
    }
}
