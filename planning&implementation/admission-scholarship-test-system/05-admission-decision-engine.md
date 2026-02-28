# Admission Test & Scholarship Test — Admission Decision Engine

> **Date:** February 28, 2026
> **Scope:** Merit list generation, cutoff management, acceptance workflow, waitlist handling

---

## 1. Merit List Generation Algorithm

### Primary Ranking Logic

```typescript
interface MeritListConfig {
  campaignId: string;
  sortCriteria: MeritSortCriterion[];
  cutoffMarks?: number;         // Minimum marks to be shortlisted
  cutoffPercentage?: number;    // Minimum % to be shortlisted
  maxShortlisted?: number;      // Max seats (from campaign.maxSeats)
}

interface MeritSortCriterion {
  field: 'percentage' | 'obtainedMarks' | 'timeSpent' | 'negativeMarks' | 'submittedAt';
  direction: 'asc' | 'desc';
  priority: number; // 1 = primary, 2 = tiebreaker1, etc.
}

// Default sort: 
// 1. percentage DESC (highest score first)
// 2. negativeMarksCount ASC (fewer wrong answers first — tiebreaker)
// 3. timeSpent ASC (faster completion first)
// 4. submittedAt ASC (earlier submission first)
```

### Merit List Generation Service

```typescript
async function generateMeritList(config: MeritListConfig): Promise<MeritListResult> {
  const { campaignId, cutoffMarks, cutoffPercentage, maxShortlisted } = config;
  
  // 1. Fetch all graded results for this campaign
  const results = await prisma.applicantResult.findMany({
    where: { campaignId },
    include: {
      applicant: {
        include: {
          testSession: true, // For timeSpent, anti-cheat flags
        }
      }
    },
    orderBy: [
      { percentage: 'desc' },
      // Tiebreakers handled in application code for complex logic
    ]
  });
  
  // 2. Apply tiebreaker sort (DB can't do all of them)
  const sorted = results.sort((a, b) => {
    // Primary: percentage DESC
    if (a.percentage !== b.percentage) return Number(b.percentage) - Number(a.percentage);
    
    // Tiebreaker 1: negative marks count ASC (fewer negative = better)
    const aNeg = countNegativeMarks(a.applicant.testSession);
    const bNeg = countNegativeMarks(b.applicant.testSession);
    if (aNeg !== bNeg) return aNeg - bNeg;
    
    // Tiebreaker 2: time spent ASC (faster = better)
    const aTime = a.applicant.testSession?.timeSpent ?? Infinity;
    const bTime = b.applicant.testSession?.timeSpent ?? Infinity;
    if (aTime !== bTime) return aTime - bTime;
    
    // Tiebreaker 3: submission time ASC (earlier = better)
    const aSubmit = a.applicant.testSession?.submittedAt?.getTime() ?? Infinity;
    const bSubmit = b.applicant.testSession?.submittedAt?.getTime() ?? Infinity;
    return aSubmit - bSubmit;
  });
  
  // 3. Assign ranks (handle ties — same score = same rank)
  let currentRank = 0;
  let previousPercentage: number | null = null;
  const ranked = sorted.map((result, index) => {
    const pct = Number(result.percentage);
    if (pct !== previousPercentage) {
      currentRank = index + 1;
      previousPercentage = pct;
    }
    return { ...result, rank: currentRank };
  });
  
  // 4. Determine cutoff and shortlist
  const shortlisted: string[] = [];
  const rejected: string[] = [];
  const waitlisted: string[] = [];
  
  for (const entry of ranked) {
    const pct = Number(entry.percentage);
    const marks = Number(entry.obtainedMarks);
    
    // Check if applicant's session was flagged for cheating
    if (entry.applicant.testSession?.isFlagged) {
      // Flagged applicants go to manual review, not auto-shortlisted
      continue;
    }
    
    // Check against cutoff
    const meetsCutoff = (
      (cutoffMarks == null || marks >= cutoffMarks) &&
      (cutoffPercentage == null || pct >= cutoffPercentage)
    );
    
    if (!meetsCutoff) {
      rejected.push(entry.applicantId);
      continue;
    }
    
    // Check against max seats
    if (maxShortlisted && shortlisted.length >= maxShortlisted) {
      waitlisted.push(entry.applicantId);
      continue;
    }
    
    shortlisted.push(entry.applicantId);
  }
  
  // 5. Persist ranks and statuses in a transaction
  await prisma.$transaction(async (tx) => {
    // Update ranks on all results
    for (const entry of ranked) {
      await tx.applicantResult.update({
        where: { id: entry.id },
        data: { rank: entry.rank }
      });
    }
    
    // Update applicant statuses
    if (shortlisted.length > 0) {
      await tx.applicant.updateMany({
        where: { id: { in: shortlisted } },
        data: { status: 'SHORTLISTED' }
      });
    }
    if (rejected.length > 0) {
      await tx.applicant.updateMany({
        where: { id: { in: rejected } },
        data: { status: 'REJECTED' }
      });
    }
    if (waitlisted.length > 0) {
      await tx.applicant.updateMany({
        where: { id: { in: waitlisted } },
        data: { status: 'WAITLISTED' }
      });
    }
  });
  
  return {
    totalApplicants: ranked.length,
    shortlisted: shortlisted.length,
    rejected: rejected.length,
    waitlisted: waitlisted.length,
    cutoffApplied: { marks: cutoffMarks, percentage: cutoffPercentage },
  };
}
```

---

## 2. Decision Workflow

### Single Decision Flow (Admin)

```
Admin views Merit List page
  │
  ├── See all applicants ranked by merit
  │   ├── Rank, Name, Score, %, Status, Actions
  │
  ├── For SHORTLISTED applicants:
  │   ├── [Accept] → Confirm class/section → Create Decision record → Status: ACCEPTED
  │   ├── [Reject] → Add remarks → Create Decision record → Status: REJECTED
  │   └── [Waitlist] → Create Decision record → Status: WAITLISTED
  │
  ├── For WAITLISTED applicants:
  │   ├── [Accept] → When seat frees up → Status: ACCEPTED
  │   └── [Reject] → Final rejection → Status: REJECTED
  │
  └── For ACCEPTED applicants:
      └── [Convert to Student] → Create User + StudentProfile → Status: ENROLLED
```

### Bulk Decision Flow

```typescript
async function bulkAcceptApplicants(input: {
  applicantIds: string[];
  classId: string;
  sectionId: string;
  decidedById: string;
}) {
  const { applicantIds, classId, sectionId, decidedById } = input;
  
  // 1. Validate all applicants are SHORTLISTED
  const applicants = await prisma.applicant.findMany({
    where: { id: { in: applicantIds }, status: 'SHORTLISTED' }
  });
  
  if (applicants.length !== applicantIds.length) {
    throw new ValidationError('Some applicants are not in SHORTLISTED status');
  }
  
  // 2. Check seat availability
  const campaign = await prisma.testCampaign.findUnique({
    where: { id: applicants[0].campaignId }
  });
  
  const alreadyAccepted = await prisma.applicant.count({
    where: { campaignId: campaign.id, status: { in: ['ACCEPTED', 'ENROLLED'] } }
  });
  
  if (campaign.maxSeats && (alreadyAccepted + applicantIds.length) > campaign.maxSeats) {
    throw new ConflictError(`Only ${campaign.maxSeats - alreadyAccepted} seats remaining`);
  }
  
  // 3. Bulk accept in transaction
  await prisma.$transaction(async (tx) => {
    // Update statuses
    await tx.applicant.updateMany({
      where: { id: { in: applicantIds } },
      data: { status: 'ACCEPTED' }
    });
    
    // Create decision records
    await tx.admissionDecision_Record.createMany({
      data: applicantIds.map(id => ({
        applicantId: id,
        campaignId: campaign.id,
        decision: 'ACCEPTED',
        stage: 'FINAL_DECISION',
        assignedClassId: classId,
        assignedSectionId: sectionId,
        decidedById,
      }))
    });
  });
  
  // 4. Send acceptance emails
  for (const applicant of applicants) {
    await sendEmail({
      to: applicant.email,
      subject: `Admission Offered - ${campaign.name}`,
      template: 'admission-accepted',
      data: {
        name: applicant.firstName,
        applicationNumber: applicant.applicationNumber,
        campaignName: campaign.name,
      }
    });
  }
}
```

---

## 3. Waitlist Management

### Waitlist Position Calculation

```typescript
// Waitlist position = rank among WAITLISTED applicants
// Ordered by their merit rank (from merit list)
async function getWaitlistWithPositions(campaignId: string) {
  const waitlistedResults = await prisma.applicantResult.findMany({
    where: {
      campaignId,
      applicant: { status: 'WAITLISTED' }
    },
    include: { applicant: true },
    orderBy: { rank: 'asc' } // Lower rank = higher priority on waitlist
  });
  
  return waitlistedResults.map((result, index) => ({
    applicant: result.applicant,
    meritRank: result.rank,
    waitlistPosition: index + 1,
    score: result.obtainedMarks,
    percentage: result.percentage,
  }));
}
```

### Waitlist Promotion Logic

```typescript
// When an ACCEPTED applicant declines or doesn't complete enrollment:
async function promoteFromWaitlist(campaignId: string, decidedById: string) {
  // 1. Find available seats
  const campaign = await prisma.testCampaign.findUnique({
    where: { id: campaignId }
  });
  
  const acceptedCount = await prisma.applicant.count({
    where: { campaignId, status: { in: ['ACCEPTED', 'ENROLLED'] } }
  });
  
  const availableSeats = (campaign.maxSeats ?? Infinity) - acceptedCount;
  
  if (availableSeats <= 0) return { promoted: 0 };
  
  // 2. Get top N from waitlist
  const waitlist = await getWaitlistWithPositions(campaignId);
  const toPromote = waitlist.slice(0, availableSeats);
  
  if (toPromote.length === 0) return { promoted: 0 };
  
  // 3. Promote
  const ids = toPromote.map(w => w.applicant.id);
  await prisma.$transaction(async (tx) => {
    await tx.applicant.updateMany({
      where: { id: { in: ids } },
      data: { status: 'ACCEPTED' }
    });
    
    await tx.admissionDecision_Record.createMany({
      data: ids.map(id => ({
        applicantId: id,
        campaignId,
        decision: 'ACCEPTED',
        stage: 'FINAL_DECISION',
        remarks: 'Promoted from waitlist',
        decidedById,
      }))
    });
  });
  
  // 4. Email notifications
  for (const entry of toPromote) {
    await sendEmail({
      to: entry.applicant.email,
      subject: 'Admission Offered - Waitlist Promotion',
      template: 'waitlist-promoted',
      data: { name: entry.applicant.firstName }
    });
  }
  
  return { promoted: toPromote.length };
}
```

---

## 4. Enrollment (Convert Applicant to Student)

### Conversion Logic

```typescript
async function convertApplicantToStudent(
  applicantId: string, 
  classId: string, 
  sectionId: string,
  convertedById: string
): Promise<{ userId: string; studentProfileId: string }> {
  
  const applicant = await prisma.applicant.findUnique({
    where: { id: applicantId }
  });
  
  if (!applicant || applicant.status !== 'ACCEPTED') {
    throw new ValidationError('Applicant must be in ACCEPTED status');
  }
  
  // Check if email already exists as a User (edge case: internal student applying)
  const existingUser = await prisma.user.findUnique({
    where: { email: applicant.email }
  });
  
  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }
  
  // Generate credentials
  const temporaryPassword = generateSecurePassword(); // "Adm@2026-XXXX"
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  
  // Generate roll number
  const rollNumber = await generateRollNumber(classId, sectionId);
  
  // Transaction: create User + StudentProfile + update Applicant
  const result = await prisma.$transaction(async (tx) => {
    // Create User
    const user = await tx.user.create({
      data: {
        email: applicant.email,
        passwordHash,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        role: 'STUDENT',
        phone: applicant.phone,
        isActive: true,
      }
    });
    
    // Create StudentProfile
    const profile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        rollNumber,
        registrationNo: applicant.applicationNumber, // Use application number as registration
        classId,
        sectionId,
        guardianName: applicant.guardianName,
        guardianPhone: applicant.guardianPhone,
        dateOfBirth: applicant.dateOfBirth,
        gender: applicant.gender,
        status: 'ACTIVE',
      }
    });
    
    // Mark applicant as enrolled
    await tx.applicant.update({
      where: { id: applicantId },
      data: { status: 'ENROLLED' }
    });
    
    // Audit log
    await tx.auditLog.create({
      data: {
        userId: convertedById,
        action: 'APPLICANT_ENROLLED',
        entityType: 'Applicant',
        entityId: applicantId,
        metadata: {
          newUserId: user.id,
          newStudentProfileId: profile.id,
          classId,
          sectionId,
        }
      }
    });
    
    return { userId: user.id, studentProfileId: profile.id };
  });
  
  // Send welcome email (outside transaction)
  await sendEmail({
    to: applicant.email,
    subject: 'Welcome to School - Your Login Credentials',
    template: 'student-welcome',
    data: {
      name: applicant.firstName,
      email: applicant.email,
      temporaryPassword,
      loginUrl: `${BASE_URL}/login`,
      className: `Class ${classId}`,
      rollNumber,
    }
  });
  
  return result;
}
```

### Bulk Enrollment

```typescript
async function bulkConvertToStudents(
  applicantIds: string[],
  classId: string,
  sectionId: string,
  convertedById: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  // Process sequentially to handle roll number generation properly
  for (const applicantId of applicantIds) {
    try {
      await convertApplicantToStudent(applicantId, classId, sectionId, convertedById);
      success++;
    } catch (error) {
      failed++;
      errors.push(`Applicant ${applicantId}: ${error.message}`);
    }
  }
  
  return { success, failed, errors };
}
```

---

## 5. Decision Analytics

### Dashboard Metrics for Decisions

```typescript
interface DecisionDashboard {
  // Funnel metrics
  totalRegistered: number;
  totalVerified: number;
  totalTested: number;
  totalGraded: number;
  totalShortlisted: number;
  totalAccepted: number;
  totalEnrolled: number;
  totalRejected: number;
  totalWaitlisted: number;
  
  // Conversion rates
  registrationToTestRate: number;  // verified → took test
  testToShortlistRate: number;     // tested → shortlisted
  shortlistToEnrollmentRate: number; // shortlisted → enrolled
  overallConversionRate: number;   // registered → enrolled
  
  // Score distribution
  scoreDistribution: { range: string; count: number }[];
  averageScore: number;
  medianScore: number;
  highestScore: number;
  lowestPassingScore: number;
  
  // Seat utilization
  totalSeats: number;
  filledSeats: number;
  remainingSeats: number;
  waitlistLength: number;
}
```

---

## 6. Admin Merit List UI

```
┌──────────────────────────────────────────────────────────────┐
│ Merit List — Class 6 Admission Test 2026-27                   │
│ Status: RESULTS_PUBLISHED | Total Applicants: 342             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Filters: [Status ▼] [Score Range: ___-___] [Search: ____]   │
│                                                               │
│  ┌────┬─────┬─────────────┬──────┬──────┬────────┬─────────┐ │
│  │Rank│ App#│ Name         │Score │ %    │Status  │ Actions │ │
│  ├────┼─────┼─────────────┼──────┼──────┼────────┼─────────┤ │
│  │ 1  │ 0089│ Fatima Zahra │95/100│95.0% │ACCEPTED│ [Enroll]│ │
│  │ 2  │ 0042│ Ahmed Khan   │92/100│92.0% │ACCEPTED│ [Enroll]│ │
│  │ 3  │ 0156│ Sara Ali     │78/100│78.0% │SHORT.  │ [Accept]│ │
│  │ 4  │ 0211│ Usman Raza   │75/100│75.0% │SHORT.  │ [Accept]│ │
│  │... │ ... │ ...          │ ...  │ ...  │ ...    │ ...     │ │
│  │120 │ 0303│ Hamza Malik  │42/100│42.0% │WAIT.   │ [Accept]│ │
│  │121 │ 0287│ Aisha Butt   │40/100│40.0% │REJECTED│ —       │ │
│  └────┴─────┴─────────────┴──────┴──────┴────────┴─────────┘ │
│                                                               │
│  Summary:                                                     │
│  ├── Shortlisted: 135  │ Accepted: 98  │ Enrolled: 45        │
│  ├── Waitlisted: 23    │ Rejected: 184 │ Pending: 37         │
│  └── Seats: 98/120 filled                                     │
│                                                               │
│  Bulk Actions:                                                │
│  [Select All Shortlisted] [Bulk Accept] [Bulk Reject]         │
│  [Auto-Assign Scholarships] [Export Merit List CSV]            │
│  [Bulk Enroll Accepted]                                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```
