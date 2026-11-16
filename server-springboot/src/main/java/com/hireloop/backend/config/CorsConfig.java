package com.hireloop.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig — Allows the React frontend (port 5173) to call this Spring Boot API.
 *
 * Without CORS, the browser blocks requests from a different port/origin.
 * This tells Spring Boot: "Yes, it's OK if requests come from localhost:5173"
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")          // Apply to all /api/ endpoints
                        .allowedOrigins(
                            "http://localhost:5173",    // Vite (React dev server)
                            "http://localhost:3000",    // CRA React (alternative)
                            "http://localhost:5000"     // Same-origin requests
                        )
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")            // Allow any headers
                        .allowCredentials(true);        // Allow cookies/auth headers
            }
        };
    }
}
