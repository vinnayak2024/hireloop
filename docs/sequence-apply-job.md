# Sequence Diagram: Candidate Applies for a Job

This sequence diagram illustrates the lifecycle of a job application in HireLoop, including file validation, atomic database persistence, recruiter review, and candidate real-time tracking.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate (Browser)
    participant Client as React Client (Axios)
    participant Server as Express Server
    participant AuthMW as Auth & RBAC Middleware
    participant UploadMW as Multer File Upload
    participant AppService as Application Service
    participant Disk as Local File Storage
    participant DB as SQLite (Prisma ORM)
    actor Recruiter as Recruiter (Browser)

    Candidate->>Client: Click "Apply Now" (upload PDF or select default resume)
    Client->>Server: POST /api/jobs/:id/apply (Multipart Form Data)
    Server->>AuthMW: Verify Bearer JWT
    AuthMW-->>Server: Authenticated (Candidate ID)
    Server->>UploadMW: Validate MIME (application/pdf) & ext (.pdf) <= 2MB
    UploadMW->>Disk: Save sanitized UUID.pdf (/server/uploads/resumes)
    UploadMW-->>Server: File saved to disk
    Server->>AppService: applyForJob(jobId, candidateId, file, coverLetter)
    
    AppService->>DB: Check Job status == 'OPEN' and deadline not passed
    DB-->>AppService: Job verified
    AppService->>DB: Check UNIQUE(jobId, candidateId)
    DB-->>AppService: No existing application
    
    rect rgb(240, 253, 250)
        Note over AppService,DB: Atomic Transaction ($transaction)
        AppService->>DB: INSERT INTO Application (status='APPLIED')
        AppService->>DB: INSERT INTO ApplicationStatusHistory (fromStatus='NONE', toStatus='APPLIED')
    end
    DB-->>AppService: Application created
    AppService-->>Server: Return application object
    Server-->>Client: HTTP 201 Created
    Client-->>Candidate: Toast: "Application submitted successfully!"

    Note over Candidate,Recruiter: Recruiter Reviews Candidate Pipeline

    Recruiter->>Client: Open Applicants page (/recruiter/jobs/:id/applicants)
    Client->>Server: GET /api/jobs/:id/applications
    Server->>DB: Verify Recruiter owns job & SELECT applicants
    DB-->>Server: Return applicants list
    Server-->>Client: HTTP 200 OK
    Recruiter->>Client: Click "Download PDF Resume"
    Client->>Server: GET /api/applications/:id/resume
    Server->>Disk: Stream UUID.pdf with Content-Disposition
    Disk-->>Client: PDF binary stream
    Client-->>Recruiter: Save file as [Candidate_Name]_Resume.pdf

    Recruiter->>Client: Update status to "SHORTLISTED" with note
    Client->>Server: PATCH /api/applications/:id/status
    Server->>AppService: updateApplicationStatus()
    AppService->>DB: Validate status transition (UNDER_REVIEW -> SHORTLISTED)
    rect rgb(240, 253, 250)
        Note over AppService,DB: Atomic Transaction ($transaction)
        AppService->>DB: UPDATE Application SET status='SHORTLISTED', recruiterNote=...
        AppService->>DB: INSERT INTO ApplicationStatusHistory (toStatus='SHORTLISTED')
    end
    DB-->>Server: Updated
    Server-->>Client: HTTP 200 OK

    Candidate->>Client: Open "My Applications" (/candidate/applications)
    Client->>Server: GET /api/applications/mine
    Server->>DB: SELECT candidate applications & statusHistory
    DB-->>Client: Return applications
    Client-->>Candidate: Status badge shows "SHORTLISTED" (green) + view Timeline
```
