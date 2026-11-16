# HireLoop - Database Entity-Relationship (ER) Diagram

This diagram visualizes the data model defined in `server/prisma/schema.prisma`. Enums are managed at the application/Zod validation layer for portability between SQLite and PostgreSQL.

```mermaid
erDiagram
    USER ||--o| CANDIDATE_PROFILE : "has profile"
    USER ||--o{ COMPANY : "owns"
    USER ||--o{ JOB : "posts"
    USER ||--o{ APPLICATION : "submits"
    USER ||--o{ APPLICATION_STATUS_HISTORY : "initiates"

    COMPANY ||--o{ JOB : "lists"
    JOB ||--o{ APPLICATION : "receives"
    APPLICATION ||--o{ APPLICATION_STATUS_HISTORY : "tracks timeline"

    USER {
        string id PK "UUID"
        string name
        string email UK
        string passwordHash
        string role "CANDIDATE | RECRUITER"
        datetime createdAt
    }

    CANDIDATE_PROFILE {
        string id PK "UUID"
        string userId FK, UK
        string phone
        string location
        string headline
        string skills "Comma-separated"
        int experienceYears
        string defaultResumePath "Relative disk path"
    }

    COMPANY {
        string id PK "UUID"
        string name
        string website
        string location
        string description
        string recruiterId FK
    }

    JOB {
        string id PK "UUID"
        string title
        string description
        string location
        string jobType "FULL_TIME | PART_TIME | INTERNSHIP | CONTRACT"
        string workMode "ONSITE | REMOTE | HYBRID"
        int salaryMin
        int salaryMax
        string skills "Comma-separated"
        int experienceRequired "Years"
        string status "OPEN | CLOSED"
        datetime deadline
        string companyId FK
        string postedById FK
        datetime createdAt
        datetime updatedAt
    }

    APPLICATION {
        string id PK "UUID"
        string jobId FK
        string candidateId FK
        string resumePath "uploads/resumes/UUID.pdf"
        string coverLetter
        string status "APPLIED | UNDER_REVIEW | SHORTLISTED | REJECTED | WITHDRAWN"
        string recruiterNote
        datetime appliedAt
        datetime updatedAt
    }

    APPLICATION_STATUS_HISTORY {
        string id PK "UUID"
        string applicationId FK
        string fromStatus
        string toStatus
        string changedById FK
        datetime changedAt
    }
```
