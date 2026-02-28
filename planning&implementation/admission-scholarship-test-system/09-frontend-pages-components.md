# Admission Test & Scholarship Test — Frontend Pages & Components

> **Date:** February 28, 2026
> **Scope:** All new pages, reusable components, layout structure, UI patterns

---

## 1. New Route Structure

### Admin Dashboard Routes

```
src/app/(dashboard)/admin/admissions/
├── page.tsx                                    # Campaign list dashboard
├── layout.tsx                                  # Admissions layout with sidebar nav
├── campaigns/
│   ├── page.tsx                                # All campaigns (table view)
│   ├── new/
│   │   └── page.tsx                            # Create campaign wizard
│   └── [campaignId]/
│       ├── page.tsx                            # Campaign overview/detail
│       ├── layout.tsx                          # Campaign detail layout with tabs
│       ├── questions/
│       │   └── page.tsx                        # Question assignment interface
│       ├── tiers/
│       │   └── page.tsx                        # Scholarship tier configuration
│       ├── applicants/
│       │   ├── page.tsx                        # Applicant list table
│       │   └── [applicantId]/
│       │       └── page.tsx                    # Individual applicant detail
│       ├── grading/
│       │   └── page.tsx                        # Grading dashboard
│       ├── merit/
│       │   └── page.tsx                        # Merit list + decision actions
│       ├── scholarships/
│       │   └── page.tsx                        # Scholarship assignments
│       ├── enrollment/
│       │   └── page.tsx                        # Applicant → Student conversion
│       └── analytics/
│           └── page.tsx                        # Campaign analytics
```

### Public Portal Routes

```
src/app/(public)/apply/
├── page.tsx                                    # Campaign listing
├── layout.tsx                                  # Public portal layout (no auth sidebar)
└── [slug]/
    ├── page.tsx                                # Campaign detail + "Apply Now"
    ├── register/
    │   └── page.tsx                            # Registration form
    ├── verify/
    │   └── page.tsx                            # OTP verification
    └── test/
        └── page.tsx                            # Test taking interface

src/app/(public)/results/
├── page.tsx                                    # Result checker form
└── [token]/
    └── page.tsx                                # Individual result display

src/app/(public)/track/
└── [token]/
    └── page.tsx                                # Application status tracker
```

---

## 2. Admin Pages — Detailed Specifications

### 2.1 Campaign List Dashboard

**Route:** `/admin/admissions`

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📋 Admission & Scholarship Tests                                    │
│                                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ 12       │ │ 3        │ │ 847      │ │ 156      │               │
│ │ Total    │ │ Active   │ │ Total    │ │ Accepted │               │
│ │ Campaigns│ │ Now      │ │ Applicant│ │          │               │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│ [+ Create New Campaign]                                              │
│                                                                      │
│ Filter: [All Types ▾] [All Status ▾] [Session: 2025-26 ▾]          │
│                                                                      │
│ ┌─────────────────┬────────┬────────┬──────────┬─────────┬────────┐│
│ │ Campaign         │ Type   │ Status │ Applied  │ Seats   │ Action ││
│ ├─────────────────┼────────┼────────┼──────────┼─────────┼────────┤│
│ │ Class 6 Adm 26  │ Both   │ Active │ 234/500  │ 120     │ [View] ││
│ │ Grade 9 Scholar │ Schol. │ Draft  │ 0/300    │ —       │ [Edit] ││
│ │ Class 1 Entry   │ Adm.   │ Closed │ 189/200  │ 60      │ [View] ││
│ └─────────────────┴────────┴────────┴──────────┴─────────┴────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `CampaignStatsCards` — 4 stat cards with TanStack Query
- `CampaignFilters` — type, status, session dropdowns (nuqs URL state)
- `CampaignTable` — paginated table with status badges
- `CreateCampaignButton` → navigates to wizard

### 2.2 Create Campaign Wizard

**Route:** `/admin/admissions/campaigns/new`

5-step wizard using local React state (not URL state):

```
Step 1: Basic Info          Step 2: Test Config        Step 3: Dates
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Name: [        ] │       │ Duration: [60] min│       │ Reg Start: [📅]  │
│ Type: [Both ▾ ]  │       │ Total Marks: [100]│       │ Reg End:   [📅]  │
│ Class: [6th ▾ ]  │       │ Passing: [40]     │       │ Test Start:[📅]  │
│ Session: [26 ▾ ] │       │ Neg Marking: [✓]  │       │ Test End:  [📅]  │
│ Description:     │       │ Neg Mark/Q: [0.25]│       │                  │
│ [               ]│       │ Max Applicants:   │       │ Timeline Preview │
│                  │       │ [500]             │       │ ──●───●───●──●── │
│                  │       │ Seats: [120]      │       │                  │
└──────────────────┘       └──────────────────┘       └──────────────────┘

Step 4: Questions                   Step 5: Review & Create
┌──────────────────────────┐       ┌──────────────────────────┐
│ Question Bank Browser    │       │ Summary of all settings  │
│ [Search: _________ ]    │       │                          │
│ Filter: [MCQ ▾] [Math ▾]│       │ Name: Class 6 Adm 2026  │
│                          │       │ Type: Admission+Scholar  │
│ ☑ Q1: What is 2+2? (2m) │       │ Duration: 60 min         │
│ ☑ Q2: Define cell (5m)  │       │ Questions: 25 (100 marks)│
│ ☐ Q3: Explain... (10m)  │       │ Tiers: 4 configured      │
│                          │       │ Dates: Jan 15 → Feb 28   │
│ Selected: 25 questions   │       │                          │
│ Total: 100 marks ✓       │       │ [Create as Draft]        │
└──────────────────────────┘       └──────────────────────────┘
```

**Components needed:**
- `CampaignWizard` — parent state machine
- `WizardStepBasicInfo` — react-hook-form with zod
- `WizardStepTestConfig`
- `WizardStepDates` — date pickers with validation
- `WizardStepQuestions` — Question bank browser (reuse existing `QuestionBankTable`)
- `WizardStepReview` — read-only summary
- `WizardNavigation` — Previous/Next/Create buttons

### 2.3 Campaign Detail Page

**Route:** `/admin/admissions/campaigns/[campaignId]`

Tab-based layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back    Class 6 Admission Test 2026-27      [REGISTRATION_OPEN]  │
│                                                                      │
│ [Overview] [Questions] [Applicants] [Grading] [Merit] [Scholarships]│
│ ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│ Overview Tab:                                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ 234      │ │ 198      │ │ 156      │ │ 12d left │               │
│ │ Registered│ │ Verified │ │ Tested   │ │ Till Test│               │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│                                                                      │
│ Registration Funnel:        Test Score Distribution:                 │
│ ████████████████ 234        ▓▓▓▓▓▓▓ 90-100: 12                    │
│ ██████████████░░ 198        ▓▓▓▓▓▓▓▓▓▓ 80-89: 34                  │
│ ████████████░░░░ 156        ▓▓▓▓▓▓▓▓▓▓▓▓ 70-79: 45                │
│ ██████████░░░░░░ 120 seats  ▓▓▓▓▓▓▓▓▓▓▓▓▓ 60-69: 38              │
│                              ▓▓▓▓▓▓▓▓ 50-59: 27                    │
│                                                                      │
│ Actions: [Close Registration] [Start Test Phase] [Publish Results]  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 Applicant List

**Route:** `/admin/admissions/campaigns/[campaignId]/applicants`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Applicants — Class 6 Admission Test       Total: 234               │
│                                                                      │
│ [Search: ________] [Status: All ▾] [Export CSV] [Bulk Actions ▾]   │
│                                                                      │
│ ┌────┬─────────┬──────────────┬───────────┬──────┬────────┬───────┐│
│ │ #  │ Reg No  │ Name         │ Status    │ Score│ Rank   │ Decide││
│ ├────┼─────────┼──────────────┼───────────┼──────┼────────┼───────┤│
│ │ ☐  │ ADM-001 │ Ahmad Ali    │ ✓ Tested  │ 92.5%│ 1      │ [···] ││
│ │ ☐  │ ADM-002 │ Sara Khan    │ ✓ Tested  │ 89.0%│ 2      │ [···] ││
│ │ ☐  │ ADM-003 │ Hassan Raza  │ ⏳ Regist.│ —    │ —      │ [···] ││
│ │ ☐  │ ADM-004 │ Fatima Noor  │ 🚫 Flagged│ 78.0%│ 15     │ [···] ││
│ └────┴─────────┴──────────────┴───────────┴──────┴────────┴───────┘│
│                                                                      │
│ Selected: 2  [Accept Selected] [Reject Selected] [Waitlist Selected]│
│ Page: [< 1 2 3 4 5 >]                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.5 Merit List & Decisions

**Route:** `/admin/admissions/campaigns/[campaignId]/merit`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Merit List — Class 6 Admission Test 2026-27                         │
│                                                                      │
│ [Generate Merit List] [Auto-Assign Scholarships] [Publish Results]  │
│                                                                      │
│ Quick Actions:                                                       │
│ Accept top [120] applicants  [Apply]                                │
│ Waitlist next [30] applicants [Apply]                               │
│                                                                      │
│ ┌────┬─────────┬──────────────┬──────┬───────┬────────┬───────────┐│
│ │Rank│ Reg No  │ Name         │ Score│ Time  │Scholar │ Decision  ││
│ ├────┼─────────┼──────────────┼──────┼───────┼────────┼───────────┤│
│ │ 1  │ ADM-001 │ Ahmad Ali    │92.5% │ 42min │ 100%   │ ✅ Accept ││
│ │ 2  │ ADM-002 │ Sara Khan    │89.0% │ 45min │ 75%    │ ✅ Accept ││
│ │ 3  │ ADM-007 │ Zain Malik   │88.5% │ 38min │ 75%    │ ✅ Accept ││
│ │...                                                                ││
│ │120 │ ADM-089 │ Nadia Shah   │61.0% │ 55min │ —      │ ✅ Accept ││
│ │121 │ ADM-112 │ Bilal Ahmed  │60.5% │ 52min │ —      │ ⏳ Wait   ││
│ │...                                                                ││
│ │150 │ ADM-156 │ Imran Khan   │55.0% │ 58min │ —      │ ⏳ Wait   ││
│ │151 │ ADM-203 │ Ali Hassan   │54.5% │ 50min │ —      │ ❌ Reject ││
│ └────┴─────────┴──────────────┴──────┴───────┴────────┴───────────┘│
│                                                                      │
│ Summary: 120 Accepted | 30 Waitlisted | 84 Rejected                │
│ [Export Merit List as CSV] [Export as PDF]                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Public Portal Pages — Detailed Specifications

### 3.1 Campaign Listing

**Route:** `/apply`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│          🏫 [School Name] — Admission & Scholarship Tests            │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Class 6 Admission Test 2026-27                              │   │
│   │  ─────────────────────────────────────────────────────────   │   │
│   │  📅 Registration: Jan 15 — Feb 28, 2026                     │   │
│   │  📝 Test Date: Mar 15, 2026                                  │   │
│   │  🪑 Available Seats: 120                                     │   │
│   │  📊 Type: Admission + Scholarship                            │   │
│   │                                                               │   │
│   │  Registration closing in: 12 days 5 hours                    │   │
│   │                                        [Apply Now →]          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Grade 9 Scholarship Test 2026-27                            │   │
│   │  ─────────────────────────────────────────────────────────   │   │
│   │  📅 Registration: Feb 1 — Mar 15, 2026                      │   │
│   │  📝 Test: Apr 1, 2026                                        │   │
│   │  📊 Type: Scholarship Only                                   │   │
│   │  🏆 Tiers: 100%, 75%, 50%, 25%                               │   │
│   │                                        [Apply Now →]          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Already applied? [Check Your Result] [Track Application]          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Registration Form

**Route:** `/apply/[slug]/register`

Multi-section form with react-hook-form + zod validation:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Apply — Class 6 Admission Test 2026-27                              │
│                                                                      │
│ Step 1 of 3: Personal Information          ●───○───○                 │
│                                                                      │
│ First Name*          Last Name*                                      │
│ [Ahmad             ] [Ali                ]                           │
│                                                                      │
│ Date of Birth*       Gender*                                         │
│ [📅 2014-05-12    ] [Male ▾            ]                            │
│                                                                      │
│ Email*               Phone                                           │
│ [parent@example.com] [+923001234567    ]                            │
│                                                                      │
│ CNIC / B-Form Number                                                 │
│ [4210112345671    ]                                                  │
│                                                                      │
│                                    [Next: Guardian Info →]           │
│                                                                      │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─           │
│                                                                      │
│ Step 2: Guardian Information               ○───●───○                 │
│                                                                      │
│ Guardian Name*       Relation                                        │
│ [Muhammad Ali      ] [Father ▾         ]                            │
│                                                                      │
│ Guardian Phone*      Guardian Email                                  │
│ [+923001234567    ] [ali@example.com  ]                             │
│                                                                      │
│ Address                                                              │
│ [123 Main Street, Karachi                ]                           │
│                                                                      │
│                       [← Back] [Next: Education →]                  │
│                                                                      │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─           │
│                                                                      │
│ Step 3: Previous Education + Submit        ○───○───●                 │
│                                                                      │
│ Previous School      Previous Class                                  │
│ [ABC School        ] [5th             ]                             │
│                                                                      │
│ Previous Percentage                                                  │
│ [85.5             ]%                                                 │
│                                                                      │
│ [🔒 CAPTCHA — Verify you're human]                                  │
│                                                                      │
│                       [← Back] [Submit Application]                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Test Taking Interface

**Route:** `/apply/[slug]/test`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Class 6 Admission Test                    ⏱ Time Left: 45:23       │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│ Question 7 of 25                                    [7/25 answered] │
│                                                                      │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Q7: What is the capital of Pakistan?               [2 marks]  │   │
│ │                                                                │   │
│ │ ○ Lahore                                                       │   │
│ │ ● Islamabad                                                    │   │
│ │ ○ Karachi                                                      │   │
│ │ ○ Peshawar                                                     │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ Question Navigator:                                                  │
│ [1✓] [2✓] [3✓] [4✓] [5✓] [6✓] [7●] [8○] [9○] [10○]              │
│ [11○] [12○] [13○] [14○] [15○] [16○] [17○] [18○] [19○] [20○]      │
│ [21○] [22○] [23○] [24○] [25○]                                      │
│                                                                      │
│ ✓ = Answered  ● = Current  ○ = Not answered                        │
│                                                                      │
│       [← Previous]  [Mark for Review]  [Next →]                    │
│                                                                      │
│ ─────────────────────────────────────────────────────────────────── │
│                           [Submit Test]                              │
│ ⚠️ Warning: You have 18 unanswered questions                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Result Display

**Route:** `/results/[token]`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│          🏫 [School Name]                                            │
│          Class 6 Admission Test 2026-27 — Results                    │
│                                                                      │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │                                                                │   │
│ │  Name: Ahmad Ali                                               │   │
│ │  Registration No: ADM-2026-00142                               │   │
│ │                                                                │   │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │   │
│ │  │ 92.5 / 100  │  │ 92.5%       │  │ Rank: 1     │           │   │
│ │  │ Marks       │  │ Percentage  │  │ out of 234  │           │   │
│ │  └─────────────┘  └─────────────┘  └─────────────┘           │   │
│ │                                                                │   │
│ │  Status: ✅ PASSED                                             │   │
│ │                                                                │   │
│ │  🏆 Scholarship Awarded: 100% Full Merit Scholarship           │   │
│ │  100% tuition waiver for the first academic year               │   │
│ │                                                                │   │
│ │  [Accept Scholarship]   [Decline Scholarship]                  │   │
│ │                                                                │   │
│ │  Admission Decision: ✅ ACCEPTED                                │   │
│ │  Next Steps: Visit school office by March 30, 2026             │   │
│ │  with original documents for enrollment.                       │   │
│ │                                                                │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [Download Result Card as PDF]  [Print]                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Reusable Component Mapping

Components from the existing exam system that can be reused:

| Existing Component | Reuse In | Modifications Needed |
|---|---|---|
| `QuestionBankTable` (questions module) | Campaign question selection wizard | Add checkbox selection, marks assignment |
| `ExamTimer` (sessions module) | Test taking interface | Rename to `TestTimer`, same logic |
| `QuestionDisplay` (sessions module) | Public test taking, MCQ rendering | Strip correct answer indicators |
| `ConfirmDialog` (shared) | Bulk actions, submission confirmation | No changes |
| `DataTable` (shared) | Applicant list, merit list | No changes |
| `StatusBadge` (shared) | Campaign/applicant status badges | Add new status variants |
| `StatsCard` (shared) | Campaign dashboard, analytics | No changes |
| `Pagination` (shared) | All list pages | No changes |
| `ExportButton` (results module) | CSV/PDF export for merit lists | Extend for new data shapes |
| `ScoreChart` (results module) | Score distribution in analytics | No changes |

### New Components to Build

```
src/modules/admissions/components/
├── campaigns/
│   ├── campaign-list.tsx            # Campaign table with filters
│   ├── campaign-card.tsx            # Summary card for dashboard
│   ├── campaign-create-wizard.tsx   # 5-step wizard
│   ├── campaign-detail-header.tsx   # Title + status + actions
│   ├── campaign-status-badge.tsx    # Color-coded status
│   └── campaign-status-actions.tsx  # Transition action buttons
├── applicants/
│   ├── applicant-list-table.tsx     # Sortable, filterable table
│   ├── applicant-detail-panel.tsx   # Side panel with full info
│   ├── applicant-status-badge.tsx   # Multi-state badge
│   └── applicant-bulk-actions.tsx   # Accept/reject/waitlist selected
├── merit/
│   ├── merit-list-table.tsx         # Ranked, color-coded merit table
│   ├── merit-quick-actions.tsx      # "Accept top N" quick form
│   ├── merit-export-button.tsx      # CSV + PDF export
│   └── decision-dialog.tsx          # Individual/bulk decision modal
├── scholarships/
│   ├── tier-config-form.tsx         # Manage tiers for a campaign
│   ├── scholarship-assignment-table.tsx
│   ├── scholarship-stats-cards.tsx
│   └── auto-assign-dialog.tsx       # Confirm auto-assignment
├── enrollment/
│   ├── enrollment-table.tsx         # Accepted → enrolled tracker
│   ├── enroll-dialog.tsx            # Class/section assignment
│   └── bulk-enroll-form.tsx
└── analytics/
    ├── registration-funnel-chart.tsx
    ├── score-distribution-chart.tsx
    ├── decision-pie-chart.tsx
    └── campaign-timeline.tsx

src/modules/public-portal/components/
├── portal-layout.tsx               # Clean layout without auth sidebar
├── school-branding.tsx             # School logo + name header
├── campaign-listing.tsx            # Card grid of open campaigns
├── campaign-detail-card.tsx        # Detailed info card
├── registration-form.tsx           # Multi-step react-hook-form
├── otp-input.tsx                   # 6-digit OTP input
├── otp-verification.tsx            # OTP verify page component
├── test-taking/
│   ├── test-container.tsx          # Main test layout
│   ├── question-renderer.tsx       # MCQ + subjective display
│   ├── question-navigator.tsx      # Grid of question buttons
│   ├── test-timer.tsx              # Countdown timer
│   ├── answer-input.tsx            # MCQ radio / textarea
│   └── submit-confirmation.tsx     # "Are you sure?" dialog
├── result-checker-form.tsx         # Email + CNIC lookup
├── result-display.tsx              # Full result card
├── scholarship-response.tsx        # Accept/decline UI
└── application-tracker.tsx         # Status timeline
```

---

## 5. State Management

### URL State (nuqs)

```typescript
// Campaign list filters
const [status, setStatus] = useQueryState('status');
const [type, setType] = useQueryState('type');
const [session, setSession] = useQueryState('session');
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
const [search, setSearch] = useQueryState('search', { throttleMs: 300 });

// Applicant list filters
const [applicantStatus, setApplicantStatus] = useQueryState('applicantStatus');
const [sort, setSort] = useQueryState('sort', { defaultValue: 'rank' });
const [order, setOrder] = useQueryState('order', { defaultValue: 'asc' });
```

### Server State (TanStack Query)

```typescript
// src/modules/admissions/hooks/use-campaigns.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useCampaigns(filters: CampaignFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.campaigns, filters],
    queryFn: () => getCampaigns(filters),
    staleTime: 30_000, // 30s
  });
}

export function useCampaignDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.campaigns, id],
    queryFn: () => getCampaignById(id),
    enabled: !!id,
  });
}

export function useCampaignApplicants(campaignId: string, filters: ApplicantFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.applicants, campaignId, filters],
    queryFn: () => getCampaignApplicants(campaignId, filters),
    staleTime: 15_000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.campaigns] });
    },
  });
}

export function useBulkDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDecisionAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.applicants, variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.meritList, variables.campaignId] });
    },
  });
}
```

### Local State (Test Taking)

```typescript
// Test taking uses local state (NOT server state) for answers
// Saved to server on: answer change (debounced), navigation, submit

interface TestState {
  sessionId: string;
  currentQuestionIndex: number;
  answers: Map<string, Answer>;
  markedForReview: Set<string>;
  startedAt: Date;
  endsAt: Date;
  isSubmitting: boolean;
}

// Zustand store for test-taking (isolated, destroyed after submission)
const useTestStore = create<TestState>((set, get) => ({
  // ...
  setAnswer: (questionId: string, answer: Answer) => {
    set(state => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionId, answer);
      return { answers: newAnswers };
    });
    // Debounced auto-save to server
    debouncedSaveAnswer(get().sessionId, questionId, answer);
  },
}));
```

---

## 6. Query Keys Extension

```typescript
// src/lib/query-keys.ts — extend existing

export const QUERY_KEYS = {
  // ... existing keys
  
  // Admissions
  campaigns: 'campaigns',
  campaignDetail: 'campaign-detail',
  applicants: 'applicants',
  applicantDetail: 'applicant-detail',
  meritList: 'merit-list',
  scholarshipReport: 'scholarship-report',
  campaignAnalytics: 'campaign-analytics',
  
  // Public portal
  publicCampaigns: 'public-campaigns',
  publicCampaignDetail: 'public-campaign-detail',
  applicantStatus: 'applicant-status',
  publicResult: 'public-result',
} as const;
```

---

## 7. Layout Components

### Admin Admissions Layout

```tsx
// src/app/(dashboard)/admin/admissions/layout.tsx

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admissions & Scholarships</h1>
      </div>
      {children}
    </div>
  );
}
```

### Public Portal Layout

```tsx
// src/app/(public)/apply/layout.tsx

export default function PublicPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* School branding header */}
      <header className="bg-white border-b py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <SchoolLogo />
          <div>
            <h1 className="text-lg font-semibold">{schoolName}</h1>
            <p className="text-sm text-muted-foreground">Admission Portal</p>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto py-8 px-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        © 2026 {schoolName}. All rights reserved.
      </footer>
    </div>
  );
}
```

### Campaign Detail Tab Layout

```tsx
// src/app/(dashboard)/admin/admissions/campaigns/[campaignId]/layout.tsx

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = [
  { value: '', label: 'Overview' },
  { value: 'questions', label: 'Questions' },
  { value: 'applicants', label: 'Applicants' },
  { value: 'grading', label: 'Grading' },
  { value: 'merit', label: 'Merit List' },
  { value: 'scholarships', label: 'Scholarships' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'analytics', label: 'Analytics' },
];

export default function CampaignDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaignId: string };
}) {
  return (
    <div className="space-y-6">
      <CampaignDetailHeader campaignId={params.campaignId} />
      <nav className="flex gap-1 border-b">
        {TABS.map(tab => (
          <Link
            key={tab.value}
            href={`/admin/admissions/campaigns/${params.campaignId}/${tab.value}`}
            className={cn('px-4 py-2 text-sm', /* active styles */)}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
```
