# Admission Test & Scholarship Test — Scholarship Tier System

> **Date:** February 28, 2026
> **Scope:** Tier configuration, auto-assignment, renewal logic, scholarship lifecycle

---

## 1. Scholarship Tier Architecture

### Tier Model

Each campaign can define multiple scholarship tiers with:
- **Percentage-based thresholds** — score percentage determines tier
- **Seat limits** — max recipients per tier
- **Priority ordering** — highest tier evaluated first (cascading)

### Default Tier Configuration

```typescript
const DEFAULT_SCHOLARSHIP_TIERS = [
  {
    tier: 'FULL_100',
    name: 'Full Merit Scholarship',
    minPercentage: 90.0,
    maxRecipients: 5,
    benefitDetails: '100% tuition waiver for the first academic year',
    sortOrder: 1,
  },
  {
    tier: 'SEVENTY_FIVE',
    name: '75% Scholarship',
    minPercentage: 80.0,
    maxRecipients: 10,
    benefitDetails: '75% tuition waiver for the first academic year',
    sortOrder: 2,
  },
  {
    tier: 'HALF_50',
    name: '50% Scholarship',
    minPercentage: 70.0,
    maxRecipients: 20,
    benefitDetails: '50% tuition waiver for the first academic year',
    sortOrder: 3,
  },
  {
    tier: 'QUARTER_25',
    name: '25% Scholarship',
    minPercentage: 60.0,
    maxRecipients: 30,
    benefitDetails: '25% tuition waiver for the first academic year',
    sortOrder: 4,
  },
];
```

---

## 2. Auto-Assignment Algorithm

### Logic

Scholarship assignment follows a **cascading waterfall** approach:
1. Sort applicants by percentage DESC (same order as merit list)
2. For each applicant, check eligibility for highest tier first
3. Assign the highest tier they qualify for (if seats available)
4. If tier is full, try next lower tier
5. If no tier available, assign NONE

```typescript
async function autoAssignScholarships(campaignId: string): Promise<ScholarshipAssignmentResult> {
  // 1. Get scholarship tiers for this campaign (ordered by sortOrder ASC = highest first)
  const tiers = await prisma.campaignScholarshipTier.findMany({
    where: { campaignId, isActive: true },
    orderBy: { sortOrder: 'asc' }
  });
  
  if (tiers.length === 0) {
    throw new ValidationError('No scholarship tiers configured for this campaign');
  }
  
  // 2. Get all graded results, ordered by percentage DESC
  const results = await prisma.applicantResult.findMany({
    where: { 
      campaignId, 
      isPassed: true, // Only passing applicants eligible
      applicant: { 
        status: { in: ['SHORTLISTED', 'ACCEPTED'] },
        testSession: { isFlagged: false } // Exclude flagged sessions
      }
    },
    include: { applicant: true },
    orderBy: { percentage: 'desc' }
  });
  
  // 3. Track seats per tier
  const tierSeats: Map<string, number> = new Map();
  for (const tier of tiers) {
    // Count already assigned
    const existing = await prisma.applicantScholarship.count({
      where: { tierId: tier.id }
    });
    const remaining = (tier.maxRecipients ?? Infinity) - existing;
    tierSeats.set(tier.id, Math.max(0, remaining));
  }
  
  // 4. Assign scholarships
  const assignments: { applicantId: string; tierId: string; tier: ScholarshipTier; percentage: number }[] = [];
  
  for (const result of results) {
    const pct = Number(result.percentage);
    
    // Skip if already has a scholarship
    const existing = await prisma.applicantScholarship.findUnique({
      where: { applicantId: result.applicantId }
    });
    if (existing) continue;
    
    // Try tiers from highest to lowest
    let assigned = false;
    for (const tier of tiers) {
      if (pct >= Number(tier.minPercentage)) {
        const remaining = tierSeats.get(tier.id) ?? 0;
        if (remaining > 0) {
          assignments.push({
            applicantId: result.applicantId,
            tierId: tier.id,
            tier: tier.tier,
            percentage: pct,
          });
          tierSeats.set(tier.id, remaining - 1);
          assigned = true;
          break;
        }
        // Tier full → try next lower tier
      }
    }
    // If no tier assigned, applicant gets no scholarship (NONE)
  }
  
  // 5. Persist assignments in transaction
  await prisma.$transaction(async (tx) => {
    for (const a of assignments) {
      await tx.applicantScholarship.create({
        data: {
          applicantId: a.applicantId,
          campaignId,
          tierId: a.tierId,
          tier: a.tier,
          percentageAwarded: getScholarshipPercentage(a.tier), // 100, 75, 50, 25
        }
      });
    }
  });
  
  return {
    totalEligible: results.length,
    totalAssigned: assignments.length,
    perTier: tiers.map(t => ({
      tierName: t.name,
      assigned: assignments.filter(a => a.tierId === t.id).length,
      maxRecipients: t.maxRecipients,
    }))
  };
}

function getScholarshipPercentage(tier: ScholarshipTier): number {
  const map = {
    'FULL_100': 100,
    'SEVENTY_FIVE': 75,
    'HALF_50': 50,
    'QUARTER_25': 25,
    'NONE': 0,
  };
  return map[tier] ?? 0;
}
```

---

## 3. Scholarship Decision Workflow

### Admin Actions

| Action | When | What Happens |
|--------|------|-------------|
| `autoAssignScholarshipsAction` | After results are ready | Auto-assign based on tiers + score |
| `manualAssignScholarshipAction` | Any time after grading | Admin manually assigns a tier to an applicant |
| `upgradeScholarshipTierAction` | After initial assignment | Change to a higher tier (e.g., 50% → 75%) |
| `revokeScholarshipAction` | Before enrollment | Remove scholarship assignment with reason |
| `acceptScholarshipAction` | Applicant confirms | Mark `isAccepted: true` |
| `declineScholarshipAction` | Applicant declines | Mark `isAccepted: false` → offer to next on waitlist |

### Scholarship Acceptance Flow (Applicant-Facing)

```
1. Results published → Applicant checks result
2. If scholarship awarded → "You have been awarded X% Scholarship!"
3. Applicant sees: [Accept Scholarship] [Decline Scholarship]
4. Accept → isAccepted: true, acceptedAt: now
5. Decline → isAccepted: false, declinedAt: now
   → System auto-offers to next eligible applicant (if configured)
```

### Scholarship Offer Cascade

When an applicant declines a scholarship:

```typescript
async function handleScholarshipDecline(scholarshipId: string) {
  const scholarship = await prisma.applicantScholarship.findUnique({
    where: { id: scholarshipId },
    include: { scholarshipTier: true }
  });
  
  // Mark as declined
  await prisma.applicantScholarship.update({
    where: { id: scholarshipId },
    data: { isAccepted: false, declinedAt: new Date() }
  });
  
  // Find next eligible applicant for this tier
  const nextEligible = await prisma.applicantResult.findFirst({
    where: {
      campaignId: scholarship.campaignId,
      percentage: { gte: scholarship.scholarshipTier.minPercentage },
      applicant: {
        status: { in: ['SHORTLISTED', 'ACCEPTED'] },
        applicantScholarship: null, // No scholarship assigned yet
      }
    },
    orderBy: { percentage: 'desc' }
  });
  
  if (nextEligible) {
    // Auto-offer to next person
    await prisma.applicantScholarship.create({
      data: {
        applicantId: nextEligible.applicantId,
        campaignId: scholarship.campaignId,
        tierId: scholarship.tierId,
        tier: scholarship.tier,
        percentageAwarded: scholarship.percentageAwarded,
      }
    });
    
    // Email the new recipient
    await sendEmail({
      to: nextEligible.applicant.email,
      subject: 'Scholarship Offered!',
      template: 'scholarship-offered',
      data: { tier: scholarship.scholarshipTier.name }
    });
  }
}
```

---

## 4. Scholarship Renewal System

### Renewal Configuration

For multi-year scholarships (e.g., "Full scholarship for 4 years if maintaining GPA"):

```typescript
interface RenewalCriteria {
  minPercentage: number;       // Min academic percentage to maintain
  minAttendance?: number;      // Min attendance % (future feature)
  maxDisciplinaryActions?: number; // Max disciplinary actions allowed
  reviewPeriod: 'SEMESTER' | 'ANNUAL'; // How often to review
}

// Stored as JSON in ApplicantScholarship.renewalCriteria
// Example: { minPercentage: 80, reviewPeriod: 'ANNUAL' }
```

### Renewal Check (Annual Job)

```typescript
async function checkScholarshipRenewals(academicSessionId: string) {
  // Find all renewable scholarships
  const scholarships = await prisma.applicantScholarship.findMany({
    where: {
      isRenewable: true,
      isAccepted: true,
      validUntil: null, // Not yet expired
    },
    include: {
      applicant: {
        include: {
          // After enrollment, we need to check the student's performance
          // This requires the applicant's linked User/StudentProfile
        }
      }
    }
  });
  
  for (const scholarship of scholarships) {
    const criteria = scholarship.renewalCriteria as RenewalCriteria;
    if (!criteria) continue;
    
    // Find the enrolled student
    const user = await prisma.user.findUnique({
      where: { email: scholarship.applicant.email },
      include: { examResults: true }
    });
    
    if (!user) continue;
    
    // Calculate student's average percentage this year
    const yearResults = user.examResults.filter(r => 
      // Filter by current academic session
      true // TODO: filter by academicSessionId
    );
    
    const avgPercentage = yearResults.reduce((sum, r) => sum + Number(r.percentage), 0) / yearResults.length;
    
    if (avgPercentage < criteria.minPercentage) {
      // Scholarship revoked — notify admin
      await createNotification({
        userId: 'ADMIN_ID', // System notification
        title: 'Scholarship Review Required',
        message: `${scholarship.applicant.firstName} ${scholarship.applicant.lastName}'s avg: ${avgPercentage}% (min: ${criteria.minPercentage}%)`,
        type: 'SYSTEM',
      });
    }
  }
}
```

---

## 5. Scholarship Analytics

### Dashboard Metrics

```typescript
interface ScholarshipDashboard {
  // Per campaign
  campaignId: string;
  campaignName: string;
  
  // Tier distribution
  tiers: {
    name: string;
    tier: ScholarshipTier;
    maxRecipients: number;
    assigned: number;
    accepted: number;
    declined: number;
    pending: number;
  }[];
  
  // Financials (estimated)
  estimatedTotalScholarshipValue: number; // Sum of (tier% × annual fee) per recipient
  actualAwarded: number;
  
  // Funnel
  totalEligible: number;    // Score above minimum tier threshold
  totalOffered: number;     // Scholarship assigned
  totalAccepted: number;    // Accepted the offer
  acceptanceRate: number;   // offered → accepted
  
  // Distribution
  scoreDistributionOfRecipients: { range: string; count: number }[];
  averageScoreOfRecipients: number;
}
```

### Admin Scholarship Report UI

```
┌──────────────────────────────────────────────────────────────┐
│ Scholarship Report — Class 6 Admission 2026-27               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │ 65        │ │ 58        │ │ 89.2%     │ │ ₨12.5L    │   │
│  │ Total     │ │ Accepted  │ │ Acceptance│ │ Estimated  │   │
│  │ Offered   │ │           │ │ Rate      │ │ Value      │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                               │
│  Tier Breakdown:                                              │
│  ┌──────────────────┬──────┬─────────┬──────────┬─────────┐ │
│  │ Tier              │ Max  │ Offered │ Accepted │ Declined│ │
│  ├──────────────────┼──────┼─────────┼──────────┼─────────┤ │
│  │ 100% Scholarship │ 5    │ 5       │ 5        │ 0       │ │
│  │ 75% Scholarship  │ 10   │ 10      │ 9        │ 1       │ │
│  │ 50% Scholarship  │ 20   │ 20      │ 18       │ 2       │ │
│  │ 25% Scholarship  │ 30   │ 30      │ 26       │ 4       │ │
│  └──────────────────┴──────┴─────────┴──────────┴─────────┘ │
│                                                               │
│  [Export Report CSV] [Export Report PDF]                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Combined Admission + Scholarship Flow Summary

```
Campaign Type: ADMISSION_SCHOLARSHIP

1. Admin creates campaign with scholarship tiers ✅
2. Applicants register and take test ✅
3. Grading completes automatically ✅
4. Admin generates merit list (ranked by score) ✅
5. Admin runs "Auto-Assign Scholarships" ─── assigns tiers based on score ✅
6. Admin publishes results ─── applicants see score + scholarship tier ✅
7. Admin accepts/rejects applicants (separate from scholarship)
8. Accepted applicants see their scholarship tier and [Accept/Decline]
9. Declined scholarships cascade to next eligible applicant ✅
10. Admin converts accepted applicants to students (with scholarship info in metadata)
```
