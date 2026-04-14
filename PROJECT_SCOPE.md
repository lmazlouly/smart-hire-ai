# Smart Hire AI - Project Scope

## 1. Project Summary

Smart Hire AI is an AI-based recruitment platform.

The goal is to reduce the time, cost, and subjectivity of recruitment by helping:

- candidates build structured profiles from their CVs
- recruiters publish jobs and define hiring criteria
- the platform compare candidates and jobs automatically
- recruiters see ranked candidates instead of reviewing CVs manually

This project is being built as a clean, simple school-style SaaS product.

It should feel professional, but the code must stay easy to read, easy to explain, and easy to extend.

---

## 2. Main Problem

Traditional recruitment is often:

- time-consuming
- expensive
- subjective

Recruiters usually review many CVs manually before finding good candidates.

Smart Hire AI is meant to simplify this process by:

- extracting useful information from CVs
- comparing candidates to job requirements
- generating a compatibility score
- suggesting training when skills are missing

---

## 3. Main Objective

Build an intelligent recruitment platform that automatically helps recruiters identify the best candidates for a job.

---

## 4. Functional Scope

### Candidate Side

- create an account
- upload a CV
- generate a structured candidate profile
- receive job recommendations
- receive training recommendations
- see missing or improvable skills

### Recruiter Side

- create job offers
- define required skills
- define minimum experience
- define education level
- see ranked candidates
- see candidate compatibility scores

### AI / Smart Features

- CV parsing and information extraction
- skill extraction
- intelligent candidate-job matching
- training recommendation for missing skills

---

## 5. Matching Logic

The core matching logic of the project is based on:

- `50%` skills
- `30%` experience
- `20%` education

This logic should stay simple and understandable unless the team explicitly decides to improve it later.

---

## 6. Current Tech Stack

### Frontend

- Angular
- TypeScript
- Tailwind CSS

### Backend

- Java
- Spring Boot
- Maven

### Database

- PostgreSQL
- Spring Data JPA / Hibernate

### AI Service

- Python
- spaCy
- optional Transformers / BERT later if needed

---

## 7. Current Repository Structure

- `frontend-angular/` -> Angular frontend
- `backend/` -> Spring Boot backend
- `ai-service/` -> Python AI service

The Angular frontend is the active frontend direction for the project.

---

## 8. Current Implementation Status

### Backend

Currently implemented:

- health endpoint
- candidate creation and listing
- job creation and listing
- PostgreSQL configuration through local environment variables
- Swagger / OpenAPI
- simple layered structure:
  - `controller`
  - `service`
  - `entity`
  - `repository`
  - `dto`

Current backend endpoints:

- `GET /api/health`
- `POST /api/candidates`
- `GET /api/candidates`
- `POST /api/jobs`
- `GET /api/jobs`

Current main backend models:

- `Candidate`
  - `id`
  - `fullName`
  - `email`
  - `skills`
  - `experienceYears`
  - `educationLevel`
- `Job`
  - `id`
  - `title`
  - `company`
  - `requiredSkills`
  - `minimumExperienceYears`
  - `educationLevel`

### Frontend

Currently implemented:

- landing page
- public home layout
- responsive header
- mobile menu
- bottom navigation for smaller screens

Not implemented yet in a final way:

- authentication
- recruiter dashboard
- candidate dashboard
- CV upload flow
- matching results page
- training recommendations page

### AI Service

Still planned.

The AI service should later handle:

- CV parsing
- skill extraction
- candidate profile enrichment

---

## 9. Planned Project Phases

### Phase 1

- clean backend setup
- candidate and job basic CRUD
- database connection
- Swagger / API docs
- landing page

### Phase 2

- candidate-job matching endpoint
- ranked candidate results
- simple recruiter workflow

### Phase 3

- authentication
- role separation:
  - candidate
  - recruiter

### Phase 4

- CV upload
- Python AI service integration
- automatic extraction from CVs

### Phase 5

- training recommendations
- better job recommendations
- more complete recruiter dashboard

---

## 10. Non-Goals For Now

To keep the project clean and realistic, avoid adding these too early:

- overengineered microservices
- complex event-driven architecture
- advanced caching
- premature optimization
- too many libraries for basic problems
- heavy frontend state management unless really needed
- complex design systems before the real product pages exist

---

## 11. Coding Rules

These rules are important for every developer and every AI assistant working on this project.

### Core Rule

Keep the code simple, clean, and easy to read.

### Mandatory Style Rules

- do not overengineer
- do not add unnecessary abstraction
- do not add "superpowers" when a simple solution is enough
- do not create very large files
- prefer small, understandable changes
- implement feature by feature, not everything at once
- keep naming explicit and boring rather than clever
- write code that another student or junior developer can understand quickly

### File Size Rule

As a project direction:

- try not to exceed `500` lines per file
- avoid going beyond `1000` lines in any file

If a file starts growing too much, split it clearly.

### Architecture Rules

#### Backend

- prefer a simple layered structure:
  - `controller`
  - `service`
  - `entity`
  - `repository`
  - `dto`
- do not create feature folders like `candidate/` or `job/` at the root package level if they make the structure noisier
- do not duplicate the package name unnecessarily
- use Spring Data JPA for database access
- do not introduce Prisma in the Java backend

#### Frontend

- use Angular as the frontend framework
- use Tailwind for styling
- keep components focused and readable
- avoid unnecessary frontend libraries
- build page by page and workflow by workflow
- use route/layout separation when it helps avoid future conflicts

### Secrets Rule

- never commit secrets
- never hardcode database credentials
- use local `.env` files or local environment variables only
- never expose credentials in screenshots, docs, or code comments

### Testing Rule

- do not generate unnecessary test files
- keep testing simple
- only add tests when they are useful or explicitly requested

### Change Management Rule

- do not refactor unrelated code just because it "could be cleaner"
- do not change project direction without agreement
- do not replace the chosen stack unless explicitly requested

---

## 12. Rules For AI-Assisted Development

Anyone using AI to work on this project should follow these instructions:

### Before Coding

- read this file first
- understand the current project phase
- work only on the requested slice
- respect the current stack:
  - Angular frontend
  - Spring Boot backend
  - PostgreSQL database
  - Python AI service later

### While Coding

- keep outputs small and incremental
- avoid huge code dumps
- avoid generating a full platform in one step
- preserve the existing project architecture
- do not introduce complexity that was not requested

### When Adding Features

- prefer one feature per step
- finish one clean workflow before starting another
- keep the implementation explainable
- update docs if the project direction changes

### Good AI Contributions

- clean entity creation
- simple REST endpoints
- readable Angular pages and components
- clear matching logic
- safe database configuration
- small, understandable refactors

### Bad AI Contributions

- massive rewrites
- random dependency additions
- unnecessary patterns
- hidden magic
- code that looks impressive but is hard to maintain

---

## 13. Recommended Contributor Workflow

When working on the project, follow this order:

1. understand the current scope
2. check what is already implemented
3. work on one feature only
4. keep the code simple
5. verify that the project still builds
6. document any important change

Recommended verification:

- backend: `mvn test`
- frontend: `pnpm build`

---

## 14. Expected Product Direction

The final product should present a clean flow:

1. candidate uploads CV or builds profile
2. platform analyzes the candidate
3. recruiter creates a job
4. platform compares candidate data to job requirements
5. platform returns ranked matches
6. platform recommends training when skills are missing

This is the main product story everyone should keep in mind while building.

---

## 15. Source Of Truth

If there is confusion while implementing:

- prioritize simplicity
- prioritize readability
- follow the current stack
- follow the current project phase
- avoid adding anything that has not been clearly requested

This file should be treated as the main shared context document for contributors and AI tools working on Smart Hire AI.
