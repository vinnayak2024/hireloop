package com.hireloop.backend.config;

import com.hireloop.backend.model.Application;
import com.hireloop.backend.model.Job;
import com.hireloop.backend.model.User;
import com.hireloop.backend.repository.ApplicationRepository;
import com.hireloop.backend.repository.JobRepository;
import com.hireloop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataSeeder — Automatically inserts demo data when the app starts.
 *
 * CommandLineRunner runs ONCE after Spring Boot finishes starting up.
 * We only seed data if the database is empty (jobRepository.count() == 0),
 * so re-starting the app won't duplicate data.
 *
 * Demo Data includes:
 *   - 2 Recruiters (Sarah Jenkins, Rajesh Mehta)
 *   - 3 Candidates (Aarav Sharma, Priya Nair, Rohan Verma)
 *   - 8 Jobs (mix of types, locations, salaries)
 *   - 4 Applications (various statuses to show during viva)
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private ApplicationRepository applicationRepository;

    @Override
    public void run(String... args) throws Exception {

        // ── Only seed if database is empty ────────────────────────────────────
        if (jobRepository.count() > 0) {
            System.out.println("✅ Database already has data — skipping seed.");
            return;
        }

        System.out.println("🌱 Seeding demo data for HireLoop viva...");

        // ══════════════════════════════════════════════════════════════════════
        // USERS — 2 Recruiters + 3 Candidates
        // ══════════════════════════════════════════════════════════════════════

        User sarah = new User();
        sarah.setName("Sarah Jenkins");
        sarah.setEmail("sarah@cloudnexus.io");
        sarah.setPassword("pass123");
        sarah.setRole("RECRUITER");
        sarah.setCompanyName("CloudNexus Solutions");
        userRepository.save(sarah);

        User rajesh = new User();
        rajesh.setName("Rajesh Mehta");
        rajesh.setEmail("rajesh@finscale.tech");
        rajesh.setPassword("pass123");
        rajesh.setRole("RECRUITER");
        rajesh.setCompanyName("FinScale Technologies");
        userRepository.save(rajesh);

        User aarav = new User();
        aarav.setName("Aarav Sharma");
        aarav.setEmail("aarav@candidate.com");
        aarav.setPassword("pass123");
        aarav.setRole("CANDIDATE");
        userRepository.save(aarav);

        User priya = new User();
        priya.setName("Priya Nair");
        priya.setEmail("priya@candidate.com");
        priya.setPassword("pass123");
        priya.setRole("CANDIDATE");
        userRepository.save(priya);

        User rohan = new User();
        rohan.setName("Rohan Verma");
        rohan.setEmail("rohan@candidate.com");
        rohan.setPassword("pass123");
        rohan.setRole("CANDIDATE");
        userRepository.save(rohan);

        System.out.println("   ✔ 5 users seeded");

        // ══════════════════════════════════════════════════════════════════════
        // JOBS — 8 jobs (mix of types and companies)
        // ══════════════════════════════════════════════════════════════════════

        // Job 1 — Full-time, Remote
        Job job1 = new Job();
        job1.setTitle("Backend Java Developer");
        job1.setDescription("Build scalable REST APIs using Java Spring Boot. Work with microservices architecture and PostgreSQL databases. Collaborate with frontend team on API design.");
        job1.setLocation("Remote");
        job1.setJobType("FULL_TIME");
        job1.setWorkMode("REMOTE");
        job1.setSalaryMin(800000);
        job1.setSalaryMax(1400000);
        job1.setSkills("Java, Spring Boot, REST API, PostgreSQL, Git");
        job1.setExperienceRequired("2+ years");
        job1.setStatus("OPEN");
        job1.setCompanyName("CloudNexus Solutions");
        job1.setRecruiterEmail("sarah@cloudnexus.io");
        Job savedJob1 = jobRepository.save(job1);

        // Job 2 — Full-time, Hybrid
        Job job2 = new Job();
        job2.setTitle("React Frontend Developer");
        job2.setDescription("Develop modern, responsive web applications using React 18 and TypeScript. Work with Figma designs and collaborate closely with backend team.");
        job2.setLocation("Bangalore, Karnataka");
        job2.setJobType("FULL_TIME");
        job2.setWorkMode("HYBRID");
        job2.setSalaryMin(700000);
        job2.setSalaryMax(1200000);
        job2.setSkills("React, TypeScript, HTML, CSS, REST API, Git");
        job2.setExperienceRequired("1-3 years");
        job2.setStatus("OPEN");
        job2.setCompanyName("CloudNexus Solutions");
        job2.setRecruiterEmail("sarah@cloudnexus.io");
        Job savedJob2 = jobRepository.save(job2);

        // Job 3 — Internship, Onsite
        Job job3 = new Job();
        job3.setTitle("Software Engineer Intern");
        job3.setDescription("6-month internship program. Work on real projects alongside senior engineers. Training provided. Great opportunity for fresh graduates.");
        job3.setLocation("Mumbai, Maharashtra");
        job3.setJobType("INTERNSHIP");
        job3.setWorkMode("ONSITE");
        job3.setSalaryMin(20000);
        job3.setSalaryMax(35000);
        job3.setSkills("Java or Python, Data Structures, SQL basics");
        job3.setExperienceRequired("0-1 years (Freshers welcome)");
        job3.setStatus("OPEN");
        job3.setCompanyName("FinScale Technologies");
        job3.setRecruiterEmail("rajesh@finscale.tech");
        Job savedJob3 = jobRepository.save(job3);

        // Job 4 — Full-time, Remote
        Job job4 = new Job();
        job4.setTitle("DevOps Engineer");
        job4.setDescription("Manage CI/CD pipelines, cloud infrastructure on AWS, and Kubernetes clusters. Automate deployment workflows and ensure 99.9% uptime.");
        job4.setLocation("Remote");
        job4.setJobType("FULL_TIME");
        job4.setWorkMode("REMOTE");
        job4.setSalaryMin(1000000);
        job4.setSalaryMax(1800000);
        job4.setSkills("AWS, Docker, Kubernetes, Jenkins, Terraform, Linux");
        job4.setExperienceRequired("3+ years");
        job4.setStatus("OPEN");
        job4.setCompanyName("CloudNexus Solutions");
        job4.setRecruiterEmail("sarah@cloudnexus.io");
        jobRepository.save(job4);

        // Job 5 — Full-time, Hybrid (FinScale)
        Job job5 = new Job();
        job5.setTitle("Data Analyst");
        job5.setDescription("Analyze financial datasets, build dashboards in Power BI, write SQL queries for reporting. Work with product and finance teams to generate actionable insights.");
        job5.setLocation("Pune, Maharashtra");
        job5.setJobType("FULL_TIME");
        job5.setWorkMode("HYBRID");
        job5.setSalaryMin(600000);
        job5.setSalaryMax(1000000);
        job5.setSkills("SQL, Python, Power BI, Excel, Statistics");
        job5.setExperienceRequired("1-2 years");
        job5.setStatus("OPEN");
        job5.setCompanyName("FinScale Technologies");
        job5.setRecruiterEmail("rajesh@finscale.tech");
        jobRepository.save(job5);

        // Job 6 — Part-time, Remote
        Job job6 = new Job();
        job6.setTitle("UI/UX Designer (Part-Time)");
        job6.setDescription("Design user interfaces and experiences for our mobile and web products. Create wireframes, prototypes, and high-fidelity designs in Figma.");
        job6.setLocation("Remote");
        job6.setJobType("PART_TIME");
        job6.setWorkMode("REMOTE");
        job6.setSalaryMin(400000);
        job6.setSalaryMax(700000);
        job6.setSkills("Figma, Adobe XD, Prototyping, User Research");
        job6.setExperienceRequired("1+ years");
        job6.setStatus("OPEN");
        job6.setCompanyName("CloudNexus Solutions");
        job6.setRecruiterEmail("sarah@cloudnexus.io");
        jobRepository.save(job6);

        // Job 7 — Full-time, Onsite (CLOSED — to show variety)
        Job job7 = new Job();
        job7.setTitle("Mobile App Developer (Android)");
        job7.setDescription("Develop Android apps using Kotlin. This position has been filled.");
        job7.setLocation("Hyderabad, Telangana");
        job7.setJobType("FULL_TIME");
        job7.setWorkMode("ONSITE");
        job7.setSalaryMin(900000);
        job7.setSalaryMax(1500000);
        job7.setSkills("Kotlin, Android SDK, Jetpack Compose, REST APIs");
        job7.setExperienceRequired("2+ years");
        job7.setStatus("CLOSED");   // This one is closed
        job7.setCompanyName("FinScale Technologies");
        job7.setRecruiterEmail("rajesh@finscale.tech");
        jobRepository.save(job7);

        // Job 8 — Full-time, Hybrid
        Job job8 = new Job();
        job8.setTitle("Machine Learning Engineer");
        job8.setDescription("Build and deploy ML models for fraud detection and credit scoring. Work with large financial datasets and cloud infrastructure.");
        job8.setLocation("Bangalore, Karnataka");
        job8.setJobType("FULL_TIME");
        job8.setWorkMode("HYBRID");
        job8.setSalaryMin(1200000);
        job8.setSalaryMax(2200000);
        job8.setSkills("Python, TensorFlow, Scikit-learn, SQL, AWS SageMaker");
        job8.setExperienceRequired("3-5 years");
        job8.setStatus("OPEN");
        job8.setCompanyName("FinScale Technologies");
        job8.setRecruiterEmail("rajesh@finscale.tech");
        jobRepository.save(job8);

        System.out.println("   ✔ 8 jobs seeded (7 OPEN, 1 CLOSED)");

        // ══════════════════════════════════════════════════════════════════════
        // APPLICATIONS — 4 applications with different statuses
        // ══════════════════════════════════════════════════════════════════════

        // Aarav applied to "Backend Java Developer" → SHORTLISTED
        Application app1 = new Application();
        app1.setJobId(savedJob1.getId());
        app1.setCandidateEmail("aarav@candidate.com");
        app1.setCandidateName("Aarav Sharma");
        app1.setCoverLetter("I have 2 years of experience with Java Spring Boot and REST APIs. Excited about this opportunity at CloudNexus!");
        app1.setStatus("SHORTLISTED");
        app1.setRecruiterNote("Strong Java background, schedule interview.");
        applicationRepository.save(app1);

        // Priya applied to "Backend Java Developer" → UNDER_REVIEW
        Application app2 = new Application();
        app2.setJobId(savedJob1.getId());
        app2.setCandidateEmail("priya@candidate.com");
        app2.setCandidateName("Priya Nair");
        app2.setCoverLetter("4 years experience with Java, Spring Boot, and microservices. Currently leading a team of 3 developers.");
        app2.setStatus("UNDER_REVIEW");
        app2.setRecruiterNote("Very experienced. Reviewing portfolio.");
        applicationRepository.save(app2);

        // Rohan applied to "React Frontend Developer" → APPLIED (freshest)
        Application app3 = new Application();
        app3.setJobId(savedJob2.getId());
        app3.setCandidateEmail("rohan@candidate.com");
        app3.setCandidateName("Rohan Verma");
        app3.setCoverLetter("Fresh graduate with strong React skills. Completed 3 personal projects. Looking for first full-time role.");
        app3.setStatus("APPLIED");
        applicationRepository.save(app3);

        // Rohan also applied to "Software Engineer Intern" → REJECTED
        Application app4 = new Application();
        app4.setJobId(savedJob3.getId());
        app4.setCandidateEmail("rohan@candidate.com");
        app4.setCandidateName("Rohan Verma");
        app4.setCoverLetter("I am a recent CS graduate looking for internship opportunities. Very eager to learn.");
        app4.setStatus("REJECTED");
        app4.setRecruiterNote("Position requires Mumbai residence; candidate is from Delhi.");
        applicationRepository.save(app4);

        System.out.println("   ✔ 4 applications seeded");
        System.out.println("🎉 HireLoop demo data ready! Visit http://localhost:5000/api/jobs");
    }
}
