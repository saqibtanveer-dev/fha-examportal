# ExamCore - Testing & Deployment Strategy

## Testing Philosophy

1. **Test behavior, not implementation** — Focus on what the code does, not how
2. **Testing pyramid** — Many unit tests, fewer integration, minimal E2E
3. **Critical path coverage** — 100% coverage on grading, auth, and exam flows
4. **Fast feedback** — Tests must run in under 60 seconds locally

---

## Testing Pyramid

```
         ╱╲
        ╱ E2E ╲           ~10 tests    (Playwright)
       ╱────────╲          Critical user flows
      ╱Integration╲       ~50 tests    (Vitest)
     ╱──────────────╲      API routes, DB queries, AI grading
    ╱   Unit Tests    ╲    ~200 tests  (Vitest)
   ╱────────────────────╲  Services, utils, schemas, components
```

---

## Unit Testing Strategy

### What to Unit Test
| Layer          | What to Test                                    | Coverage Target |
| -------------- | ----------------------------------------------- | --------------- |
| Services       | Business logic, validation rules, calculations  | 90%             |
| Utilities      | All helper functions                            | 95%             |
| Schemas        | Zod validation (valid + invalid inputs)         | 100%            |
| Errors         | Custom error classes                            | 100%            |
| Components     | Rendering, user interactions, conditional display| 80%            |
| Hooks          | State management, side effects                  | 80%             |

### Unit Test Example Pattern
```typescript
// __tests__/modules/grading/services/mcq-grader.service.test.ts
describe('McqGraderService', () => {
  describe('gradeMcq', () => {
    it('should award full marks for correct answer', () => {});
    it('should award zero marks for incorrect answer', () => {});
    it('should handle null selectedOptionId', () => {});
    it('should handle missing correct option gracefully', () => {});
  });
});
```

### Mocking Strategy
```
- Prisma: Use prisma-mock or manual mocks for repositories
- AI SDK: Mock Vercel AI SDK responses with fixtures
- BullMQ: Mock queue.add() calls
- NextAuth: Mock auth() calls in server actions
- fetch: MSW (Mock Service Worker) for external APIs
```

---

## Integration Testing Strategy

### What to Integration Test
| Area                 | What to Test                                      |
| -------------------- | ------------------------------------------------- |
| API Routes           | Full request/response cycle with real DB           |
| Server Actions       | Auth + validation + service + DB integration       |
| AI Grading Pipeline  | Prompt → AI SDK mock → response parsing → DB save |
| Auth Flow            | Login → session creation → protected route access  |
| Exam Submission      | Submit → queue → grade → result calculation        |

### Database for Tests
```
- Separate test database (PostgreSQL)
- Reset database before each test suite
- Seed minimal data per test case
- Use transactions for isolation where possible
```

### Integration Test Pattern
```typescript
// __tests__/integration/exam-submission.test.ts
describe('Exam Submission Flow', () => {
  beforeEach(async () => { await resetTestDb(); await seedTestData(); });

  it('should grade MCQs immediately on submission', async () => {
    // 1. Create exam with MCQ questions
    // 2. Start session as student
    // 3. Submit answers
    // 4. Verify MCQ grades exist in DB
    // 5. Verify AI grading jobs queued
  });
});
```

---

## E2E Testing Strategy (Playwright)

### Critical User Flows
```
1. Auth Flow
   - Login as admin/teacher/student
   - Unauthorized access redirect
   - Logout

2. Teacher: Create Exam Flow
   - Create questions → Add to exam → Set rules → Publish

3. Student: Take Exam Flow
   - View available exams → Start exam → Answer questions
   → Auto-save triggers → Submit exam

4. Grading Flow
   - Teacher views pending grades → Reviews AI grade
   → Overrides grade → Publishes results

5. Student: View Results Flow
   - Student views result → Sees feedback → Views performance
```

### Playwright Configuration
```typescript
// playwright.config.ts
{
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    timeout: 120000,
  },
}
```

---

## CI/CD Pipeline

### GitHub Actions — CI (On Pull Request)

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]

jobs:
  lint:
    - pnpm install
    - pnpm lint
    - pnpm type-check

  unit-test:
    - pnpm install
    - pnpm test:unit
    - Upload coverage report

  integration-test:
    - Start test PostgreSQL (service container)
    - pnpm install
    - pnpm prisma migrate deploy
    - pnpm test:integration

  build:
    - pnpm install
    - pnpm build
    - Check bundle size (fail if > threshold)
```

### GitHub Actions — Deploy Preview (On PR)
```yaml
# .github/workflows/deploy-preview.yml
- Vercel preview deployment
- Run E2E tests against preview URL
- Post preview URL as PR comment
```

### GitHub Actions — Production (On merge to main)
```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Run full test suite
    - pnpm prisma migrate deploy (production DB)
    - Deploy to Vercel production
    - Run smoke tests against production
    - Notify on failure (Slack/Discord)
```

---

## Deployment Architecture

### Environment Strategy
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Development  │     │   Preview     │     │  Production   │
│  (local)      │     │  (PR-based)   │     │  (main)       │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ localhost:3000│     │ pr-123.vercel│     │ examcore.app  │
│ Local PG      │     │ Preview PG    │     │ Production PG │
│ Local Redis   │     │ Preview Redis │     │ Prod Redis    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Infrastructure per Environment

| Service          | Development        | Preview            | Production          |
| ---------------- | ------------------ | ------------------ | ------------------- |
| App Hosting      | localhost           | Vercel Preview     | Vercel Production   |
| PostgreSQL       | Docker local        | Neon branch        | Neon main           |
| Redis            | Docker local        | Upstash (dev)      | Upstash (prod)      |
| AI (OpenAI)      | Mock / real (capped)| Real (capped)      | Real (production)   |
| File Storage     | Local filesystem    | Uploadthing (dev)  | Uploadthing (prod)  |
| Monitoring       | Console logging     | Sentry (dev)       | Sentry (prod)       |

### Vercel Configuration
```
// vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sin1"],  // Singapore (closest to Pakistan)
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-sessions",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/send-exam-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

---

## Database Migration Strategy

### Development
```
1. Edit prisma/schema.prisma
2. Run: pnpm prisma migrate dev --name descriptive_name
3. Prisma generates migration SQL
4. Applies to local database
5. Regenerates Prisma Client types
```

### Production
```
1. Migrations committed to git with code changes
2. CI runs: pnpm prisma migrate deploy
3. Non-interactive, applies pending migrations
4. If migration fails → deployment halted → alert team
```

### Migration Safety Rules
```
- NEVER drop columns in production without deprecation period
- Always add columns as nullable first, then backfill, then add NOT NULL
- Test every migration against production-sized data locally
- Keep migrations small and reversible
- Name migrations descriptively
```

---

## Monitoring & Observability

### Error Tracking (Sentry)
```
- Automatic error capture in API routes and Server Actions
- Source maps uploaded during build
- Release tracking with git commits
- Performance monitoring (transaction traces)
- Session replay for debugging UI issues
```

### Logging (Pino)
```
- Structured JSON logs in production
- Pretty-printed logs in development
- Log levels: error, warn, info, debug
- Request ID correlation across log entries
- Sensitive data redaction (passwords, tokens)
```

### Health Checks
```
GET /api/health
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2026-02-11T..."
}
```

### Key Metrics to Monitor
```
- API response times (P50, P95, P99)
- Error rates by endpoint
- Database connection pool usage
- AI grading queue depth and processing time
- AI grading costs (token usage)
- Active exam sessions count
- Login failure rates (security)
```

---

## Backup Strategy

### Database Backups
```
- Automated daily backups via Neon/Supabase
- Point-in-time recovery (last 7 days)
- Manual backup before major migrations
- Backup verification monthly
```

### Data Export
```
- Admin can export all data to CSV
- Question bank export/import
- Results export to PDF/CSV
```

---

## Performance Benchmarks

| Metric                  | Target          | Tool               |
| ----------------------- | --------------- | ------------------- |
| Lighthouse Score        | > 90 (all)      | Lighthouse CI       |
| First Contentful Paint  | < 1.5s          | Vercel Analytics     |
| Largest Contentful Paint| < 2.5s          | Vercel Analytics     |
| Time to Interactive     | < 3.5s          | Vercel Analytics     |
| Cumulative Layout Shift | < 0.1           | Vercel Analytics     |
| API Response (P95)      | < 200ms         | Sentry/Vercel        |
| Bundle Size (JS)        | < 200KB (gzip)  | Bundle Analyzer      |
