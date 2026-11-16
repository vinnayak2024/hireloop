package com.hireloop.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HireloopApplication {

    public static void main(String[] args) {
        SpringApplication.run(HireloopApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("🚀 HireLoop Spring Boot REST API is running on http://localhost:5000");
        System.out.println("=======================================================\n");
    }
}
