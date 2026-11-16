package com.hireloop.backend.controller;

import com.hireloop.backend.model.User;
import com.hireloop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * AuthController — Handles authentication requests from the React frontend.
 *
 * Endpoints:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   GET  /api/auth/me
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                // Return JWT dummy token & user info expected by React AuthContext
                String token = "jwt-token-" + user.getId() + "-" + user.getRole().toLowerCase();
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "user", user
                ));
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered."));
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("CANDIDATE");
        }

        User saved = userRepository.save(user);
        String token = "jwt-token-" + saved.getId() + "-" + saved.getRole().toLowerCase();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", saved
        ));
    }

    // ── CURRENT LOGGED-IN USER ────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Simple resolution for demo: look up first candidate or recruiter or by token
        if (authHeader != null && authHeader.contains("jwt-token-")) {
            try {
                String[] parts = authHeader.replace("Bearer ", "").split("-");
                if (parts.length >= 3) {
                    Long userId = Long.parseLong(parts[2]);
                    Optional<User> u = userRepository.findById(userId);
                    if (u.isPresent()) {
                        return ResponseEntity.ok(Map.of("user", u.get()));
                    }
                }
            } catch (Exception ignored) {}
        }

        // Fallback: return default candidate
        return userRepository.findAll().stream().findFirst()
                .map(u -> ResponseEntity.ok(Map.of("user", u)))
                .orElse(ResponseEntity.status(401).build());
    }
}
