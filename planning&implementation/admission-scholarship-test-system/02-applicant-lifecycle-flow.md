# Admission Test & Scholarship Test — Applicant Lifecycle Flow

> **Date:** February 28, 2026
> **Scope:** Complete state machine and flow diagrams for applicant journey

---

## 1. Complete Applicant State Machine

```
                     ┌─────────────┐
                     │  REGISTERED  │ ← Self-registration on portal
                     └──────┬──────┘
                            │ Email/OTP verification
                            ▼
                     ┌─────────────┐
              ┌──────│  VERIFIED    │──────┐
              │      └──────┬──────┘      │
              │             │              │ (campaign registration closed
              │             │ Test window  │  or applicant withdraws)
              │             │ opens        │
              │             ▼              ▼
              │      ┌───────────────┐  ┌──────────┐
              │      │TEST_IN_PROGRESS│  │ WITHDRAWN │
              │      └──────┬────────┘  └──────────┘
              │             │
              │             │ Submit / Auto-submit on timeout
              │             ▼
              │      ┌───────────────┐
              │      │TEST_COMPLETED  │
              │      └──────┬────────┘
              │             │ Grading begins (MCQ instant + AI async)
              │             ▼
              │      ┌─────────────┐
              │      │   GRADED     │
              │      └──────┬──────┘
              │             │ Admin publishes results
              │             ▼
              │     ┌───────┴────────────────────────────┐
              │     │                                     │
              │     ▼                                     ▼
              │  ┌────────────┐                   ┌─────────────┐
              │  │ SHORTLISTED │                   │  REJECTED    │
              │  └──────┬─────┘                   └─────────────┘
              │         │
              │         │ (If multi-stage: interview scheduled)
              │         ▼
              │  ┌──────────────────────┐
              │  │ INTERVIEW_SCHEDULED   │ (optional — skip if single-stage)
              │  └──────────┬───────────┘
              │             │
              │     ┌───────┴────────┐
              │     ▼                ▼
              │  ┌──────────┐  ┌──────────┐
              │  │ ACCEPTED  │  │ REJECTED  │
              │  └─────┬────┘  └──────────┘
              │        │                ▲
              │        │                │
              │        ▼                │
              │  ┌──────────┐   ┌──────────┐
              │  │ ENROLLED   │  │WAITLISTED │──── (if seat opens) ────→ ACCEPTED
              │  └──────────┘   └──────────┘
              │
              │ (Registration expired, never completed test)
              └──────────────────→ ┌──────────┐
                                   │ EXPIRED   │
                                   └──────────┘
```

### Valid State Transitions

| From | To | Trigger | Actor |
|------|-----|---------|-------|
| — | REGISTERED | Self-registration | Applicant |
| REGISTERED | VERIFIED | OTP verification | Applicant |
| REGISTERED | EXPIRED | Registration window closes | System (cron) |
| VERIFIED | TEST_IN_PROGRESS | Start test | Applicant |
| VERIFIED | WITHDRAWN | Withdraw application | Applicant |
| VERIFIED | EXPIRED | Test window closes without attempt | System (cron) |
| TEST_IN_PROGRESS | TEST_COMPLETED | Submit test / Auto-submit on timeout | Applicant / System |
| TEST_COMPLETED | GRADED | Grading completes | System |
| GRADED | SHORTLISTED | Above cutoff + admin approval | Admin |
| GRADED | REJECTED | Below cutoff | Admin / Auto |
| SHORTLISTED | INTERVIEW_SCHEDULED | Interview set (optional) | Admin |
| SHORTLISTED | ACCEPTED | Direct acceptance (single-stage) | Admin |
| SHORTLISTED | REJECTED | Rejected after review | Admin |
| INTERVIEW_SCHEDULED | ACCEPTED | Passed interview | Admin |
| INTERVIEW_SCHEDULED | REJECTED | Failed interview | Admin |
| INTERVIEW_SCHEDULED | WAITLISTED | Conditional | Admin |
| ACCEPTED | ENROLLED | Admin converts to student | Admin |
| WAITLISTED | ACCEPTED | Seat becomes available | Admin |
| Any | WITHDRAWN | Applicant withdraws | Applicant |

---

## 2. Registration Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC PORTAL: /admission                     │
│                                                                  │
│  1. Applicant visits /admission                                  │
│     → See list of open campaigns (cards with details)            │
│                                                                  │
│  2. Clicks "Apply Now" on a campaign                             │
│     → /admission/[slug]/register                                 │
│                                                                  │
│  3. Registration Form:                                           │
│     ┌────────────────────────────────────────────────┐          │
│     │ Step 1: Personal Information                    │          │
│     │ ├── First Name* / Last Name*                    │          │
│     │ ├── Email* / Phone                              │          │
│     │ ├── Date of Birth / Gender                      │          │
│     │ ├── Guardian Name / Guardian Phone              │          │
│     │ └── Address / City                              │          │
│     │                                                  │          │
│     │ Step 2: Academic Background                      │          │
│     │ ├── Previous School Name                         │          │
│     │ ├── Previous Class / Grade                       │          │
│     │ └── Last Grade/Percentage                        │          │
│     │                                                  │          │
│     │ Step 3: Document Upload (optional)               │          │
│     │ ├── Photo                                        │          │
│     │ ├── Birth Certificate                            │          │
│     │ └── Previous Report Card                         │          │
│     │                                                  │          │
│     │ [CAPTCHA]                                        │          │
│     │ [Submit Application]                             │          │
│     └────────────────────────────────────────────────┘          │
│                                                                  │
│  4. Server validates:                                            │
│     → Email uniqueness within this campaign                      │
│     → Age eligibility (if criteria set)                          │
│     → Registration window still open                             │
│     → Rate limit: max 3 registrations per IP per hour            │
│                                                                  │
│  5. Create Applicant record:                                     │
│     → Status: REGISTERED                                         │
│     → Generate applicationNumber: "ADM-2026-0001"                │
│     → Generate accessToken (UUID v4)                             │
│     → Set accessTokenExpiresAt (campaign testEndAt + 24h)        │
│                                                                  │
│  6. Send verification email/SMS:                                 │
│     → 6-digit OTP to email                                       │
│     → "Your application number is ADM-2026-0001"                 │
│     → "Verify your email to proceed"                             │
│                                                                  │
│  7. OTP Verification:                                            │
│     → /admission/[slug]/verify?email=...                         │
│     → 3 attempts max, then regenerate OTP                        │
│     → On success: status → VERIFIED                              │
│     → Show: "Your access link for the test will be emailed"      │
│                                                                  │
│  8. Post-verification email:                                     │
│     → Test date/time                                             │
│     → Unique test access link: /admission/[slug]/test?token=...  │
│     → Instructions                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Test-Taking Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│              TEST-TAKING: /admission/[slug]/test                 │
│                                                                  │
│  1. Applicant clicks unique link (from email)                    │
│     → ?token=<accessToken>                                       │
│     → Validate: token exists, not expired, status = VERIFIED     │
│     → Show test instructions page                                │
│                                                                  │
│  2. Instructions Page:                                           │
│     ┌────────────────────────────────────────────────┐          │
│     │ 📋 Class 6 Admission Test 2026-27              │          │
│     │                                                  │          │
│     │ Duration: 90 minutes                             │          │
│     │ Total Questions: 50                              │          │
│     │ Total Marks: 100                                 │          │
│     │ Sections: MCQ (60 marks), Short Answer (40 marks)│          │
│     │                                                  │          │
│     │ ⚠️ Rules:                                        │          │
│     │ • Do not switch tabs                             │          │
│     │ • Full screen mode required                      │          │
│     │ • No copy-paste allowed                          │          │
│     │ • Negative marking: -0.25 per wrong MCQ          │          │
│     │                                                  │          │
│     │ ☑ I agree to the terms                           │          │
│     │ [Start Test]                                     │          │
│     └────────────────────────────────────────────────┘          │
│                                                                  │
│  3. Start Test:                                                  │
│     → Create ApplicantTestSession                                │
│     → Generate shuffled question order (if enabled)              │
│     → Generate shuffled option orders per MCQ (if enabled)       │
│     → Request fullscreen mode                                    │
│     → Start timer                                                │
│     → Status: VERIFIED → TEST_IN_PROGRESS                        │
│                                                                  │
│  4. Test Interface (same as internal exams but branded):         │
│     ┌──────────────────────────────────────────────────┐        │
│     │ Admission Test    Q 5/50    ⏱ 82:15 remaining    │        │
│     ├──────────────┬───────────────────────────────────┤        │
│     │  Questions    │                                   │        │
│     │  ┌──┐ ┌──┐   │  Question 5                       │        │
│     │  │✓1│ │✓2│   │  Which of the following...?        │        │
│     │  └──┘ └──┘   │                                   │        │
│     │  ┌──┐ ┌──┐   │  ○ A) Option text                 │        │
│     │  │✓3│ │✓4│   │  ● B) Option text                 │        │
│     │  └──┘ └──┘   │  ○ C) Option text                 │        │
│     │  ┌──┐ ...    │  ○ D) Option text                 │        │
│     │  │►5│        │                                   │        │
│     │  └──┘        │  ☐ Mark for review                │        │
│     │              │                                   │        │
│     │  Legend:      │  [← Previous] [Next →]            │        │
│     │  ✓ Answered   │                                   │        │
│     │  ► Current    │  Auto-saved 30s ago               │        │
│     │  ⚑ Flagged    │                                   │        │
│     └──────────────┴───────────────────────────────────┘        │
│                                                                  │
│  5. Auto-Save:                                                   │
│     → Every 60 seconds: batch save all dirty answers             │
│     → On each answer change: debounced save (5s)                 │
│     → Heartbeat every 30s (detect disconnection)                 │
│                                                                  │
│  6. Submission:                                                  │
│     → Review screen: summary of answered/unanswered/flagged      │
│     → Confirm submit dialog                                      │
│     → On submit OR timeout:                                      │
│       a. Save all remaining answers                              │
│       b. Mark session SUBMITTED → TEST_COMPLETED                 │
│       c. Trigger grading (MCQ instant, AI async)                 │
│       d. Show "Test submitted" confirmation page                 │
│       e. Email confirmation with "Results will be available on X"│
│                                                                  │
│  7. Anti-Cheat Events:                                           │
│     → Tab switch: log + increment counter                        │
│     → Fullscreen exit: log + show warning overlay                │
│     → Copy attempt: blocked + increment counter                  │
│     → If tabSwitchCount > 5: auto-flag session                   │
│     → All metrics visible to admin in grading review             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Post-Test Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   POST-TEST PROCESSING                           │
│                                                                  │
│  Phase 1: Grading (Automatic)                                    │
│  ├── MCQ auto-grading (instant, on submit)                       │
│  │   └── Compare selectedOptionId with isCorrect                 │
│  │   └── Apply negative marking if campaign.negativeMarking      │
│  │   └── Save ApplicantAnswerGrade (gradedBy: SYSTEM)            │
│  │                                                               │
│  ├── Short Answer AI grading (async)                             │
│  │   └── Queue grading job per answer                            │
│  │   └── Use same AI engine as internal exams                    │
│  │   └── Save grade with confidence score                        │
│  │                                                               │
│  ├── Long Answer AI grading (async)                              │
│  │   └── Queue grading job per answer                            │
│  │   └── Rubric-based AI evaluation                              │
│  │   └── Flag low-confidence answers for manual review           │
│  │                                                               │
│  └── All graded → Status: GRADED                                 │
│      └── Compute ApplicantResult (total, %, rank)                │
│                                                                  │
│  Phase 2: Review (Admin/Teacher)                                 │
│  ├── Admin reviews flagged answers                               │
│  ├── Admin reviews anti-cheat flags                              │
│  ├── Override AI grades if needed                                │
│  └── Recalculate results if grades modified                      │
│                                                                  │
│  Phase 3: Merit List Generation (Admin)                          │
│  ├── Generate ranked merit list                                  │
│  │   └── Primary sort: percentage DESC                           │
│  │   └── Tiebreaker 1: fewer negative marks                     │
│  │   └── Tiebreaker 2: less time spent (faster = higher)        │
│  │   └── Tiebreaker 3: earlier submission time                   │
│  ├── Apply cutoff marks                                          │
│  │   └── Above cutoff → SHORTLISTED                              │
│  │   └── Below cutoff → REJECTED                                 │
│  ├── Apply scholarship tiers                                     │
│  │   └── ≥90% → FULL_100                                         │
│  │   └── ≥80% → SEVENTY_FIVE                                     │
│  │   └── ≥70% → HALF_50                                          │
│  │   └── ≥60% → QUARTER_25                                       │
│  │   └── <60% → NONE                                             │
│  └── Assign waitlist positions                                   │
│                                                                  │
│  Phase 4: Result Publication (Admin)                             │
│  ├── Admin clicks "Publish Results"                              │
│  ├── Results become visible on public portal                     │
│  ├── Email all applicants their result                           │
│  │   └── Accepted: "Congratulations! Admission offered."         │
│  │   └── Waitlisted: "You are #X on the waitlist."              │
│  │   └── Rejected: "Thank you for applying."                     │
│  │   └── Scholarship: "You've been awarded X% scholarship!"      │
│  └── Public merit list page (if configured)                      │
│                                                                  │
│  Phase 5: Enrollment (Admin)                                     │
│  ├── Admin selects accepted applicants                           │
│  ├── "Convert to Student" action:                                │
│  │   └── Create User (email, generated password, role: STUDENT)  │
│  │   └── Create StudentProfile (classId, sectionId, rollNumber)  │
│  │   └── Copy applicant data to student record                   │
│  │   └── Mark Applicant status → ENROLLED                        │
│  │   └── Email student: "Welcome! Here are your login details"   │
│  └── Bulk enrollment support                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Applicant Self-Service Portal

```
/admission/                                → Campaign listing
/admission/[slug]                          → Campaign detail + Apply button
/admission/[slug]/register                 → Registration form
/admission/[slug]/verify                   → OTP verification
/admission/[slug]/test?token=<accessToken> → Test-taking (token-based auth)
/admission/[slug]/result?token=<accessToken>&app=<applicationNumber>
                                           → Check result (after publication)
/admission/track?app=<applicationNumber>&email=<email>
                                           → Track application status
```

### Result Checking Flow

```
Applicant visits /admission/[slug]/result
  → Enter application number + registered email
  → Server validates: application exists, email matches, results published
  → Shows:
    ┌─────────────────────────────────────────────┐
    │  📊 Your Admission Test Result               │
    │                                              │
    │  Application: ADM-2026-0001                  │
    │  Name: Ahmed Khan                            │
    │  Campaign: Class 6 Admission 2026-27         │
    │                                              │
    │  ┌──────────────────────────────────────┐    │
    │  │  Total Marks: 100                    │    │
    │  │  Obtained: 78/100 (78%)              │    │
    │  │  Rank: 15 / 342 applicants           │    │
    │  │  Status: ✅ SHORTLISTED               │    │
    │  │                                      │    │
    │  │  Scholarship: 50% Scholarship        │    │
    │  └──────────────────────────────────────┘    │
    │                                              │
    │  Section Breakdown:                          │
    │  ├── Section A (MCQ): 45/60                  │
    │  └── Section B (Short Ans): 33/40            │
    │                                              │
    │  Next Steps:                                 │
    │  "Please visit the school office with         │
    │   original documents by March 15, 2026"       │
    └─────────────────────────────────────────────┘
```

---

## 6. Admin Campaign Management Flow

```
Admin Dashboard → Admission Tests (new sidebar item)
  │
  ├── Campaign List (/admin/admission-tests)
  │   └── Table: name, type, status, registration count, test dates, actions
  │
  ├── Create Campaign (/admin/admission-tests/new)
  │   └── Multi-step wizard:
  │       Step 1: Basic Info (name, type, target class, dates)
  │       Step 2: Test Configuration (duration, marks, negative marking, etc.)
  │       Step 3: Add Questions (from question bank, with sections)
  │       Step 4: Scholarship Tiers (if applicable)
  │       Step 5: Review & Create
  │
  ├── Campaign Detail (/admin/admission-tests/[campaignId])
  │   └── Tabs:
  │       ├── Overview (status, stats, dates)
  │       ├── Applicants (table with status filters)
  │       ├── Questions (manage test questions)
  │       ├── Results (after grading)
  │       ├── Merit List (ranked list with actions)
  │       ├── Scholarship Awards
  │       └── Settings (edit campaign config)
  │
  ├── Applicant Detail (/admin/admission-tests/[campaignId]/applicants/[applicantId])
  │   └── Full applicant info, test answers, grades, anti-cheat metrics, decision history
  │
  └── Actions:
      ├── Open Registration
      ├── Close Registration
      ├── Activate Test
      ├── Close Test
      ├── Run Grading
      ├── Generate Merit List
      ├── Publish Results
      ├── Accept / Reject / Waitlist applicants
      ├── Award Scholarships
      ├── Convert to Students (bulk enrollment)
      └── Archive Campaign
```
