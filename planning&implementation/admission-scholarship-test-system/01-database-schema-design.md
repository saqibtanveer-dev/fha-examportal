# Admission Test & Scholarship Test — Database Schema Design

> **Date:** February 28, 2026
> **Principle:** Complete isolation from enrolled student data, shared question bank, campaign-based architecture

---

## New Enums

```prisma
enum ApplicantStatus {
  REGISTERED        // Applicant has registered, not yet verified
  VERIFIED          // Email/phone verified, can take test
  TEST_IN_PROGRESS  // Currently taking the test
  TEST_COMPLETED    // Test submitted, awaiting grading
  GRADED            // All answers graded, result ready
  SHORTLISTED       // Passed cutoff, shortlisted for next stage
  INTERVIEW_SCHEDULED // Interview stage (optional)
  ACCEPTED          // Admission/scholarship offered
  REJECTED          // Did not meet criteria
  WAITLISTED        // On waitlist
  ENROLLED          // Converted to student (final state)
  WITHDRAWN         // Applicant withdrew application
  EXPIRED           // Campaign ended, applicant did not complete
}

enum CampaignType {
  ADMISSION         // Admission test campaign
  SCHOLARSHIP       // Scholarship test campaign
  ADMISSION_SCHOLARSHIP // Combined admission + scholarship
}

enum CampaignStatus {
  DRAFT             // Being configured
  REGISTRATION_OPEN // Accepting registrations
  REGISTRATION_CLOSED // Registration period ended
  TEST_ACTIVE       // Test window is open
  TEST_CLOSED       // Test window ended
  GRADING           // Grading in progress
  RESULTS_READY     // Results computed, not published
  RESULTS_PUBLISHED // Results visible to applicants
  COMPLETED         // Campaign fully concluded
  ARCHIVED          // Historical data
}

enum ScholarshipTier {
  FULL_100          // 100% scholarship
  SEVENTY_FIVE      // 75% scholarship
  HALF_50           // 50% scholarship
  QUARTER_25        // 25% scholarship
  NONE              // No scholarship
}

enum VerificationType {
  EMAIL_OTP         // OTP sent to email
  PHONE_OTP         // OTP sent to phone
  BOTH              // Both email and phone
}

enum AdmissionDecision {
  PENDING           // No decision yet
  ACCEPTED          // Offered admission
  REJECTED          // Rejected
  WAITLISTED        // Waitlisted
  SCHOLARSHIP_OFFERED // Scholarship offered alongside admission
}

enum EvaluationStage {
  WRITTEN_TEST      // Written test stage
  INTERVIEW         // Interview stage
  DOCUMENT_REVIEW   // Document verification
  FINAL_DECISION    // Final decision
}
```

---

## New Models

### 1. TestCampaign (Central entity — manages the entire admission/scholarship cycle)

```prisma
model TestCampaign {
  id                    String          @id @default(uuid())
  
  // Basic Info
  name                  String          // "Class 6 Admission Test 2026-27"
  slug                  String          @unique // "class-6-admission-2026-27" (URL-safe)
  description           String?
  type                  CampaignType    // ADMISSION | SCHOLARSHIP | ADMISSION_SCHOLARSHIP
  status                CampaignStatus  @default(DRAFT)
  academicSessionId     String?         // Which academic year this is for
  
  // Target
  targetClassId         String?         // Which class this admission is for (nullable for scholarship)
  targetClassGrade      Int?            // Redundant for query perf — grade level (6, 9, etc.)
  maxSeats              Int?            // Maximum seats available (null = unlimited)
  
  // Registration Window
  registrationStartAt   DateTime
  registrationEndAt     DateTime
  
  // Test Window
  testStartAt           DateTime
  testEndAt             DateTime
  testDuration          Int             // Test duration in minutes
  
  // Test Configuration
  totalMarks            Decimal
  passingMarks          Decimal         // Minimum marks to pass
  shuffleQuestions       Boolean         @default(true)
  shuffleOptions         Boolean         @default(true)
  allowCalculator        Boolean         @default(false)
  negativeMarking        Boolean         @default(false)
  negativeMarkValue      Decimal?        // Marks deducted per wrong MCQ (e.g., 0.25)
  instructions           String?         // Shown before test
  
  // Result Configuration
  resultPublishAt       DateTime?       // When results become visible
  showRankToApplicant   Boolean         @default(false)
  showScoreToApplicant  Boolean         @default(true)
  showCutoffToApplicant Boolean         @default(false)
  
  // Scholarship Configuration (only for SCHOLARSHIP / ADMISSION_SCHOLARSHIP)
  hasScholarship        Boolean         @default(false)
  
  // Eligibility Criteria (JSON — flexible)
  eligibilityCriteria   Json?           // { minAge, maxAge, previousGradeMin, requiredDocuments[], etc. }
  
  // Metadata
  createdById           String
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  deletedAt             DateTime?
  
  // Relations
  academicSession       AcademicSession?     @relation(fields: [academicSessionId], references: [id])
  targetClass           Class?               @relation(fields: [targetClassId], references: [id])
  createdBy             User                 @relation(fields: [createdById], references: [id])
  campaignQuestions      CampaignQuestion[]
  campaignScholarshipTiers CampaignScholarshipTier[]
  applicants            Applicant[]
  evaluationStages      CampaignEvaluationStage[]
  
  @@index([type])
  @@index([status])
  @@index([slug])
  @@index([targetClassId])
  @@index([registrationStartAt])
  @@index([registrationEndAt])
  @@index([testStartAt])
  @@index([testEndAt])
  @@index([createdById])
  @@index([deletedAt])
}
```

### 2. CampaignQuestion (Questions assigned to a campaign)

```prisma
model CampaignQuestion {
  id            String    @id @default(uuid())
  campaignId    String
  questionId    String    // FK → Question (shared question bank!)
  sortOrder     Int
  marks         Decimal   // Can override default question marks
  isRequired    Boolean   @default(true)
  sectionLabel  String?   // "Section A", "Section B" — for sectioned tests
  createdAt     DateTime  @default(now())
  
  campaign      TestCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  question      Question     @relation(fields: [questionId], references: [id])
  applicantAnswers ApplicantAnswer[]
  
  @@unique([campaignId, sortOrder])
  @@unique([campaignId, questionId])
  @@index([campaignId])
  @@index([questionId])
}
```

### 3. CampaignScholarshipTier (Scholarship tiers for a campaign)

```prisma
model CampaignScholarshipTier {
  id              String          @id @default(uuid())
  campaignId      String
  tier            ScholarshipTier
  name            String          // "Full Merit Scholarship"
  description     String?
  minPercentage   Decimal         // Minimum % to qualify (e.g., 90.0 for full)
  maxPercentage   Decimal?        // Maximum % (null = unlimited upward)
  maxRecipients   Int?            // Max students who can get this tier (null = unlimited)
  benefitDetails  String?         // Human-readable benefit description
  isActive        Boolean         @default(true)
  sortOrder       Int             // Display priority (1 = highest tier)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  campaign        TestCampaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  applicantScholarships ApplicantScholarship[]
  
  @@unique([campaignId, tier])
  @@index([campaignId])
  @@index([minPercentage])
}
```

### 4. CampaignEvaluationStage (Multi-stage evaluation support)

```prisma
model CampaignEvaluationStage {
  id              String          @id @default(uuid())
  campaignId      String
  stage           EvaluationStage
  name            String          // "Written Test", "Interview", "Document Verification"
  description     String?
  sortOrder       Int             // Stage sequence (1 = first)
  isRequired      Boolean         @default(true)
  weightPercentage Decimal?       // How much this stage weighs in final score (null = 100%)
  passingCriteria  Decimal?       // Min score to pass this stage (null = no minimum)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  campaign        TestCampaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  @@unique([campaignId, stage])
  @@unique([campaignId, sortOrder])
  @@index([campaignId])
}
```

### 5. Applicant (External candidate — completely separate from User)

```prisma
model Applicant {
  id                  String            @id @default(uuid())
  campaignId          String            // Which campaign they're applying for
  
  // Personal Info
  firstName           String
  lastName            String
  email               String            // For communication + login
  phone               String?
  dateOfBirth         DateTime?
  gender              Gender?
  
  // Guardian Info
  guardianName        String?
  guardianPhone       String?
  guardianEmail       String?
  
  // Address
  address             String?
  city                String?
  
  // Academic Background
  previousSchool      String?
  previousClass       String?           // Class they're coming from
  previousGrade       String?           // Last grade/percentage
  
  // Documents (URLs to uploaded files)
  photoUrl            String?
  documentUrls        Json?             // Array of { type: "birth_cert", url: "..." }
  
  // Application State
  status              ApplicantStatus   @default(REGISTERED)
  applicationNumber   String            @unique // Auto-generated: "ADM-2026-0001"
  accessToken         String            @unique // UUID token for test access (no password needed)
  accessTokenExpiresAt DateTime         // Token expiry
  
  // Verification
  isEmailVerified     Boolean           @default(false)
  isPhoneVerified     Boolean           @default(false)
  emailOtp            String?
  phoneOtp            String?
  otpExpiresAt        DateTime?
  otpAttempts         Int               @default(0)
  
  // Metadata
  ipAddress           String?           // Registration IP
  userAgent           String?
  registeredAt        DateTime          @default(now())
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  
  // Relations
  campaign            TestCampaign      @relation(fields: [campaignId], references: [id])
  testSession         ApplicantTestSession?
  applicantResult     ApplicantResult?
  applicantScholarship ApplicantScholarship?
  admissionDecisions  AdmissionDecision_Record[]
  
  @@unique([campaignId, email])  // One application per email per campaign
  @@index([campaignId])
  @@index([email])
  @@index([accessToken])
  @@index([applicationNumber])
  @@index([status])
  @@index([registeredAt])
}
```

### 6. ApplicantTestSession (Test-taking session for applicant)

```prisma
model ApplicantTestSession {
  id                  String          @id @default(uuid())
  applicantId         String          @unique  // 1:1 — one session per applicant per campaign
  campaignId          String          // Denormalized for query performance
  
  // Session Lifecycle
  status              SessionStatus   @default(NOT_STARTED) // Reuse existing enum
  startedAt           DateTime?
  submittedAt         DateTime?
  timeSpent           Int?            // Total seconds
  
  // Anti-Cheat Metrics
  ipAddress           String?
  userAgent           String?
  tabSwitchCount      Int             @default(0)
  fullscreenExits     Int             @default(0)
  copyPasteAttempts   Int             @default(0)
  browserFingerprint  String?         // Browser fingerprint hash
  isFlagged           Boolean         @default(false)
  flagReason          String?
  
  // Question State
  questionOrder       Json?           // Shuffled question order [uuid, uuid, ...]
  optionOrders        Json?           // Shuffled options per question { questionId: [optId, optId] }
  
  // Metadata
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  // Relations
  applicant           Applicant       @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  applicantAnswers    ApplicantAnswer[]
  
  @@index([campaignId])
  @@index([status])
  @@index([applicantId])
}
```

### 7. ApplicantAnswer (Applicant's answers to test questions)

```prisma
model ApplicantAnswer {
  id                  String          @id @default(uuid())
  sessionId           String
  campaignQuestionId  String
  
  // Answer Content
  answerText          String?         // For short/long answer
  selectedOptionId    String?         // For MCQ (FK → McqOption)
  
  // UX State
  isMarkedForReview   Boolean         @default(false)
  answeredAt          DateTime?
  timeSpent           Int?            // Seconds on this question
  
  // Metadata
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  // Relations
  session             ApplicantTestSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  campaignQuestion    CampaignQuestion     @relation(fields: [campaignQuestionId], references: [id])
  selectedOption      McqOption?           @relation("ApplicantSelectedOption", fields: [selectedOptionId], references: [id])
  answerGrade         ApplicantAnswerGrade?
  
  @@unique([sessionId, campaignQuestionId])
  @@index([sessionId])
  @@index([campaignQuestionId])
}
```

### 8. ApplicantAnswerGrade (Grading for applicant answers)

```prisma
model ApplicantAnswerGrade {
  id                  String    @id @default(uuid())
  applicantAnswerId   String    @unique  // 1:1
  
  // Grading
  gradedBy            GradedBy  // SYSTEM | AI | TEACHER (reuse existing enum)
  graderId            String?   // If teacher-graded
  marksAwarded        Decimal
  maxMarks            Decimal
  feedback            String?
  
  // AI Metadata
  aiConfidence        Decimal?
  aiModelUsed         String?
  aiPromptTokens      Int?
  aiResponseTokens    Int?
  aiReasoning         String?   // Internal AI reasoning (admin-only)
  
  // Review
  isReviewed          Boolean   @default(false)
  reviewedAt          DateTime?
  
  // Negative marking
  isNegativeMarked    Boolean   @default(false)  // Was this a wrong MCQ with negative marking?
  negativeMarks       Decimal?  // Marks deducted
  
  // Metadata
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  applicantAnswer     ApplicantAnswer @relation(fields: [applicantAnswerId], references: [id], onDelete: Cascade)
  grader              User?           @relation("ApplicantGraderUser", fields: [graderId], references: [id])
  
  @@index([gradedBy])
  @@index([isReviewed])
}
```

### 9. ApplicantResult (Aggregated result per applicant)

```prisma
model ApplicantResult {
  id              String    @id @default(uuid())
  applicantId     String    @unique  // 1:1
  campaignId      String    // Denormalized
  
  // Scores
  totalMarks      Decimal   // Max possible
  obtainedMarks   Decimal   // Total obtained (after negative marking if applicable)
  percentage      Decimal
  
  // Ranking
  rank            Int?      // Rank within this campaign
  percentile      Decimal?  // Percentile rank
  
  // Grading
  grade           String?   // Letter grade (optional)
  isPassed        Boolean   // Above passingMarks?
  
  // Section-wise Breakdown (JSON for flexibility)
  sectionScores   Json?     // { "Section A": { total: 40, obtained: 35 }, "Section B": { ... } }
  
  // Metadata
  computedAt      DateTime  @default(now())
  publishedAt     DateTime? // When result was made visible to applicant
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  applicant       Applicant @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  
  @@index([campaignId])
  @@index([rank])
  @@index([percentage])
  @@index([isPassed])
}
```

### 10. ApplicantScholarship (Scholarship assignment for applicant)

```prisma
model ApplicantScholarship {
  id                  String           @id @default(uuid())
  applicantId         String           @unique // 1:1
  campaignId          String
  tierId              String           // FK → CampaignScholarshipTier
  
  // Scholarship Details
  tier                ScholarshipTier  // Denormalized for query perf
  percentageAwarded   Decimal          // Actual scholarship percentage
  
  // Status
  isAccepted          Boolean?         // null = pending, true = accepted, false = declined
  acceptedAt          DateTime?
  declinedAt          DateTime?
  
  // Validity
  validFrom           DateTime?
  validUntil          DateTime?        // Scholarship expiry
  
  // Renewal (for multi-year scholarships)
  isRenewable         Boolean          @default(false)
  renewalCriteria     Json?            // { minGPA: 3.5, minAttendance: 80 }
  
  // Metadata
  awardedAt           DateTime         @default(now())
  awardedById         String?          // Admin who approved
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  
  // Relations
  applicant           Applicant                @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  scholarshipTier     CampaignScholarshipTier  @relation(fields: [tierId], references: [id])
  awardedBy           User?                    @relation("ScholarshipAwarder", fields: [awardedById], references: [id])
  
  @@index([campaignId])
  @@index([tier])
  @@index([isAccepted])
}
```

### 11. AdmissionDecision_Record (Admission decisions with audit trail)

```prisma
model AdmissionDecision_Record {
  id              String              @id @default(uuid())
  applicantId     String
  campaignId      String
  
  // Decision
  decision        AdmissionDecision   // ACCEPTED | REJECTED | WAITLISTED | SCHOLARSHIP_OFFERED
  stage           EvaluationStage     // Which stage this decision was made at
  
  // Details
  remarks         String?
  conditions      String?             // "Subject to document verification"
  
  // Assigned Class (when accepted)
  assignedClassId   String?           // Where the student will be placed
  assignedSectionId String?
  
  // Decision Maker
  decidedById     String
  decidedAt       DateTime            @default(now())
  
  // Metadata
  createdAt       DateTime            @default(now())
  
  // Relations
  applicant       Applicant           @relation(fields: [applicantId], references: [id])
  decidedBy       User                @relation(fields: [decidedById], references: [id])
  assignedClass   Class?              @relation("AdmissionClass", fields: [assignedClassId], references: [id])
  assignedSection Section?            @relation("AdmissionSection", fields: [assignedSectionId], references: [id])
  
  @@index([applicantId])
  @@index([campaignId])
  @@index([decision])
  @@index([decidedAt])
}
```

---

## Modifications to Existing Models

### Question model — Add relation for CampaignQuestion

```prisma
// Add to existing Question model:
model Question {
  // ... existing fields ...
  campaignQuestions  CampaignQuestion[]  // NEW: questions used in campaigns
}
```

### McqOption model — Add relation for ApplicantAnswer

```prisma
// Add to existing McqOption model:
model McqOption {
  // ... existing fields ...
  applicantAnswers  ApplicantAnswer[] @relation("ApplicantSelectedOption")  // NEW
}
```

### User model — Add new relations

```prisma
// Add to existing User model:
model User {
  // ... existing fields ...
  campaignsCreated        TestCampaign[]            // NEW
  applicantGrades         ApplicantAnswerGrade[]     @relation("ApplicantGraderUser") // NEW
  scholarshipsAwarded     ApplicantScholarship[]     @relation("ScholarshipAwarder")  // NEW
  admissionDecisionsMade  AdmissionDecision_Record[] // NEW
}
```

### Class model — Add relations

```prisma
model Class {
  // ... existing fields ...
  testCampaigns           TestCampaign[]              // NEW
  admissionPlacements     AdmissionDecision_Record[]  @relation("AdmissionClass") // NEW
}
```

### Section model — Add relations

```prisma
model Section {
  // ... existing fields ...
  admissionPlacements     AdmissionDecision_Record[]  @relation("AdmissionSection") // NEW
}
```

### AcademicSession model — Add relation

```prisma
model AcademicSession {
  // ... existing fields ...
  testCampaigns TestCampaign[]  // NEW
}
```

---

## Indexing Strategy

### Composite Indexes for Common Queries

```prisma
// Campaign listing by status + type
@@index([type, status])

// Applicant search within campaign
@@index([campaignId, status])
@@index([campaignId, email])

// Result ranking queries
@@index([campaignId, percentage])
@@index([campaignId, rank])

// Session status monitoring
@@index([campaignId, status])

// Temporal queries
@@index([registeredAt, status])
```

### Full-Text Search Indexes

```sql
-- For applicant search across campaigns
CREATE INDEX idx_applicant_fulltext ON "Applicant" USING GIN (
  to_tsvector('english', "firstName" || ' ' || "lastName" || ' ' || COALESCE("email", ''))
);
```

---

## Migration Notes

1. **Non-breaking migration** — all new tables, no modifications to existing table structures (only new columns/relations on existing models that are nullable or have defaults)
2. **Schema naming** — `AdmissionDecision_Record` uses underscore to avoid collision with `AdmissionDecision` enum
3. **Soft deletes** — `TestCampaign` has `deletedAt` for soft-delete support
4. **UUID everywhere** — consistent with existing schema convention
5. **Denormalized fields** — `campaignId` denormalized on `ApplicantTestSession`, `ApplicantResult`, and `ApplicantScholarship` for query performance
6. **JSON flexibility** — `eligibilityCriteria`, `documentUrls`, `sectionScores`, `questionOrder`, `optionOrders`, `renewalCriteria` use JSON for flexible, evolving data structures
