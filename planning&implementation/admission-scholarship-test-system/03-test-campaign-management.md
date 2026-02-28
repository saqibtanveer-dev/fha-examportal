# Admission Test & Scholarship Test — Test Campaign Management System

> **Date:** February 28, 2026
> **Scope:** How admin creates, configures, and manages test campaigns end-to-end

---

## 1. Campaign Lifecycle State Machine

```
DRAFT → REGISTRATION_OPEN → REGISTRATION_CLOSED → TEST_ACTIVE → TEST_CLOSED → GRADING → RESULTS_READY → RESULTS_PUBLISHED → COMPLETED → ARCHIVED
```

### State Transition Rules

| From | To | Trigger | Validation Required |
|------|-----|---------|---------------------|
| DRAFT | REGISTRATION_OPEN | Admin action "Open Registration" | Questions > 0, dates valid, total marks > 0 |
| REGISTRATION_OPEN | REGISTRATION_CLOSED | Manual or auto (registrationEndAt) | — |
| REGISTRATION_CLOSED | TEST_ACTIVE | Manual or auto (testStartAt) | At least 1 verified applicant |
| TEST_ACTIVE | TEST_CLOSED | Manual or auto (testEndAt) | — (auto-submit all in-progress) |
| TEST_CLOSED | GRADING | Auto on test close | — |
| GRADING | RESULTS_READY | All answers graded | No ungraded answers remain |
| RESULTS_READY | RESULTS_PUBLISHED | Admin action "Publish Results" | Merit list generated |
| RESULTS_PUBLISHED | COMPLETED | Admin marks complete | All decisions made (accept/reject) |
| COMPLETED | ARCHIVED | Admin archives | — |

### Automated Transitions (Cron Jobs)

```typescript
// Scheduled job: runs every 5 minutes
async function processCampaignTransitions() {
  const now = new Date();
  
  // Auto-close registration
  await prisma.testCampaign.updateMany({
    where: { 
      status: 'REGISTRATION_OPEN', 
      registrationEndAt: { lte: now } 
    },
    data: { status: 'REGISTRATION_CLOSED' }
  });
  
  // Auto-activate test
  await prisma.testCampaign.updateMany({
    where: { 
      status: 'REGISTRATION_CLOSED', 
      testStartAt: { lte: now } 
    },
    data: { status: 'TEST_ACTIVE' }
  });
  
  // Auto-close test + auto-submit all in-progress sessions
  const expiredCampaigns = await prisma.testCampaign.findMany({
    where: { status: 'TEST_ACTIVE', testEndAt: { lte: now } }
  });
  for (const campaign of expiredCampaigns) {
    await autoCloseAndSubmitCampaign(campaign.id);
  }
  
  // Expire unverified applicants past registration window
  await prisma.applicant.updateMany({
    where: {
      status: 'REGISTERED',
      campaign: { registrationEndAt: { lte: now } }
    },
    data: { status: 'EXPIRED' }
  });
}
```

---

## 2. Campaign Creation Wizard (Admin UI)

### Step 1: Basic Information

```
┌──────────────────────────────────────────────────────┐
│ Create Test Campaign                    Step 1 of 5  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Campaign Name*     [Class 6 Admission Test 2026-27] │
│  URL Slug*          [class-6-admission-2026-27]      │
│                     Auto-generated, editable          │
│                                                       │
│  Campaign Type*     ○ Admission Test                  │
│                     ○ Scholarship Test                │
│                     ● Admission + Scholarship          │
│                                                       │
│  Academic Session   [2026-2027 ▼]                    │
│  Target Class       [Class 6 ▼]                      │
│  Maximum Seats      [120]           (leave empty = no limit)
│                                                       │
│  Description        [Rich text editor]                │
│                                                       │
│                                      [Next Step →]    │
└──────────────────────────────────────────────────────┘
```

### Step 2: Dates & Configuration

```
┌──────────────────────────────────────────────────────┐
│ Test Configuration                      Step 2 of 5  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Registration Period                                  │
│  ├── Start: [2026-03-01 09:00 ▼]                     │
│  └── End:   [2026-03-15 23:59 ▼]                     │
│                                                       │
│  Test Window                                          │
│  ├── Start: [2026-03-20 10:00 ▼]                     │
│  └── End:   [2026-03-20 12:00 ▼]                     │
│  Note: All applicants must start within this window    │
│                                                       │
│  Test Duration:     [90] minutes                      │
│  Total Marks:       [auto-calculated from questions]   │
│  Passing Marks:     [40] marks                        │
│                                                       │
│  ☑ Shuffle Questions                                  │
│  ☑ Shuffle MCQ Options                                │
│  ☐ Allow Calculator                                   │
│  ☑ Negative Marking                                   │
│    Deduction per wrong MCQ: [-0.25] marks             │
│                                                       │
│  Result Publish Date: [2026-03-25 00:00 ▼]           │
│  ☑ Show Score to Applicant                            │
│  ☑ Show Rank to Applicant                             │
│  ☐ Show Cutoff to Applicant                           │
│                                                       │
│  Instructions (shown before test):                    │
│  [Rich text: rules, requirements, what to bring...]   │
│                                                       │
│  Eligibility Criteria (optional):                     │
│  ├── Minimum Age: [10]                                │
│  ├── Maximum Age: [13]                                │
│  ├── Previous Grade Minimum: [60%]                    │
│  └── Required Documents: [☑ Birth Cert] [☑ Report Card]
│                                                       │
│                           [← Back] [Next Step →]      │
└──────────────────────────────────────────────────────┘
```

### Step 3: Questions

```
┌──────────────────────────────────────────────────────┐
│ Test Questions                          Step 3 of 5  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │ Section A: MCQ                    60 marks   │     │
│  │ ┌────┬─────────────────────┬──────┬────────┐│     │
│  │ │ #  │ Question             │ Type │ Marks  ││     │
│  │ ├────┼─────────────────────┼──────┼────────┤│     │
│  │ │ 1  │ What is 2+2?         │ MCQ  │ 2      ││     │
│  │ │ 2  │ Capital of Pakistan? │ MCQ  │ 2      ││     │
│  │ │... │ ...                  │ ...  │ ...    ││     │
│  │ │ 30 │ Largest planet?      │ MCQ  │ 2      ││     │
│  │ └────┴─────────────────────┴──────┴────────┘│     │
│  │ [+ Add from Bank] [+ Create New] [↕ Reorder]│     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │ Section B: Short Answer             40 marks │     │
│  │ ┌────┬─────────────────────┬───────┬───────┐│     │
│  │ │ #  │ Question             │ Type  │ Marks ││     │
│  │ ├────┼─────────────────────┼───────┼───────┤│     │
│  │ │ 31 │ Explain photosyn... │ SHORT │ 5     ││     │
│  │ │ 32 │ Define democracy... │ SHORT │ 5     ││     │
│  │ │... │ ...                  │ ...   │ ...   ││     │
│  │ │ 38 │ Solve: 3x + 5 = 14 │ SHORT │ 5     ││     │
│  │ └────┴─────────────────────┴───────┴───────┘│     │
│  │ [+ Add from Bank] [+ Create New] [↕ Reorder]│     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  [+ Add Section]                                      │
│                                                       │
│  Summary: 38 questions, 100 total marks               │
│                                                       │
│                           [← Back] [Next Step →]      │
└──────────────────────────────────────────────────────┘
```

### Step 4: Scholarship Tiers (if applicable)

```
┌──────────────────────────────────────────────────────┐
│ Scholarship Tiers                       Step 4 of 5  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────┬──────────────────┬────────┬─────┬──────────┐ │
│  │ #  │ Tier Name         │ Min %  │Max #│ Benefit   │ │
│  ├────┼──────────────────┼────────┼─────┼──────────┤ │
│  │ 1  │ Full Scholarship  │ 90%    │ 5   │ 100% off │ │
│  │ 2  │ 75% Scholarship   │ 80%    │ 10  │ 75% off  │ │
│  │ 3  │ 50% Scholarship   │ 70%    │ 20  │ 50% off  │ │
│  │ 4  │ 25% Scholarship   │ 60%    │ 30  │ 25% off  │ │
│  └────┴──────────────────┴────────┴─────┴──────────┘ │
│                                                       │
│  [+ Add Tier]                                         │
│                                                       │
│  Note: Tiers are evaluated top-to-bottom.             │
│  An applicant gets the HIGHEST tier they qualify for.  │
│                                                       │
│                           [← Back] [Next Step →]      │
└──────────────────────────────────────────────────────┘
```

### Step 5: Review & Create

```
┌──────────────────────────────────────────────────────┐
│ Review Campaign                         Step 5 of 5  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  📋 Campaign: Class 6 Admission Test 2026-27          │
│  Type: Admission + Scholarship                        │
│  Target: Class 6 | Max Seats: 120                    │
│                                                       │
│  📅 Dates:                                            │
│  Registration: Mar 1 - Mar 15, 2026                  │
│  Test Window: Mar 20, 2026 (10:00 - 12:00)           │
│  Duration: 90 minutes                                 │
│  Results: Mar 25, 2026                                │
│                                                       │
│  📝 Questions: 38 (30 MCQ + 8 Short Answer)          │
│  Total Marks: 100 | Passing: 40                      │
│  Negative Marking: -0.25 per wrong MCQ                │
│                                                       │
│  🏆 Scholarship Tiers: 4 tiers configured             │
│  Max Recipients: 65 (5+10+20+30)                     │
│                                                       │
│              [← Back] [Save as Draft] [Create & Open] │
└──────────────────────────────────────────────────────┘
```

---

## 3. Campaign Dashboard (Admin View)

```
┌──────────────────────────────────────────────────────────┐
│ Class 6 Admission Test 2026-27                           │
│ Status: ● TEST_ACTIVE                                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 342      │ │ 312      │ │ 156      │ │ 68:42    │    │
│  │ Registered│ │ Verified  │ │ Started  │ │ Avg Time │    │
│  └─────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 89       │ │ 67       │ │ 23       │ │ 5        │    │
│  │ Submitted │ │ In Progr. │ │ Not Start│ │ Flagged  │    │
│  └─────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Live Session Monitor                  🔄 Auto-ref │    │
│  │ ┌─────┬──────────────┬────────┬─────┬──────────┐│    │
│  │ │ App#│ Name          │ Status │ Q   │ Flags    ││    │
│  │ ├─────┼──────────────┼────────┼─────┼──────────┤│    │
│  │ │ 0042│ Ahmed Khan    │ Active │15/38│ 0 tabs   ││    │
│  │ │ 0156│ Sara Ali      │ Active │32/38│ ⚠️ 3 tabs ││    │
│  │ │ 0089│ Usman Raza    │ Submit │38/38│ ✓ Clean  ││    │
│  │ └─────┴──────────────┴────────┴─────┴──────────┘│    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  Actions:                                                 │
│  [Close Test Now] [Extend Time +30min] [Export Applicants]│
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Campaign Actions (Server Actions)

### Campaign CRUD

| Action | Input | Validation | Side Effects |
|--------|-------|-----------|-------------|
| `createCampaignAction` | Campaign data (all steps) | Dates valid, slug unique, questions exist | Create campaign + questions + tiers |
| `updateCampaignAction` | CampaignId + updates | Only DRAFT campaigns editable for structure changes | Update campaign |
| `deleteCampaignAction` | CampaignId | Only DRAFT, no applicants | Hard delete |

### Campaign Lifecycle Actions

| Action | Input | Validation | Side Effects |
|--------|-------|-----------|-------------|
| `openRegistrationAction` | CampaignId | Status = DRAFT, questions > 0, dates in future | Status → REGISTRATION_OPEN |
| `closeRegistrationAction` | CampaignId | Status = REGISTRATION_OPEN | Status → REGISTRATION_CLOSED |
| `activateTestAction` | CampaignId | Status = REGISTRATION_CLOSED, ≥1 verified | Status → TEST_ACTIVE |
| `closeTestAction` | CampaignId | Status = TEST_ACTIVE | Auto-submit all in-progress, Status → TEST_CLOSED |
| `triggerGradingAction` | CampaignId | Status = TEST_CLOSED | Queue grading jobs, Status → GRADING |
| `generateMeritListAction` | CampaignId | Status ≥ RESULTS_READY | Compute ranks, apply cutoffs, assign scholarships |
| `publishResultsAction` | CampaignId | Merit list generated | Status → RESULTS_PUBLISHED, email all applicants |
| `completeCampaignAction` | CampaignId | All decisions made | Status → COMPLETED |
| `archiveCampaignAction` | CampaignId | Status = COMPLETED | Status → ARCHIVED |

### Applicant Management Actions

| Action | Input | Validation | Side Effects |
|--------|-------|-----------|-------------|
| `acceptApplicantAction` | ApplicantId, classId, sectionId | Status = SHORTLISTED | Decision logged, status → ACCEPTED |
| `rejectApplicantAction` | ApplicantId, remarks | Status ∈ [SHORTLISTED, INTERVIEW_SCHEDULED] | Decision logged, status → REJECTED |
| `waitlistApplicantAction` | ApplicantId | Status = SHORTLISTED | Decision logged, status → WAITLISTED |
| `bulkAcceptAction` | ApplicantIds[], classId, sectionId | All shortlisted | Batch accept |
| `convertToStudentAction` | ApplicantId | Status = ACCEPTED | Create User + StudentProfile, status → ENROLLED |
| `bulkConvertToStudentsAction` | ApplicantIds[] | All accepted | Batch enrollment |
| `awardScholarshipAction` | ApplicantId, tierId | Status ∈ [ACCEPTED, SHORTLISTED] | Create ApplicantScholarship |
| `autoAssignScholarshipsAction` | CampaignId | Status ≥ RESULTS_READY | Auto-assign all eligible applicants |

---

## 5. Question Bank Integration

### How Questions Are Shared

The existing `Question` model is reused for campaigns. Questions are linked via `CampaignQuestion` (similar to `ExamQuestion` for internal exams).

```
Question Bank (shared)
├── Internal Exam uses ExamQuestion (FK → Question)
└── Admission/Scholarship Test uses CampaignQuestion (FK → Question)
```

### Question Selection UI for Campaign

```typescript
// Admin selects questions from bank with filters:
interface QuestionPickerFilters {
  subjectId?: string;      // Filter by subject
  classId?: string;        // Filter by class level
  type?: QuestionType;     // MCQ | SHORT | LONG
  difficulty?: Difficulty;  // EASY | MEDIUM | HARD
  tagIds?: string[];       // Filter by tags
  search?: string;         // Full-text search
  excludeIds?: string[];   // Exclude already-added questions
}
```

### Tagging Strategy for Admission Questions

Use existing tag system with new tags:

```
Tag: "admission-test" (CUSTOM category)
Tag: "scholarship-test" (CUSTOM category)
Tag: "class-6-level" (CUSTOM category)
Tag: "class-9-level" (CUSTOM category)
Tag: "general-knowledge" (TOPIC category)
Tag: "aptitude" (TOPIC category)
Tag: "reasoning" (TOPIC category)
```

This allows teachers to tag questions as suitable for admission tests while still using them in internal exams too.

---

## 6. Campaign Scheduling Architecture

### Cron Job Design

```typescript
// Two approaches — choose based on deployment:

// Option A: Vercel Cron (if deployed on Vercel)
// vercel.json:
{
  "crons": [{
    "path": "/api/cron/campaign-transitions",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}

// Option B: BullMQ Scheduled Jobs (if self-hosted)
// Campaign-specific scheduled jobs:
queue.add('close-registration', { campaignId }, {
  delay: registrationEndAt.getTime() - Date.now()
});
queue.add('activate-test', { campaignId }, {
  delay: testStartAt.getTime() - Date.now()
});
queue.add('close-test', { campaignId }, {
  delay: testEndAt.getTime() - Date.now()
});
queue.add('publish-results', { campaignId }, {
  delay: resultPublishAt.getTime() - Date.now()
});
```

### Auto-Submit on Test Close

When test window closes while applicants are still taking the test:

```typescript
async function autoCloseAndSubmitCampaign(campaignId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Find all in-progress sessions
    const activeSessions = await tx.applicantTestSession.findMany({
      where: { campaignId, status: 'IN_PROGRESS' }
    });
    
    // 2. Mark all as SUBMITTED (timed out)
    await tx.applicantTestSession.updateMany({
      where: { 
        campaignId, 
        status: 'IN_PROGRESS' 
      },
      data: { 
        status: 'SUBMITTED', 
        submittedAt: new Date() 
      }
    });
    
    // 3. Update applicant statuses
    const applicantIds = activeSessions.map(s => s.applicantId);
    await tx.applicant.updateMany({
      where: { id: { in: applicantIds } },
      data: { status: 'TEST_COMPLETED' }
    });
    
    // 4. Update campaign status
    await tx.testCampaign.update({
      where: { id: campaignId },
      data: { status: 'TEST_CLOSED' }
    });
  });
  
  // 5. Trigger grading for all submitted sessions
  await triggerBatchGrading(campaignId);
}
```
