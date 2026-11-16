package com.hireloop.backend.controller;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ApplicationController — REST endpoints for Applications.
 *
 * Base URL: /api/applications
 */
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // ── CANDIDATE APPLICATIONS ("mine") ──────────────────────────────────────
    // GET /api/applications/mine
    @GetMapping("/mine")
    public ResponseEntity<?> getMyApplications(@RequestParam(required = false) String status) {
        List<Application> list = applicationService.getAllApplications();
        if (status != null && !status.isBlank()) {
            list = list.stream()
                    .filter(a -> status.equalsIgnoreCase(a.getStatus()))
                    .toList();
        }
        return ResponseEntity.ok(Map.of("applications", list));
    }

    // ── STATUS TIMELINE HISTORY ──────────────────────────────────────────────
    // GET /api/applications/{id}/history
    @GetMapping("/{id}/history")
    public ResponseEntity<?> getApplicationHistory(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(app -> {
                    List<Map<String, Object>> history = List.of(
                            Map.of("status", "APPLIED", "createdAt", app.getAppliedAt(), "note", "Application submitted"),
                            Map.of("status", app.getStatus(), "createdAt", LocalDateTime.now(), "note", app.getRecruiterNote() != null ? app.getRecruiterNote() : "Status updated")
                    );
                    return ResponseEntity.ok(Map.of("history", history));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── RESUME DOWNLOAD ──────────────────────────────────────────────────────
    // GET /api/applications/{id}/resume
    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        String dummyResume = "=== CANDIDATE RESUME ===\n\nName: Aarav Sharma\nRole: Java Backend Developer\nSkills: Java, Spring Boot, React, PostgreSQL\nExperience: 2 years\nEducation: B.Tech Computer Science\n";
        byte[] content = dummyResume.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(content);
    }

    // ── UPDATE STATUS (Recruiter) ────────────────────────────────────────────
    // PATCH /api/applications/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            String recruiterNote = body.get("recruiterNote");
            return applicationService.updateStatus(id, newStatus, recruiterNote)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    // ── WITHDRAW APPLICATION (Candidate) ─────────────────────────────────────
    // PATCH /api/applications/{id}/withdraw
    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id) {
        try {
            return applicationService.withdraw(id)
                    .map(app -> ResponseEntity.ok((Object) Map.of("message", "Application withdrawn.", "application", app)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    // ── GET BY ID ────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
