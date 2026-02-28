# Admission Test & Scholarship Test — Scalability & Performance

> **Date:** February 28, 2026
> **Scope:** Handling 5000+ concurrent applicants, connection pooling, batch processing, caching, horizontal scaling

---

## 1. Performance Requirements

### Target Scale

| Metric | Target | Peak |
|--------|--------|------|
| Concurrent test-takers | 500 | 2,000 |
| Total registrations/campaign | 5,000 | 10,000 |
| Answer submissions/second | 50 | 200 |
| Result checks/second | 100 | 500 |
| Campaign count (active) | 5 | 15 |
| Total applicant records | 50,000 | 200,000 |

### Latency Targets

| Operation | P50 | P99 |
|-----------|-----|-----|
| Page load (public portal) | < 200ms | < 500ms |
| Registration submission | < 1s | < 3s |
| OTP verification | < 500ms | < 1s |
| Test question load | < 300ms | < 800ms |
| Answer submission | < 200ms | < 500ms |
| Test submit (all answers) | < 2s | < 5s |
| Result check | < 500ms | < 1s |
| Merit list generation (500 applicants) | < 5s | < 15s |
| Batch grading (500 MCQ sessions) | < 30s | < 60s |
| Batch AI grading (500 subjective) | < 10min | < 20min |

---

## 2. Database Performance

### Connection Pooling

```typescript
// prisma.ts — Optimized for admission system load

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Log slow queries in development
  log: process.env.NODE_ENV === 'development'
    ? [{ level: 'query', emit: 'event' }]
    : [{ level: 'error', emit: 'stdout' }],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// For Vercel/serverless: Use connection pooler (PgBouncer/Prisma Accelerate)
// DATABASE_URL should point to pooler URL in production
// DIRECT_URL should point to direct connection for migrations
```

### Index Strategy

All indexes defined in the schema design (doc 01) are critical:

```sql
-- Critical indexes for admission performance

-- Applicant lookups
CREATE INDEX idx_applicant_campaign_email ON "Applicant"("campaignId", "email");
CREATE INDEX idx_applicant_campaign_status ON "Applicant"("campaignId", "status");
CREATE INDEX idx_applicant_access_token ON "Applicant"("accessToken");

-- Test session lookups
CREATE INDEX idx_test_session_campaign_status ON "ApplicantTestSession"("campaignId", "status");
CREATE INDEX idx_test_session_applicant ON "ApplicantTestSession"("applicantId");

-- Result queries (merit list generation)
CREATE INDEX idx_result_campaign_percentage ON "ApplicantResult"("campaignId", "percentage" DESC);
CREATE INDEX idx_result_campaign_rank ON "ApplicantResult"("campaignId", "rank");

-- Answer lookups (grading)
CREATE INDEX idx_answer_session ON "ApplicantAnswer"("sessionId");

-- Grade lookups
CREATE INDEX idx_grade_answer ON "ApplicantAnswerGrade"("answerId");

-- Campaign queries
CREATE INDEX idx_campaign_status ON "TestCampaign"("status");
CREATE INDEX idx_campaign_session ON "TestCampaign"("academicSessionId");
```

### Query Optimization

```typescript
// BAD: N+1 query in merit list
const results = await prisma.applicantResult.findMany({ where: { campaignId } });
for (const result of results) {
  const applicant = await prisma.applicant.findUnique({ where: { id: result.applicantId } });
  // ...
}

// GOOD: Single query with include
const results = await prisma.applicantResult.findMany({
  where: { campaignId },
  include: {
    applicant: {
      select: { firstName: true, lastName: true, registrationNumber: true, email: true }
    }
  },
  orderBy: [{ percentage: 'desc' }, { timeTakenSeconds: 'asc' }],
});

// GOOD: Use select to limit transferred columns
const applicantNames = await prisma.applicant.findMany({
  where: { campaignId },
  select: { id: true, firstName: true, lastName: true, registrationNumber: true },
});
```

### Pagination

All list endpoints MUST use cursor-based or offset pagination:

```typescript
// Offset pagination for admin tables (simple, predictable)
export async function getApplicantsPaginated(
  campaignId: string,
  page: number = 1,
  pageSize: number = 50,
  filters?: ApplicantFilters
) {
  const [items, total] = await Promise.all([
    prisma.applicant.findMany({
      where: { campaignId, ...buildFilters(filters) },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { result: true, testSession: true },
    }),
    prisma.applicant.count({
      where: { campaignId, ...buildFilters(filters) },
    }),
  ]);
  
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

---

## 3. Caching Strategy

### Cache Layers

```
Layer 1: Next.js Route Cache (static pages)
├── Public campaign listing — ISR with 60s revalidation
├── Campaign detail — ISR with 30s revalidation
└── School branding — static (build time)

Layer 2: Redis/Upstash Cache (dynamic data)
├── Campaign metadata — 5 min TTL
├── Question set for campaign — 1 hour TTL (until campaign changes)
├── Public campaign list — 2 min TTL
└── Analytics aggregates — 5 min TTL

Layer 3: In-Memory (per-request)
├── Auth session — decoded JWT in request
└── Frequently accessed constants
```

### Redis Caching Implementation

```typescript
// src/lib/cache-utils.ts — extend existing

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  
  // Fetch from DB
  const data = await fetcher();
  
  // Store in cache
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  
  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  // For Upstash, delete specific keys (no KEYS command)
  await redis.del(pattern);
}

// Usage:
export async function getPublicCampaigns() {
  return cachedQuery(
    'public:campaigns',
    async () => {
      return prisma.testCampaign.findMany({
        where: {
          status: { in: ['REGISTRATION_OPEN', 'TEST_ACTIVE'] },
        },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          registrationStartDate: true,
          registrationEndDate: true,
          testStartDate: true,
          testEndDate: true,
          availableSeats: true,
          targetClass: { select: { name: true } },
        },
      });
    },
    120 // 2 min TTL
  );
}
```

### Cache Invalidation Triggers

| Event | Invalidate Keys |
|-------|----------------|
| Campaign created/updated | `public:campaigns`, `campaign:{id}` |
| Campaign status changed | `public:campaigns`, `campaign:{id}` |
| Questions added/removed | `campaign:{id}:questions` |
| New registration | `campaign:{id}:stats` |
| Results published | `campaign:{id}:stats`, `public:campaigns` |

---

## 4. Batch Processing

### MCQ Auto-Grading (Batch)

```typescript
// Grade MCQs for all completed sessions in a campaign
// Target: 500 sessions × 50 MCQs each = 25,000 grades in < 30s

export async function batchAutoGradeMcqs(campaignId: string) {
  const sessions = await prisma.applicantTestSession.findMany({
    where: { campaignId, status: 'COMPLETED' },
    select: { id: true },
  });
  
  // Process in parallel batches of 10
  const BATCH_SIZE = 10;
  const results = { graded: 0, failed: 0 };
  
  for (let i = 0; i < sessions.length; i += BATCH_SIZE) {
    const batch = sessions.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (session) => {
      try {
        await autoGradeAdmissionMcqs(session.id);
        results.graded++;
      } catch (err) {
        console.error(`MCQ grading failed for session ${session.id}:`, err);
        results.failed++;
      }
    });
    
    await Promise.all(promises);
  }
  
  return results;
}
```

### AI Grading (Batch with Concurrency Control)

```typescript
// AI grading is expensive — control concurrency to avoid rate limits

import pLimit from 'p-limit';

const AI_CONCURRENCY = 5; // Max 5 concurrent AI API calls

export async function batchAiGradeSubjective(campaignId: string) {
  const sessions = await prisma.applicantTestSession.findMany({
    where: {
      campaignId,
      status: 'COMPLETED',
      // Only sessions with ungraded subjective answers
      answers: {
        some: {
          question: { type: { in: ['SHORT_ANSWER', 'LONG_ANSWER'] } },
          grade: null,
        }
      }
    },
    select: { id: true },
  });
  
  const limit = pLimit(AI_CONCURRENCY);
  let graded = 0;
  let failed = 0;
  
  const promises = sessions.map(session =>
    limit(async () => {
      try {
        const result = await aiGradeAdmissionSubjective(session.id);
        graded += result.graded;
      } catch (err) {
        console.error(`AI grading failed for session ${session.id}:`, err);
        failed++;
      }
    })
  );
  
  await Promise.all(promises);
  
  return { sessions: sessions.length, graded, failed };
}
```

### Bulk Email Sending

```typescript
// Send emails with rate limiting to avoid provider throttling

const EMAIL_BATCH_SIZE = 10;      // Emails per batch
const EMAIL_BATCH_DELAY_MS = 1000; // 1s between batches

export async function sendBulkEmails(
  recipients: { email: string; data: Record<string, unknown> }[],
  template: string
) {
  let sent = 0;
  let failed = 0;
  
  for (let i = 0; i < recipients.length; i += EMAIL_BATCH_SIZE) {
    const batch = recipients.slice(i, i + EMAIL_BATCH_SIZE);
    
    const results = await Promise.allSettled(
      batch.map(r => sendAdmissionEmail(r.email, template, r.data))
    );
    
    sent += results.filter(r => r.status === 'fulfilled').length;
    failed += results.filter(r => r.status === 'rejected').length;
    
    if (i + EMAIL_BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, EMAIL_BATCH_DELAY_MS));
    }
  }
  
  return { sent, failed };
}
```

---

## 5. Concurrent Test-Taking Architecture

### The Problem

During admission tests, 500+ applicants may start their test within the same 10-minute window. Each test session generates:
- 1 session creation
- 50-100 answer submissions over 60 minutes
- 1 test final submission

Total: ~50,000 write operations over 60 min = ~833 writes/min = ~14 writes/sec

### Connection Pool Sizing

```
Vercel Serverless Functions:
- Default max connections: ~5 per function instance
- With 10 concurrent instances: ~50 connections
- PgBouncer pool size: 50-100 connections

PostgreSQL (Supabase/Neon):
- Max connections: 100-500 depending on plan
- With pooler: effectively unlimited
```

### Answer Submission Optimization

```typescript
// Instead of individual answer saves, batch pending answers

// Client-side: debounce answer saves (save every 5 seconds if changed)
const debouncedSave = useDebouncedCallback(
  async (answers: PendingAnswer[]) => {
    await batchSaveAnswers(sessionId, answers);
  },
  5000
);

// Server-side: batch upsert
export async function batchSaveAnswers(
  sessionId: string,
  answers: { questionId: string; selectedOptionId?: string; textAnswer?: string }[]
): Promise<ActionResult<void>> {
  // Validate session is active + time check (once, not per answer)
  const session = await prisma.applicantTestSession.findUnique({
    where: { id: sessionId },
    include: { campaign: true },
  });
  
  if (!session || session.status !== 'IN_PROGRESS') {
    return { success: false, error: 'Session not active' };
  }
  
  // Time check
  const deadline = session.startedAt!.getTime() + session.campaign.durationMinutes * 60 * 1000;
  if (Date.now() > deadline + 30000) { // 30s grace
    return { success: false, error: 'Time expired' };
  }
  
  // Batch upsert in transaction
  await prisma.$transaction(
    answers.map(answer =>
      prisma.applicantAnswer.upsert({
        where: {
          sessionId_questionId: { sessionId, questionId: answer.questionId },
        },
        create: {
          sessionId,
          questionId: answer.questionId,
          campaignQuestionId: answer.campaignQuestionId,
          selectedOptionId: answer.selectedOptionId,
          textAnswer: answer.textAnswer,
        },
        update: {
          selectedOptionId: answer.selectedOptionId,
          textAnswer: answer.textAnswer,
          updatedAt: new Date(),
        },
      })
    )
  );
  
  return { success: true };
}
```

---

## 6. Auto-Submit Expired Sessions

### Cron Job (Vercel Cron / External Cron)

```typescript
// src/app/api/cron/auto-submit-sessions/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Find expired sessions
  const campaigns = await prisma.testCampaign.findMany({
    where: { status: 'TEST_ACTIVE' },
    select: { id: true, durationMinutes: true },
  });
  
  let processed = 0;
  
  for (const campaign of campaigns) {
    // Sessions started more than (duration + 5 min grace) ago
    const cutoff = new Date(Date.now() - (campaign.durationMinutes + 5) * 60 * 1000);
    
    const expired = await prisma.applicantTestSession.findMany({
      where: {
        campaignId: campaign.id,
        status: 'IN_PROGRESS',
        startedAt: { lt: cutoff },
      },
    });
    
    for (const session of expired) {
      await prisma.applicantTestSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          submittedAt: new Date(),
          isAutoSubmitted: true,
        },
      });
      processed++;
    }
  }
  
  return NextResponse.json({ processed });
}

// vercel.json
// {
//   "crons": [
//     { "path": "/api/cron/auto-submit-sessions", "schedule": "*/5 * * * *" }
//   ]
// }
```

### Campaign Status Transitions (Cron)

```typescript
// src/app/api/cron/campaign-transitions/route.ts

// Runs every hour to auto-transition campaign statuses:
// REGISTRATION_OPEN → TEST_ACTIVE (when testStartDate reached)
// TEST_ACTIVE → GRADING (when testEndDate passed + all sessions expired)

export async function GET(request: Request) {
  const now = new Date();
  
  // Open registration for campaigns whose registrationStartDate has arrived
  await prisma.testCampaign.updateMany({
    where: {
      status: 'DRAFT',
      registrationStartDate: { lte: now },
    },
    // Note: Only auto-transition if explicitly enabled by admin
    // data: { status: 'REGISTRATION_OPEN' },
  });
  
  // Close registration when registrationEndDate passed
  await prisma.testCampaign.updateMany({
    where: {
      status: 'REGISTRATION_OPEN',
      registrationEndDate: { lt: now },
    },
    data: { status: 'REGISTRATION_CLOSED' },
  });
  
  // Activate test when testStartDate reached
  await prisma.testCampaign.updateMany({
    where: {
      status: 'REGISTRATION_CLOSED',
      testStartDate: { lte: now },
    },
    data: { status: 'TEST_ACTIVE' },
  });
  
  // Move to grading when testEndDate passed
  await prisma.testCampaign.updateMany({
    where: {
      status: 'TEST_ACTIVE',
      testEndDate: { lt: now },
    },
    data: { status: 'GRADING' },
  });
  
  return NextResponse.json({ ok: true });
}
```

---

## 7. Horizontal Scaling Considerations

### Vercel (Primary Platform)

```
Vercel Serverless Architecture:
├── Functions auto-scale to handle concurrent requests
├── Cold starts: ~200ms (Next.js Edge is faster but limited)
├── Max execution time: 60s (Pro: 300s)
├── Connection pooling via Prisma Accelerate or PgBouncer
└── Cron jobs via Vercel Cron (max 1/min frequency)

For admission test peaks:
- Vercel handles 500 concurrent users easily
- Connection pooling is the bottleneck (use PgBouncer)
- AI grading can timeout on 60s limit → use background jobs
```

### Stateless Design

```
All admission module code is STATELESS:
- No server-side session storage (JWT-based auth for dashboard, token-based for portal)
- No in-memory state (all in PostgreSQL + Redis)
- Any serverless instance can handle any request
- This ensures perfect horizontal scalability
```

### Database Scaling

```
PostgreSQL Scaling Path:
1. Current: Single instance (Supabase/Neon free tier) → supports ~100 concurrent
2. Near-term: Connection pooler (PgBouncer) → supports ~500 concurrent
3. Mid-term: Read replicas for analytics queries → supports ~2000 concurrent
4. Long-term: Partitioning ApplicantAnswer by campaignId → supports ~10K campaigns

For this project's scale (school-level, not SaaS):
- Steps 1-2 are sufficient for 99% of schools
- Step 3 only if analytics queries become slow
```

---

## 8. Monitoring & Observability

### Key Metrics to Monitor

```typescript
// Custom metrics (via Vercel Analytics or custom solution)

const METRICS = {
  // Latency
  'admission.registration.latency': 'histogram',
  'admission.test_start.latency': 'histogram',
  'admission.answer_submit.latency': 'histogram',
  'admission.test_submit.latency': 'histogram',
  'admission.result_check.latency': 'histogram',
  
  // Throughput
  'admission.registrations.count': 'counter',
  'admission.answers_submitted.count': 'counter',
  'admission.tests_completed.count': 'counter',
  
  // Errors
  'admission.registration.errors': 'counter',
  'admission.grading.errors': 'counter',
  'admission.email.failures': 'counter',
  
  // System
  'admission.db.query_duration': 'histogram',
  'admission.ai.grading_duration': 'histogram',
  'admission.cache.hit_rate': 'gauge',
};
```

### Error Tracking

```typescript
// Use existing error handling pattern with Sentry integration
// All admission actions should use the ActionResult pattern
// Errors are caught, logged, and returned to client as user-friendly messages

import { handleError } from '@/errors/handle-error';

export async function someAdmissionAction(data: Input): Promise<ActionResult<Output>> {
  try {
    // ... business logic
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, 'someAdmissionAction');
  }
}
```

---

## 9. Performance Optimization Checklist

- [ ] All list queries use pagination (max 50 per page)
- [ ] Heavy queries (analytics, merit list) use Redis cache
- [ ] Answer submissions are debounced (5s) and batched
- [ ] MCQ grading uses batch transactions (not individual inserts)
- [ ] AI grading has concurrency limit (5 concurrent)
- [ ] Email sending has batch delay (10 per second)
- [ ] Cron jobs for auto-submit and campaign transitions
- [ ] Database indexes on all query filter columns
- [ ] Connection pooler configured for production
- [ ] Static pages (campaign listing) use ISR caching
- [ ] Question set cached per campaign (not re-fetched per request)
- [ ] Merit list generation uses single sorted query (not N+1)
- [ ] Bulk operations (accept, reject) use transactions
- [ ] No raw SQL — all queries through Prisma Client
