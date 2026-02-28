# Admission Test & Scholarship Test System — Brutal Analysis & Overview

> **Date:** February 28, 2026
> **Scope:** End-to-end plan for adding Admission Test & Scholarship Test modules to ExamCore
> **Current State:** ExamCore supports internal school exams only — students must already be enrolled in the system

---

## PART 1: BRUTAL ANALYSIS OF CURRENT SYSTEM

### What Currently Exists

ExamCore is a **closed-loop exam system** — only registered students (with `StudentProfile`, `classId`, `sectionId`) can take exams. The entire flow assumes:

1. Admin creates student account → assigns class/section
2. Teacher creates exam → assigns to class/section
3. Student (already enrolled) takes exam → gets graded → sees results

**There is ZERO concept of:**
- External candidates (people NOT enrolled in the school)
- Self-registration / application workflow
- Admission decisions (accept/reject/waitlist)
- Scholarship criteria and evaluation
- Merit-based ranking across external applicants
- Payment/fee integration
- Public-facing test pages (no auth required for registration)
- Multi-stage evaluation (written test → interview → final decision)

### Why This Is a Fundamental Gap

Adding admission/scholarship tests is NOT just "another exam type." It requires:

| Dimension | Current System | Required for Admission/Scholarship |
|-----------|---|---|
| **User lifecycle** | Admin creates user → user exists forever | Applicant self-registers → takes test → may or may not become a student |
| **Auth model** | Credential-based login, pre-created accounts | Temporary token-based access, self-registration, OTP verification |
| **Exam assignment** | Exam → Class/Section (internal) | Exam → Public or Applicant pool (external) |
| **Result usage** | Grades, analytics, report cards | Ranking, merit list, cutoff-based selection, scholarship tiers |
| **Data lifecycle** | Permanent (student records) | Temporary (applicant data, may be purged after cycle) |
| **Access pattern** | Authenticated dashboard | Public landing page → register → take test → check result |
| **Scale** | 500 concurrent enrolled students | 2000-5000+ applicants in admission season, bursty traffic |
| **Security** | Internal network, trusted users | Public internet, potential abuse, DDoS risk on registration |

### Current Architecture Constraints

| Constraint | Impact | Mitigation Strategy |
|---|---|---|
| **User model requires `classId`/`sectionId`** for students | Applicants don't have a class yet | New `Applicant` model separate from `User` |
| **ExamClassAssignment** ties exams to classes | Admission tests aren't assigned to classes | New `TestCampaign` concept with public access tokens |
| **Session requires `studentId` (FK → User)** | Applicants aren't `User` entities yet | Separate `ApplicantTestSession` model |
| **Grading engine assumes internal exam flow** | Need same grading for admission tests | Abstract grading into shared service layer |
| **Middleware blocks all unauthenticated access** | Applicants need public-facing pages | New `(public)` route group for admission portal |
| **No email/notification triggers** | Need to email applicants results, interview calls | Email service is partially built (Resend setup exists) |

### What We CAN Reuse

Despite the gaps, significant infrastructure can be shared:

| Component | Reusability | Adaptation Needed |
|---|---|---|
| **Question Bank** | 100% — questions are subject-agnostic | Add `isAdmissionQuestion` flag or use tags |
| **MCQ Auto-Grading** | 100% — same `autoGradeMcqAnswers()` logic | Wire to `ApplicantTestSession` |
| **AI Grading Engine** | 100% — same `aiGradeShortAnswer()`/`aiGradeLongAnswer()` | Wire to applicant answers |
| **Exam Timer + Auto-Save** | 90% — UI components reusable | New wrapper for applicant sessions |
| **Anti-Cheat System** | 100% — same tab-switch, fullscreen, copy-block | Wire to admission test UI |
| **Result Calculation** | 80% — `calculateResult()` is generic | Add ranking/cutoff logic on top |
| **Notification System** | 70% — model exists | Extend to email + SMS for external applicants |
| **Analytics Engine** | 60% — charts/stats are generic | New analytics dashboards for admission campaigns |

---

## PART 2: WHAT WE'RE BUILDING

### Two New Exam Categories

#### 1. Admission Test
- **Purpose:** Evaluate external candidates applying for admission to the school
- **Flow:** Applicant registers → takes test → gets ranked → school decides admission
- **Types:** Entry test for specific class (e.g., Class 6 admission test, Class 9 admission test)
- **Features:** Merit list generation, cutoff marks, waitlist management, multi-stage evaluation (optional)

#### 2. Scholarship Test
- **Purpose:** Evaluate candidates (internal OR external) for financial aid / scholarship
- **Flow:** Candidate registers/applies → takes test → scholarship tier assigned based on score
- **Types:** Full scholarship, half scholarship, 25% scholarship, merit-based
- **Features:** Scholarship tier configuration, automatic tier assignment, renewal criteria

### System Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                   EXAMCORE (Existing)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Internal   │  │  Question   │  │  Grading    │               │
│  │  Exams      │  │  Bank       │  │  Engine     │               │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘               │
│        │               │               │                        │
│  ======│===============│===============│========================│
│        │               │               │                        │
│  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐               │
│  │ Admission   │  │  Shared     │  │ Scholarship │               │
│  │ Test Module │  │  Services   │  │ Test Module │               │
│  └─────┬──────┘  └────────────┘  └─────┬──────┘               │
│        │                                │                        │
│  ┌─────┴────────────────────────────────┴──────┐               │
│  │          ADMISSION/SCHOLARSHIP PORTAL         │               │
│  │  (Public-facing, self-registration, results)  │               │
│  └───────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 3: PLAN FILE INDEX

This subdirectory contains the following planning documents:

| File | Title | Description |
|------|-------|-------------|
| `00-brutal-analysis-and-overview.md` | This file | Analysis, scope, reusability assessment |
| `01-database-schema-design.md` | Database Schema | All new models, enums, relations, indexes |
| `02-applicant-lifecycle-flow.md` | Applicant Lifecycle | Registration → test → result → admission decision flowcharts |
| `03-test-campaign-management.md` | Test Campaign System | How admin creates/manages admission & scholarship test campaigns |
| `04-public-portal-design.md` | Public Portal | Self-registration, test-taking, result-checking for external applicants |
| `05-admission-decision-engine.md` | Admission Decision | Merit lists, cutoffs, waitlists, acceptance workflow |
| `06-scholarship-tier-system.md` | Scholarship System | Tier configuration, auto-assignment, renewal logic |
| `07-api-actions-design.md` | API & Server Actions | All actions, routes, input/output contracts |
| `08-security-anti-abuse.md` | Security & Anti-Abuse | Rate limiting, OTP verification, bot protection, data isolation |
| `09-frontend-pages-components.md` | Frontend Architecture | All new pages, components, layouts, UX flows |
| `10-grading-integration.md` | Grading Integration | How existing grading engine connects to admission/scholarship tests |
| `11-notification-email-system.md` | Notifications & Email | Email/SMS flows for applicants, internal notifications for admin |
| `12-analytics-reporting.md` | Analytics & Reports | Admission analytics, scholarship reports, campaign dashboards |
| `13-scalability-performance.md` | Scalability & Performance | Handling 5000+ concurrent applicants, horizontal scaling strategy |
| `14-implementation-roadmap.md` | Implementation Roadmap | Phase-by-phase, task-by-task execution plan with dependencies |

---

## PART 4: DESIGN PRINCIPLES FOR THIS MODULE

### 1. Complete Isolation
- Applicant data is **completely separate** from enrolled student data
- Separate models, separate sessions, separate results
- No foreign keys between `Applicant` and `User` until admission is confirmed
- When applicant is admitted → **create User + StudentProfile** from applicant data (data migration, not shared reference)

### 2. Shared Service Layer
- Grading engine is abstracted into a **shared service** callable by both internal exams and admission tests
- Question bank is shared — questions tagged for admission are usable in both contexts
- Anti-cheat hooks are shared components

### 3. Public-First Security
- Admission portal is public-facing — hardened against abuse
- Rate limiting on registration, OTP verification, test access
- CAPTCHA on registration
- IP-based throttling during test submission
- Unique access tokens per applicant per test (not session cookies)

### 4. Campaign-Based Architecture
- Everything is organized by "campaigns" (e.g., "Class 6 Admission 2026-27")
- Campaign has start/end dates, eligibility criteria, test definition, result publication date
- Historical campaigns are archived but queryable for analytics
- Multiple campaigns can run simultaneously (admission + scholarship)

### 5. Horizontal Scalability
- Applicant test sessions are stateless (token-based)
- Auto-save uses conflict-free last-write-wins (no locking)
- Result computation is batch-processed (not per-submission)
- Merit list generation is a background job (not blocking UI)
- All queries are paginated from day one
