# Admission Test & Scholarship Test — Analytics & Reporting

> **Date:** February 28, 2026
> **Scope:** Campaign analytics, funnel metrics, score distribution, export system, dashboards

---

## 1. Analytics Data Model

### Metrics to Track

| Category | Metric | Granularity | Storage |
|----------|--------|-------------|---------|
| Registration | Total registrations | Per campaign | Computed from Applicant count |
| Registration | Verified vs unverified | Per campaign | Computed from isEmailVerified |
| Registration | Registration rate over time | Daily | Computed from createdAt |
| Test Taking | Tests started | Per campaign | Computed from TestSession count |
| Test Taking | Tests completed | Per campaign | status = COMPLETED |
| Test Taking | Avg completion time | Per campaign | Computed from timeTaken |
| Test Taking | Dropout rate (started but not submitted) | Per campaign | status = IN_PROGRESS after deadline |
| Scoring | Score distribution | Per campaign | Computed from ApplicantResult |
| Scoring | Pass rate | Per campaign | isPassed = true / total |
| Scoring | Average score | Per campaign | AVG(percentage) |
| Scoring | Median score | Per campaign | Computed |
| Scoring | Per-question accuracy | Per question | % of correct answers |
| Decisions | Acceptance rate | Per campaign | ACCEPTED / total tested |
| Decisions | Waitlist promotion rate | Per campaign | WAITLISTED→ACCEPTED / WAITLISTED |
| Scholarships | Tier distribution | Per campaign | COUNT per tier |
| Scholarships | Acceptance rate | Per tier | isAccepted = true / offered |
| Scholarships | Financial impact | Per campaign | SUM of scholarship values |
| Enrollment | Conversion rate | Per campaign | Enrolled / accepted |
| Enrollment | Time to enrollment | Per campaign | AVG(enrolledAt - acceptedAt) |

---

## 2. Analytics Query Functions

```typescript
// src/modules/admissions/admission-analytics.ts

export async function getCampaignFunnelMetrics(campaignId: string) {
  const [
    totalRegistered,
    totalVerified,
    totalTestStarted,
    totalTestCompleted,
    totalPassed,
    totalAccepted,
    totalEnrolled,
  ] = await Promise.all([
    prisma.applicant.count({ where: { campaignId } }),
    prisma.applicant.count({ where: { campaignId, isEmailVerified: true } }),
    prisma.applicantTestSession.count({ where: { campaignId } }),
    prisma.applicantTestSession.count({ where: { campaignId, status: 'COMPLETED' } }),
    prisma.applicantResult.count({ where: { campaignId, isPassed: true } }),
    prisma.applicant.count({ where: { campaignId, status: 'ACCEPTED' } }),
    prisma.applicant.count({ where: { campaignId, status: 'ENROLLED' } }),
  ]);
  
  return {
    funnel: [
      { stage: 'Registered', count: totalRegistered, percentage: 100 },
      { stage: 'Verified', count: totalVerified, percentage: pct(totalVerified, totalRegistered) },
      { stage: 'Test Started', count: totalTestStarted, percentage: pct(totalTestStarted, totalRegistered) },
      { stage: 'Test Completed', count: totalTestCompleted, percentage: pct(totalTestCompleted, totalRegistered) },
      { stage: 'Passed', count: totalPassed, percentage: pct(totalPassed, totalRegistered) },
      { stage: 'Accepted', count: totalAccepted, percentage: pct(totalAccepted, totalRegistered) },
      { stage: 'Enrolled', count: totalEnrolled, percentage: pct(totalEnrolled, totalRegistered) },
    ],
    dropoffRates: {
      registrationToVerification: pct(totalRegistered - totalVerified, totalRegistered),
      verificationToTest: pct(totalVerified - totalTestStarted, totalVerified),
      testToCompletion: pct(totalTestStarted - totalTestCompleted, totalTestStarted),
      passToAcceptance: pct(totalPassed - totalAccepted, totalPassed),
      acceptanceToEnrollment: pct(totalAccepted - totalEnrolled, totalAccepted),
    }
  };
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 10000) / 100; // 2 decimal places
}

export async function getScoreDistribution(campaignId: string) {
  const results = await prisma.applicantResult.findMany({
    where: { campaignId },
    select: { percentage: true },
    orderBy: { percentage: 'asc' },
  });
  
  // Bucket into ranges
  const buckets = [
    { range: '0-10', min: 0, max: 10, count: 0 },
    { range: '11-20', min: 11, max: 20, count: 0 },
    { range: '21-30', min: 21, max: 30, count: 0 },
    { range: '31-40', min: 31, max: 40, count: 0 },
    { range: '41-50', min: 41, max: 50, count: 0 },
    { range: '51-60', min: 51, max: 60, count: 0 },
    { range: '61-70', min: 61, max: 70, count: 0 },
    { range: '71-80', min: 71, max: 80, count: 0 },
    { range: '81-90', min: 81, max: 90, count: 0 },
    { range: '91-100', min: 91, max: 100, count: 0 },
  ];
  
  for (const r of results) {
    const pct = Number(r.percentage);
    const bucket = buckets.find(b => pct >= b.min && pct <= b.max);
    if (bucket) bucket.count++;
  }
  
  // Stats
  const percentages = results.map(r => Number(r.percentage));
  const sorted = [...percentages].sort((a, b) => a - b);
  
  return {
    distribution: buckets,
    stats: {
      total: results.length,
      mean: percentages.reduce((s, v) => s + v, 0) / results.length || 0,
      median: sorted[Math.floor(sorted.length / 2)] ?? 0,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      stdDev: calculateStdDev(percentages),
    }
  };
}

export async function getQuestionAnalytics(campaignId: string) {
  const questions = await prisma.campaignQuestion.findMany({
    where: { campaignId },
    include: {
      question: { select: { id: true, text: true, type: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });
  
  const analytics = await Promise.all(
    questions.map(async (cq) => {
      const totalAnswers = await prisma.applicantAnswer.count({
        where: { campaignQuestion: { id: cq.id } },
      });
      
      const correctAnswers = await prisma.applicantAnswerGrade.count({
        where: {
          answer: { campaignQuestion: { id: cq.id } },
          isCorrect: true,
        },
      });
      
      const avgMarks = await prisma.applicantAnswerGrade.aggregate({
        where: { answer: { campaignQuestion: { id: cq.id } } },
        _avg: { marksAwarded: true },
      });
      
      return {
        questionId: cq.questionId,
        questionText: cq.question.text.substring(0, 80),
        questionType: cq.question.type,
        totalMarks: Number(cq.marks),
        totalAttempted: totalAnswers,
        correctCount: correctAnswers,
        accuracyRate: pct(correctAnswers, totalAnswers),
        avgMarksAwarded: Number(avgMarks._avg.marksAwarded ?? 0),
        difficulty: getDifficultyLabel(pct(correctAnswers, totalAnswers)),
      };
    })
  );
  
  return analytics;
}

function getDifficultyLabel(accuracyRate: number): string {
  if (accuracyRate >= 80) return 'Easy';
  if (accuracyRate >= 50) return 'Medium';
  if (accuracyRate >= 20) return 'Hard';
  return 'Very Hard';
}

export async function getRegistrationTimeline(campaignId: string) {
  const registrations = await prisma.applicant.findMany({
    where: { campaignId },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  
  // Group by date
  const dailyCounts = new Map<string, number>();
  for (const r of registrations) {
    const date = r.createdAt.toISOString().split('T')[0];
    dailyCounts.set(date, (dailyCounts.get(date) ?? 0) + 1);
  }
  
  let cumulative = 0;
  return Array.from(dailyCounts.entries()).map(([date, count]) => {
    cumulative += count;
    return { date, daily: count, cumulative };
  });
}

export async function getScholarshipDistribution(campaignId: string) {
  const tiers = await prisma.campaignScholarshipTier.findMany({
    where: { campaignId },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { scholarships: true } },
      scholarships: {
        select: { isAccepted: true },
      }
    }
  });
  
  return tiers.map(tier => ({
    tierName: tier.name,
    tier: tier.tier,
    maxRecipients: tier.maxRecipients,
    totalAwarded: tier._count.scholarships,
    accepted: tier.scholarships.filter(s => s.isAccepted === true).length,
    declined: tier.scholarships.filter(s => s.isAccepted === false).length,
    pending: tier.scholarships.filter(s => s.isAccepted === null).length,
    acceptanceRate: pct(
      tier.scholarships.filter(s => s.isAccepted === true).length,
      tier._count.scholarships
    ),
  }));
}
```

---

## 3. Analytics Dashboard UI

### Campaign Overview Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ Analytics — Class 6 Admission Test 2026-27                          │
│                                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 234      │ │ 72.3%    │ │ 68.5     │ │ 85.2%    │ │ 89.2%    │ │
│ │ Total    │ │ Pass     │ │ Avg      │ │ Test     │ │ Enroll   │ │
│ │ Applicant│ │ Rate     │ │ Score    │ │ Completi.│ │ Rate     │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                      │
│ Registration Funnel                  Score Distribution              │
│ ┌────────────────────────────┐      ┌────────────────────────────┐ │
│ │ Registered  ████████████ 234│      │ ▓▓                  91-100│ │
│ │ Verified    ██████████░░ 198│      │ ▓▓▓▓▓               81-90 │ │
│ │ Tested      █████████░░░ 183│      │ ▓▓▓▓▓▓▓▓            71-80 │ │
│ │ Passed      ████████░░░░ 169│      │ ▓▓▓▓▓▓▓▓▓▓▓▓        61-70 │ │
│ │ Accepted    ██████░░░░░░ 120│      │ ▓▓▓▓▓▓▓▓▓▓          51-60 │ │
│ │ Enrolled    █████░░░░░░░ 107│      │ ▓▓▓▓▓▓              41-50 │ │
│ └────────────────────────────┘      │ ▓▓▓                   0-40 │ │
│                                      └────────────────────────────┘ │
│                                                                      │
│ Registration Over Time              Question Difficulty Analysis     │
│ ┌────────────────────────────┐      ┌────────────────────────────┐ │
│ │     /\                     │      │ Q1 ██████████████ 92% Easy │ │
│ │    /  \/\                  │      │ Q7 █████████░░░░░ 65% Med  │ │
│ │___/      \___/\____        │      │ Q15████░░░░░░░░░ 28% Hard │ │
│ │ Jan15      Feb15   Feb28   │      │ Q22██░░░░░░░░░░░░ 12% VHar│ │
│ └────────────────────────────┘      └────────────────────────────┘ │
│                                                                      │
│ [Export Full Report PDF] [Export Raw Data CSV]                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Export System

### CSV Export

```typescript
// src/modules/admissions/admission-export.ts

export function generateMeritListCSV(
  meritList: MeritListEntry[]
): string {
  const headers = [
    'Rank',
    'Registration No',
    'Name',
    'Marks Obtained',
    'Total Marks',
    'Percentage',
    'Time Taken (min)',
    'Correct Answers',
    'Decision',
    'Scholarship Tier',
  ];
  
  const rows = meritList.map(entry => [
    entry.rank,
    entry.registrationNumber,
    entry.name,
    entry.totalMarksObtained,
    entry.totalMarks,
    `${entry.percentage}%`,
    Math.round(entry.timeTaken / 60),
    entry.correctAnswers,
    entry.decision ?? 'Pending',
    entry.scholarshipTier ?? 'None',
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

export function generateApplicantListCSV(
  applicants: ApplicantListItem[]
): string {
  const headers = [
    'Reg No',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Guardian',
    'Status',
    'Score',
    'Decision',
  ];
  
  const rows = applicants.map(a => [
    a.registrationNumber,
    a.firstName,
    a.lastName,
    a.email,
    a.phone ?? '',
    a.guardianName,
    a.status,
    a.result?.percentage ? `${a.result.percentage}%` : 'N/A',
    a.decision?.decision ?? 'Pending',
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

export function generateScholarshipReportCSV(
  data: ScholarshipDistribution[]
): string {
  const headers = ['Tier', 'Max Recipients', 'Awarded', 'Accepted', 'Declined', 'Pending', 'Acceptance Rate'];
  
  const rows = data.map(d => [
    d.tierName,
    d.maxRecipients ?? 'Unlimited',
    d.totalAwarded,
    d.accepted,
    d.declined,
    d.pending,
    `${d.acceptanceRate}%`,
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}
```

### PDF Export (Server-Side)

```typescript
// For PDF generation, use @react-pdf/renderer on the server
// or html-to-pdf conversion via puppeteer/playwright

// API route for PDF download:
// GET /api/admin/admissions/campaigns/[campaignId]/export/merit-pdf
// GET /api/admin/admissions/campaigns/[campaignId]/export/scholarship-pdf
// GET /api/admin/admissions/campaigns/[campaignId]/export/analytics-pdf
```

---

## 5. Cross-Campaign Comparison

### Year-over-Year Analytics

```typescript
export async function getCrossCampaignComparison(
  campaignIds: string[]
): Promise<CampaignComparison[]> {
  return Promise.all(
    campaignIds.map(async (id) => {
      const campaign = await prisma.testCampaign.findUnique({
        where: { id },
        select: { name: true, type: true, academicSession: { select: { name: true } } },
      });
      
      const [totalApplicants, avgScore, passRate] = await Promise.all([
        prisma.applicant.count({ where: { campaignId: id } }),
        prisma.applicantResult.aggregate({
          where: { campaignId: id },
          _avg: { percentage: true },
        }),
        prisma.applicantResult.count({ where: { campaignId: id, isPassed: true } })
          .then(passed => prisma.applicantResult.count({ where: { campaignId: id } })
            .then(total => pct(passed, total))
          ),
      ]);
      
      return {
        campaignId: id,
        name: campaign?.name ?? '',
        session: campaign?.academicSession?.name ?? '',
        totalApplicants,
        avgScore: Number(avgScore._avg.percentage ?? 0),
        passRate,
      };
    })
  );
}
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Cross-Campaign Comparison                                            │
│                                                                      │
│ ┌──────────────────┬──────────┬──────┬──────┬──────────┐           │
│ │ Campaign          │ Session  │ Appl │ Avg% │ Pass Rate│           │
│ ├──────────────────┼──────────┼──────┼──────┼──────────┤           │
│ │ Class 6 Adm 2024 │ 2024-25  │ 156  │ 62.3 │ 68.2%    │           │
│ │ Class 6 Adm 2025 │ 2025-26  │ 198  │ 65.1 │ 71.5%    │           │
│ │ Class 6 Adm 2026 │ 2026-27  │ 234  │ 68.5 │ 72.3%    │           │
│ └──────────────────┴──────────┴──────┴──────┴──────────┘           │
│                                                                      │
│ Trend: ↗ Applicants +27% YoY  ↗ Avg Score +3.4% YoY               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Charts Library

Use **Recharts** (already common with shadcn/ui) for all analytics charts:

- **Bar Chart** — Score distribution, per-question accuracy
- **Funnel Chart** — Registration → Enrollment funnel
- **Line Chart** — Registration timeline, score trend
- **Pie Chart** — Decision distribution, scholarship tier distribution
- **Area Chart** — Cumulative registration over time

```tsx
// Example: Score Distribution Chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ScoreDistributionChart({ data }: { data: { range: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```
