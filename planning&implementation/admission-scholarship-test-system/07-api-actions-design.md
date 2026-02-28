# Admission Test & Scholarship Test — API & Server Actions Design

> **Date:** February 28, 2026
> **Scope:** Complete API contracts, server actions, input/output schemas, route structure

---

## 1. Module Structure

```
src/modules/admissions/
├── components/               # Admin UI components
│   ├── campaigns/
│   │   ├── campaign-list.tsx
│   │   ├── campaign-card.tsx
│   │   ├── campaign-create-wizard.tsx
│   │   ├── campaign-detail-header.tsx
│   │   └── campaign-status-badge.tsx
│   ├── applicants/
│   │   ├── applicant-list-table.tsx
│   │   ├── applicant-detail-modal.tsx
│   │   ├── applicant-status-badge.tsx
│   │   └── applicant-bulk-actions.tsx
│   ├── merit/
│   │   ├── merit-list-table.tsx
│   │   ├── merit-actions-bar.tsx
│   │   └── merit-export-button.tsx
│   ├── scholarships/
│   │   ├── tier-config-form.tsx
│   │   ├── scholarship-assignment-table.tsx
│   │   └── scholarship-stats-cards.tsx
│   └── grading/
│       ├── admission-grading-dashboard.tsx
│       └── admission-answer-review.tsx
├── hooks/
│   ├── use-campaigns.ts
│   ├── use-applicants.ts
│   ├── use-merit-list.ts
│   └── use-scholarship-stats.ts
├── admission-actions.ts      # Server actions (mutations)
├── admission-queries.ts      # Direct DB queries
├── admission-fetch-actions.ts # Server actions (reads)
├── admission-schemas.ts      # Zod validation schemas
└── admission-types.ts        # TypeScript types

src/modules/public-portal/
├── components/
│   ├── campaign-listing.tsx
│   ├── campaign-detail-card.tsx
│   ├── registration-form.tsx
│   ├── otp-verification.tsx
│   ├── test-taking-interface.tsx
│   ├── result-checker.tsx
│   └── application-tracker.tsx
├── hooks/
│   ├── use-public-campaign.ts
│   └── use-applicant-session.ts
├── portal-actions.ts         # Server actions (public, rate-limited)
├── portal-queries.ts
├── portal-fetch-actions.ts
└── portal-schemas.ts
```

---

## 2. Zod Validation Schemas

### Campaign Schemas

```typescript
// admission-schemas.ts

import { z } from 'zod';

// ─── Campaign CRUD ────────────────────────────────────

export const createCampaignSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  type: z.enum(['ADMISSION', 'SCHOLARSHIP', 'ADMISSION_SCHOLARSHIP']),
  targetClassId: z.string().cuid(),
  academicSessionId: z.string().cuid(),
  
  // Registration window
  registrationStartDate: z.coerce.date(),
  registrationEndDate: z.coerce.date(),
  
  // Test window
  testStartDate: z.coerce.date(),
  testEndDate: z.coerce.date(),
  
  // Test config
  durationMinutes: z.number().int().min(10).max(300),
  totalMarks: z.number().int().min(1).max(1000),
  passingMarks: z.number().int().min(0),
  maxApplicants: z.number().int().min(1).optional(),
  availableSeats: z.number().int().min(1).optional(),
  
  // Options
  hasNegativeMarking: z.boolean().default(false),
  negativeMarkPerWrong: z.number().min(0).max(5).optional(),
  showResultToApplicant: z.boolean().default(false),
  allowMultipleAttempts: z.boolean().default(false),
}).refine(data => data.registrationEndDate > data.registrationStartDate, {
  message: 'Registration end date must be after start date',
  path: ['registrationEndDate'],
}).refine(data => data.testStartDate >= data.registrationStartDate, {
  message: 'Test start date must be on or after registration start',
  path: ['testStartDate'],
}).refine(data => data.passingMarks <= data.totalMarks, {
  message: 'Passing marks cannot exceed total marks',
  path: ['passingMarks'],
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().cuid(),
});

// ─── Scholarship Tier ────────────────────────────────

export const scholarshipTierSchema = z.object({
  name: z.string().min(2).max(80),
  tier: z.enum(['FULL_100', 'SEVENTY_FIVE', 'HALF_50', 'QUARTER_25']),
  minPercentage: z.number().min(0).max(100),
  maxRecipients: z.number().int().min(1).optional(),
  benefitDetails: z.string().max(500).optional(),
  sortOrder: z.number().int().min(1),
  isActive: z.boolean().default(true),
});

export const campaignScholarshipTiersSchema = z.object({
  campaignId: z.string().cuid(),
  tiers: z.array(scholarshipTierSchema).min(1).max(10),
});

// ─── Question Assignment ─────────────────────────────

export const addQuestionsToCampaignSchema = z.object({
  campaignId: z.string().cuid(),
  questions: z.array(z.object({
    questionId: z.string().cuid(),
    marks: z.number().min(0.5).max(100),
    sortOrder: z.number().int().min(1),
  })).min(1),
});

export const removeQuestionsFromCampaignSchema = z.object({
  campaignId: z.string().cuid(),
  questionIds: z.array(z.string().cuid()).min(1),
});

// ─── Evaluation Stage ────────────────────────────────

export const evaluationStageSchema = z.object({
  campaignId: z.string().cuid(),
  stageName: z.string().min(2).max(60),
  stageOrder: z.number().int().min(1),
  type: z.enum(['WRITTEN_TEST', 'INTERVIEW', 'DOCUMENT_VERIFICATION', 'FINAL_DECISION']),
  description: z.string().max(500).optional(),
  isRequired: z.boolean().default(true),
});
```

### Applicant Schemas

```typescript
// portal-schemas.ts

import { z } from 'zod';

// ─── Applicant Registration ──────────────────────────

export const applicantRegistrationSchema = z.object({
  campaignId: z.string().cuid(),
  
  // Personal info
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  
  // Contact
  email: z.string().email().max(120).toLowerCase().trim(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  
  // Guardian info
  guardianName: z.string().min(2).max(100).trim(),
  guardianPhone: z.string().regex(/^\+?[0-9]{10,15}$/),
  guardianEmail: z.string().email().optional(),
  guardianRelation: z.string().max(30).optional(),
  
  // Address
  address: z.string().max(250).optional(),
  city: z.string().max(50).optional(),
  
  // Previous education
  previousSchool: z.string().max(150).optional(),
  previousClass: z.string().max(20).optional(),
  previousPercentage: z.number().min(0).max(100).optional(),
  
  // CNIC/B-Form
  cnicOrBForm: z.string().regex(/^[0-9]{13}$/).optional(),
});

// ─── OTP Verification ────────────────────────────────

export const verifyOtpSchema = z.object({
  applicantId: z.string().cuid(),
  otp: z.string().length(6).regex(/^[0-9]{6}$/),
});

export const resendOtpSchema = z.object({
  applicantId: z.string().cuid(),
});

// ─── Test Taking ─────────────────────────────────────

export const startTestSessionSchema = z.object({
  applicantId: z.string().cuid(),
  accessToken: z.string().min(20),
});

export const submitAnswerSchema = z.object({
  sessionId: z.string().cuid(),
  questionId: z.string().cuid(),
  selectedOptionId: z.string().cuid().optional(),  // MCQ
  textAnswer: z.string().max(5000).optional(),      // Subjective
});

export const submitTestSchema = z.object({
  sessionId: z.string().cuid(),
  answers: z.array(z.object({
    questionId: z.string().cuid(),
    selectedOptionId: z.string().cuid().optional(),
    textAnswer: z.string().max(5000).optional(),
  })),
});

// ─── Result Check ────────────────────────────────────

export const checkResultSchema = z.object({
  campaignId: z.string().cuid(),
  email: z.string().email(),
  cnicOrBForm: z.string().regex(/^[0-9]{13}$/).optional(),
});

// ─── Scholarship Response ────────────────────────────

export const scholarshipResponseSchema = z.object({
  scholarshipId: z.string().cuid(),
  accessToken: z.string(),
  response: z.enum(['ACCEPT', 'DECLINE']),
});
```

### Admin Decision Schemas

```typescript
// admission-schemas.ts (continued)

// ─── Merit & Decision ────────────────────────────────

export const generateMeritListSchema = z.object({
  campaignId: z.string().cuid(),
  tiebreakers: z.array(z.enum([
    'PERCENTAGE',
    'TIME_TAKEN',
    'CORRECT_ANSWERS',
    'DATE_OF_BIRTH',
  ])).default(['PERCENTAGE', 'TIME_TAKEN', 'CORRECT_ANSWERS']),
});

export const singleDecisionSchema = z.object({
  applicantId: z.string().cuid(),
  decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
  remarks: z.string().max(500).optional(),
});

export const bulkDecisionSchema = z.object({
  campaignId: z.string().cuid(),
  applicantIds: z.array(z.string().cuid()).min(1).max(500),
  decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
  remarks: z.string().max(500).optional(),
});

export const promoteWaitlistedSchema = z.object({
  campaignId: z.string().cuid(),
  count: z.number().int().min(1).max(100),
});

export const enrollApplicantSchema = z.object({
  applicantId: z.string().cuid(),
  classId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
  rollNumber: z.string().max(20).optional(),
});

export const bulkEnrollSchema = z.object({
  campaignId: z.string().cuid(),
  applicantIds: z.array(z.string().cuid()).min(1).max(100),
  classId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
});
```

---

## 3. Server Actions — Admin Side

### Campaign Management Actions

```typescript
// admission-actions.ts

'use server';

import { ActionResult } from '@/types/action-result';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ─── Campaign CRUD ────────────────────────────────────

export async function createCampaignAction(
  data: z.infer<typeof createCampaignSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }
  
  const parsed = createCampaignSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  
  const campaign = await prisma.testCampaign.create({
    data: {
      ...parsed.data,
      status: 'DRAFT',
      createdById: session.user.id,
    },
  });
  
  await auditLog(session.user.id, 'CAMPAIGN_CREATED', { campaignId: campaign.id });
  revalidatePath('/admin/admissions');
  
  return { success: true, data: { id: campaign.id } };
}

export async function updateCampaignAction(
  data: z.infer<typeof updateCampaignSchema>
): Promise<ActionResult<void>> {
  // Auth check, validation, status guard (only DRAFT editable)
  const campaign = await prisma.testCampaign.findUnique({ where: { id: data.id } });
  if (campaign?.status !== 'DRAFT') {
    return { success: false, error: 'Only draft campaigns can be edited' };
  }
  
  await prisma.testCampaign.update({
    where: { id: data.id },
    data: parsed.data,
  });
  
  revalidatePath(`/admin/admissions/campaigns/${data.id}`);
  return { success: true };
}

export async function publishCampaignAction(
  campaignId: string
): Promise<ActionResult<void>> {
  // Validate: has questions, has dates, has tiers (if scholarship type)
  const campaign = await prisma.testCampaign.findUnique({
    where: { id: campaignId },
    include: {
      _count: { select: { questions: true, scholarshipTiers: true } }
    }
  });
  
  if (!campaign) return { success: false, error: 'Campaign not found' };
  if (campaign.status !== 'DRAFT') return { success: false, error: 'Only draft campaigns can be published' };
  if (campaign._count.questions === 0) return { success: false, error: 'Add at least one question before publishing' };
  if (campaign.type !== 'ADMISSION' && campaign._count.scholarshipTiers === 0) {
    return { success: false, error: 'Configure scholarship tiers before publishing' };
  }
  
  await prisma.testCampaign.update({
    where: { id: campaignId },
    data: { status: 'REGISTRATION_OPEN' },
  });
  
  revalidatePath(`/admin/admissions/campaigns/${campaignId}`);
  return { success: true };
}

export async function closeCampaignAction(campaignId: string): Promise<ActionResult<void>> { /* ... */ }
export async function archiveCampaignAction(campaignId: string): Promise<ActionResult<void>> { /* ... */ }

// ─── Question Assignment ─────────────────────────────

export async function addQuestionsToCampaignAction(
  data: z.infer<typeof addQuestionsToCampaignSchema>
): Promise<ActionResult<{ count: number }>> {
  // Status guard: only DRAFT campaigns
  // Validate each questionId exists
  // Check total marks consistency
  
  const results = await prisma.campaignQuestion.createMany({
    data: data.questions.map(q => ({
      campaignId: data.campaignId,
      questionId: q.questionId,
      marks: q.marks,
      sortOrder: q.sortOrder,
    })),
    skipDuplicates: true,
  });
  
  // Recalculate totalMarks on campaign
  const totalMarks = await prisma.campaignQuestion.aggregate({
    where: { campaignId: data.campaignId },
    _sum: { marks: true },
  });
  
  await prisma.testCampaign.update({
    where: { id: data.campaignId },
    data: { totalMarks: totalMarks._sum.marks ?? 0 },
  });
  
  return { success: true, data: { count: results.count } };
}

export async function removeQuestionsFromCampaignAction(
  data: z.infer<typeof removeQuestionsFromCampaignSchema>
): Promise<ActionResult<void>> { /* ... */ }

// ─── Scholarship Tier Management ─────────────────────

export async function configureScholarshipTiersAction(
  data: z.infer<typeof campaignScholarshipTiersSchema>
): Promise<ActionResult<void>> {
  // Delete existing tiers for this campaign, recreate
  await prisma.$transaction(async (tx) => {
    await tx.campaignScholarshipTier.deleteMany({
      where: { campaignId: data.campaignId }
    });
    await tx.campaignScholarshipTier.createMany({
      data: data.tiers.map(t => ({
        campaignId: data.campaignId,
        ...t,
      })),
    });
  });
  
  return { success: true };
}

// ─── Decision Actions ────────────────────────────────

export async function makeDecisionAction(
  data: z.infer<typeof singleDecisionSchema>
): Promise<ActionResult<void>> { /* ... */ }

export async function bulkDecisionAction(
  data: z.infer<typeof bulkDecisionSchema>
): Promise<ActionResult<{ processed: number }>> { /* ... */ }

export async function autoAssignScholarshipsAction(
  campaignId: string
): Promise<ActionResult<{ assigned: number }>> { /* ... */ }

export async function generateMeritListAction(
  data: z.infer<typeof generateMeritListSchema>
): Promise<ActionResult<void>> { /* ... */ }

export async function promoteWaitlistedAction(
  data: z.infer<typeof promoteWaitlistedSchema>
): Promise<ActionResult<{ promoted: number }>> { /* ... */ }

export async function enrollApplicantAction(
  data: z.infer<typeof enrollApplicantSchema>
): Promise<ActionResult<{ userId: string }>> { /* ... */ }

export async function bulkEnrollAction(
  data: z.infer<typeof bulkEnrollSchema>
): Promise<ActionResult<{ enrolled: number; failed: number }>> { /* ... */ }
```

---

## 4. Server Actions — Public Portal Side

```typescript
// portal-actions.ts

'use server';

import { ActionResult } from '@/types/action-result';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { generateOTP, generateAccessToken } from './portal-utils';

// ─── Registration ────────────────────────────────────

export async function registerApplicantAction(
  data: z.infer<typeof applicantRegistrationSchema>
): Promise<ActionResult<{ applicantId: string }>> {
  // Rate limit: 5 registrations per IP per hour
  const limited = await rateLimit('register', { max: 5, window: '1h' });
  if (limited) return { success: false, error: 'Too many registrations. Try again later.' };
  
  // Validate campaign exists and is in REGISTRATION_OPEN status
  const campaign = await prisma.testCampaign.findUnique({
    where: { id: data.campaignId },
  });
  
  if (!campaign || campaign.status !== 'REGISTRATION_OPEN') {
    return { success: false, error: 'Registration is not open for this test' };
  }
  
  // Check registration deadline
  if (new Date() > campaign.registrationEndDate) {
    return { success: false, error: 'Registration deadline has passed' };
  }
  
  // Check max applicants
  if (campaign.maxApplicants) {
    const count = await prisma.applicant.count({
      where: { campaignId: data.campaignId },
    });
    if (count >= campaign.maxApplicants) {
      return { success: false, error: 'Maximum applicants reached' };
    }
  }
  
  // Check duplicate (email + campaign)
  const existing = await prisma.applicant.findUnique({
    where: {
      campaignId_email: { campaignId: data.campaignId, email: data.email },
    },
  });
  if (existing) {
    return { success: false, error: 'Already registered for this test' };
  }
  
  // Generate OTP and access token
  const otp = generateOTP(); // 6-digit
  const accessToken = generateAccessToken(); // crypto.randomBytes(32).toString('hex')
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  
  // Create applicant
  const applicant = await prisma.applicant.create({
    data: {
      ...data,
      status: 'REGISTERED',
      accessToken,
      otpCode: otp,
      otpExpiresAt,
      registrationNumber: await generateRegistrationNumber(campaign),
    },
  });
  
  // Send OTP email
  await sendEmail({
    to: data.email,
    subject: `OTP Verification — ${campaign.name}`,
    template: 'applicant-otp',
    data: { otp, name: data.firstName, campaignName: campaign.name },
  });
  
  return { success: true, data: { applicantId: applicant.id } };
}

// ─── OTP Verification ───────────────────────────────

export async function verifyOtpAction(
  data: z.infer<typeof verifyOtpSchema>
): Promise<ActionResult<{ accessToken: string }>> {
  // Rate limit: 10 OTP attempts per applicant per hour
  const limited = await rateLimit(`otp:${data.applicantId}`, { max: 10, window: '1h' });
  if (limited) return { success: false, error: 'Too many attempts' };
  
  const applicant = await prisma.applicant.findUnique({
    where: { id: data.applicantId },
  });
  
  if (!applicant) return { success: false, error: 'Applicant not found' };
  if (applicant.otpCode !== data.otp) return { success: false, error: 'Invalid OTP' };
  if (applicant.otpExpiresAt && applicant.otpExpiresAt < new Date()) {
    return { success: false, error: 'OTP expired. Request a new one.' };
  }
  
  await prisma.applicant.update({
    where: { id: data.applicantId },
    data: {
      isEmailVerified: true,
      status: 'VERIFIED',
      otpCode: null,
      otpExpiresAt: null,
    },
  });
  
  return { success: true, data: { accessToken: applicant.accessToken } };
}

export async function resendOtpAction(
  data: z.infer<typeof resendOtpSchema>
): Promise<ActionResult<void>> {
  // Rate limit: 3 resends per applicant per hour
  // Generate new OTP, update applicant, send email
  return { success: true };
}

// ─── Test Session ────────────────────────────────────

export async function startTestSessionAction(
  data: z.infer<typeof startTestSessionSchema>
): Promise<ActionResult<{ sessionId: string; questions: Question[] }>> {
  // Validate access token
  // Check campaign is in TEST_ACTIVE status
  // Check applicant hasn't already taken the test (unless allowMultipleAttempts)
  // Create ApplicantTestSession
  // Fetch questions (randomized order)
  // Return session + questions
}

export async function submitAnswerAction(
  data: z.infer<typeof submitAnswerSchema>
): Promise<ActionResult<void>> {
  // Validate session is active
  // Check time remaining
  // Upsert ApplicantAnswer
}

export async function submitTestAction(
  data: z.infer<typeof submitTestSchema>
): Promise<ActionResult<void>> {
  // Validate session is active
  // Bulk upsert all answers
  // Mark session as COMPLETED
  // Set submittedAt
  // Trigger auto-grading (MCQ)
}

// ─── Result Check ────────────────────────────────────

export async function checkResultAction(
  data: z.infer<typeof checkResultSchema>
): Promise<ActionResult<{
  isFound: boolean;
  result?: {
    rank: number;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    isPassed: boolean;
    scholarshipTier?: string;
  };
}>> {
  // Rate limit: 20 checks per IP per hour
  // Validate campaign has showResultToApplicant = true
  // Find applicant by email + cnic
  // Return result if found
}

// ─── Scholarship Response ────────────────────────────

export async function respondToScholarshipAction(
  data: z.infer<typeof scholarshipResponseSchema>
): Promise<ActionResult<void>> {
  // Validate access token matches applicant
  // Accept or decline scholarship
  // If decline → cascade to next eligible
}
```

---

## 5. Fetch Actions (Read-Only Server Actions)

```typescript
// admission-fetch-actions.ts

'use server';

export async function getCampaigns(filters?: {
  status?: CampaignStatus;
  type?: CampaignType;
  academicSessionId?: string;
  page?: number;
  pageSize?: number;
}) {
  // Auth check: ADMIN only
  // Return paginated campaigns with counts
}

export async function getCampaignById(id: string) {
  // Auth check: ADMIN
  // Include: questions count, applicants count, tiers, stages
}

export async function getCampaignApplicants(
  campaignId: string,
  filters?: {
    status?: ApplicantStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }
) {
  // Paginated applicant list with result + scholarship info
}

export async function getCampaignMeritList(
  campaignId: string,
  filters?: { page?: number; pageSize?: number }
) {
  // Ranked list with position, score, decisions
}

export async function getCampaignAnalytics(campaignId: string) {
  // Aggregate stats: registration funnel, score distribution, pass rate, etc.
}

export async function getScholarshipReport(campaignId: string) {
  // Tier distribution, acceptance rates, financial impact
}

// portal-fetch-actions.ts

export async function getPublicCampaigns() {
  // No auth required
  // Return only REGISTRATION_OPEN or TEST_ACTIVE campaigns
  // Limited fields: name, type, dates, targetClass, availableSeats
}

export async function getPublicCampaignDetail(campaignId: string) {
  // No auth, campaign must be published (not DRAFT/ARCHIVED)
  // Return: name, description, dates, seat info, eligibility criteria
}

export async function getApplicantStatus(accessToken: string) {
  // Token-based auth
  // Return: registration status, email verified, test status, result (if published)
}
```

---

## 6. API Route Structure

### Admin Routes (Protected)

```
/admin/admissions/
├── campaigns/                            # Campaign list
│   ├── new/                              # Create campaign wizard
│   └── [campaignId]/                     # Campaign detail
│       ├── questions/                    # Question assignment
│       ├── tiers/                        # Scholarship tier config
│       ├── applicants/                   # Applicant list
│       │   └── [applicantId]/            # Individual applicant detail
│       ├── grading/                      # Grading dashboard
│       ├── merit/                        # Merit list + decisions
│       ├── scholarships/                 # Scholarship assignments
│       ├── enrollment/                   # Convert to student
│       └── analytics/                    # Campaign analytics
```

### Public Routes (No Auth)

```
/apply/                                   # Campaign listing
├── [slug]/                               # Campaign detail + register
│   ├── register/                         # Registration form
│   ├── verify/                           # OTP verification
│   └── test/                             # Test taking interface
/results/
├── check/                                # Result checker
└── [token]/                              # Individual result via access token
/track/
└── [token]/                              # Application tracker
```

### API Routes (For AJAX calls from public portal)

Where server actions don't suffice, provide REST endpoints:

```
/api/public/campaigns                     # GET — list open campaigns
/api/public/campaigns/[id]                # GET — campaign detail
/api/public/register                      # POST — register applicant
/api/public/verify-otp                    # POST — verify OTP
/api/public/start-test                    # POST — start test session
/api/public/submit-answer                 # POST — submit single answer
/api/public/submit-test                   # POST — submit full test
/api/public/check-result                  # POST — check result by email
```

---

## 7. Response Types

```typescript
// admission-types.ts

export interface CampaignListItem {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetClass: { id: string; name: string };
  registrationStartDate: Date;
  registrationEndDate: Date;
  testStartDate: Date;
  testEndDate: Date;
  _count: {
    applicants: number;
    questions: number;
  };
}

export interface CampaignDetail extends CampaignListItem {
  description: string | null;
  academicSession: { id: string; name: string };
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxApplicants: number | null;
  availableSeats: number | null;
  hasNegativeMarking: boolean;
  negativeMarkPerWrong: number | null;
  showResultToApplicant: boolean;
  questions: CampaignQuestionItem[];
  scholarshipTiers: ScholarshipTierItem[];
  evaluationStages: EvaluationStageItem[];
}

export interface ApplicantListItem {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  status: ApplicantStatus;
  isEmailVerified: boolean;
  testSession: {
    status: string;
    submittedAt: Date | null;
  } | null;
  result: {
    totalMarksObtained: number;
    percentage: number;
    rank: number | null;
    isPassed: boolean;
  } | null;
  scholarship: {
    tier: ScholarshipTier;
    isAccepted: boolean | null;
  } | null;
  decision: {
    decision: string;
    decisionAt: Date;
  } | null;
}

export interface MeritListEntry {
  rank: number;
  applicantId: string;
  registrationNumber: string;
  name: string;
  totalMarksObtained: number;
  percentage: number;
  timeTaken: number; // seconds
  correctAnswers: number;
  decision: 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' | null;
  scholarshipTier: ScholarshipTier | null;
}
```

---

## 8. Error Handling Strategy

All actions follow the existing `ActionResult<T>` pattern:

```typescript
// Consistent error types for admission module
const ADMISSION_ERRORS = {
  CAMPAIGN_NOT_FOUND: 'Campaign not found',
  CAMPAIGN_NOT_DRAFT: 'Campaign is no longer in draft status',
  CAMPAIGN_NOT_ACTIVE: 'This campaign is not currently active',
  REGISTRATION_CLOSED: 'Registration is closed for this campaign',
  REGISTRATION_FULL: 'Maximum applicants reached',
  ALREADY_REGISTERED: 'You are already registered for this test',
  APPLICANT_NOT_FOUND: 'Applicant not found',
  INVALID_ACCESS_TOKEN: 'Invalid or expired access token',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  OTP_INVALID: 'Invalid OTP code',
  TEST_NOT_STARTED: 'Test has not started yet',
  TEST_ALREADY_TAKEN: 'You have already taken this test',
  TEST_TIME_EXPIRED: 'Test time has expired',
  SESSION_NOT_ACTIVE: 'Test session is not active',
  RESULT_NOT_PUBLISHED: 'Results have not been published yet',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;
```
