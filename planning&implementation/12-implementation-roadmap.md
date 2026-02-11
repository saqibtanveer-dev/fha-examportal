# ExamCore - Implementation Roadmap

## Phase Overview

```
Phase 0: Project Setup & Foundation       (Week 1)
Phase 1: Auth & User Management           (Week 2-3)
Phase 2: Organization Setup               (Week 3-4)
Phase 3: Question Bank                    (Week 4-6)
Phase 4: Exam Builder                     (Week 6-8)
Phase 5: Exam Session (Student)           (Week 8-10)
Phase 6: Grading Engine (MCQ + AI)        (Week 10-12)
Phase 7: Results & Analytics              (Week 12-14)
Phase 8: Polish, Testing, & Launch        (Week 14-16)
```

---

## Phase 0: Project Setup & Foundation (Week 1)

### 0.1 — Project Initialization
- [ ] Initialize Next.js 15 project with TypeScript (`pnpm create next-app`)
- [ ] Configure `tsconfig.json` with strict mode and path aliases
- [ ] Set up `pnpm` workspace configuration
- [ ] Create `.gitignore` with comprehensive exclusions
- [ ] Initialize git repository

### 0.2 — Code Quality Tooling
- [ ] Install and configure ESLint 9 (flat config) with max-lines rule (300)
- [ ] Install and configure Prettier with Tailwind CSS plugin
- [ ] Set up Husky + lint-staged for pre-commit hooks
- [ ] Configure commitlint for conventional commits
- [ ] Verify all tools work with a test commit

### 0.3 — Styling Foundation
- [ ] Configure Tailwind CSS 4 with custom theme
- [ ] Install shadcn/ui and initialize with project theme
- [ ] Add core shadcn components (button, input, card, dialog, etc.)
- [ ] Create global CSS variables for theme tokens
- [ ] Set up dark mode support

### 0.4 — Database Setup
- [ ] Install Prisma 6 and initialize
- [ ] Write complete Prisma schema (split into logical files)
- [ ] Create initial migration
- [ ] Set up seed script (development + production)
- [ ] Configure connection pooling
- [ ] Verify database connection

### 0.5 — Core Libraries Setup
- [ ] Set up environment variable validation (`@t3-oss/env-nextjs` + Zod)
- [ ] Create Prisma client singleton (`lib/prisma.ts`)
- [ ] Create Pino logger setup (`lib/logger.ts`)
- [ ] Create custom error classes (`errors/`)
- [ ] Create API response helpers (`utils/api-response.ts`)
- [ ] Create shared utility functions (`utils/`)

### 0.6 — Layout Foundation
- [ ] Create root layout with providers
- [ ] Create `Providers.tsx` (QueryClient, ThemeProvider, Toaster)
- [ ] Create sidebar component (collapsible)
- [ ] Create top navigation component
- [ ] Create mobile sidebar (sheet)
- [ ] Create page header component
- [ ] Set up route group layouts (`(public)`, `(admin)`, `(teacher)`, `(student)`)

### 0.7 — Dev Infrastructure
- [ ] Set up Vitest configuration
- [ ] Set up Playwright configuration
- [ ] Create GitHub Actions CI workflow
- [ ] Set up Sentry (error tracking)
- [ ] Create Docker Compose for local PostgreSQL + Redis

---

## Phase 1: Auth & User Management (Week 2-3)

### 1.1 — Authentication
- [ ] Install and configure NextAuth.js v5
- [ ] Implement Credentials provider (email + password)
- [ ] Create auth configuration (`lib/auth.ts`, `lib/auth-options.ts`)
- [ ] Implement session management (JWT strategy)
- [ ] Create login page UI (`LoginForm.tsx`)
- [ ] Create login server action (`login.action.ts`)
- [ ] Create logout server action (`logout.action.ts`)
- [ ] Create auth service (`auth.service.ts`)
- [ ] Create auth repository (`auth.repository.ts`)
- [ ] Create auth schemas (`auth.schema.ts`)
- [ ] Create middleware for route protection (`middleware.ts`)
- [ ] Implement role-based redirects after login
- [ ] Test: Auth flow unit + integration tests

### 1.2 — Password Management
- [ ] Create change password page and form
- [ ] Create change password server action
- [ ] Create forgot password page
- [ ] Create reset password flow (token-based)
- [ ] Create password service (`password-reset.service.ts`)
- [ ] Test: Password management tests

### 1.3 — User Management (Admin)
- [ ] Create user repository with pagination and filters
- [ ] Create user service (CRUD)
- [ ] Create user schemas (create, update, filter)
- [ ] Create user list page with DataTable
- [ ] Create user form (create/edit) with role-specific fields
- [ ] Create user detail page
- [ ] Create user server actions (create, update, delete, toggle status)
- [ ] Implement student profile creation on student user create
- [ ] Implement teacher profile creation on teacher user create
- [ ] Test: User CRUD tests

### 1.4 — Bulk Import
- [ ] Create CSV parser service
- [ ] Create import validation service
- [ ] Create import dialog UI
- [ ] Create bulk import server action
- [ ] Create import report display
- [ ] Create CSV template downloads
- [ ] Test: Import flow tests

---

## Phase 2: Organization Setup (Week 3-4)

### 2.1 — Department & Subject
- [ ] Create department repository, service, schemas
- [ ] Create department CRUD server actions
- [ ] Create department management UI
- [ ] Create subject repository, service, schemas
- [ ] Create subject CRUD server actions
- [ ] Create subject management UI (list, form)
- [ ] Create teacher-subject assignment service
- [ ] Create teacher-subject assignment UI
- [ ] Test: Department & Subject tests

### 2.2 — Class & Section
- [ ] Create class repository, service, schemas
- [ ] Create class CRUD server actions
- [ ] Create class management UI
- [ ] Create section repository, service, schemas
- [ ] Create section CRUD server actions
- [ ] Create section management UI (within class detail)
- [ ] Create student-class assignment service
- [ ] Create student-class assignment UI
- [ ] Test: Class & Section tests

### 2.3 — School Settings
- [ ] Create settings repository and service
- [ ] Create school settings form
- [ ] Create grading scale editor
- [ ] Create academic year selector
- [ ] Create settings server actions
- [ ] Test: Settings tests

---

## Phase 3: Question Bank (Week 4-6)

### 3.1 — Question CRUD
- [ ] Create question repository with advanced filtering
- [ ] Create question service (create, update, delete, duplicate)
- [ ] Create question schemas (per question type)
- [ ] Create question list page with filters and search
- [ ] Create question card component
- [ ] Test: Question CRUD tests

### 3.2 — MCQ Builder
- [ ] Create MCQ options editor component
- [ ] Create MCQ form flow (question + options + correct answer)
- [ ] Create MCQ preview component
- [ ] Create MCQ server actions
- [ ] Test: MCQ creation tests

### 3.3 — Short/Long Answer Builder
- [ ] Create model answer editor (for short answers)
- [ ] Create rubric editor (for long answers)
- [ ] Create Tiptap rich text editor integration
- [ ] Create short answer form flow
- [ ] Create long answer form flow
- [ ] Test: Short/Long answer creation tests

### 3.4 — Tagging System
- [ ] Create tag repository and service
- [ ] Create tag management UI
- [ ] Create tag selector component (multi-select)
- [ ] Create tag filter in question search
- [ ] Test: Tag system tests

### 3.5 — Import/Export
- [ ] Create question import parser
- [ ] Create question import validation
- [ ] Create question import UI
- [ ] Create question export to CSV
- [ ] Test: Import/export tests

---

## Phase 4: Exam Builder (Week 6-8)

### 4.1 — Exam CRUD
- [ ] Create exam repository with status management
- [ ] Create exam service (create, update, delete, duplicate)
- [ ] Create exam schemas
- [ ] Create exam list page with status filters
- [ ] Create exam form (basic info: title, subject, type, duration)
- [ ] Create exam server actions
- [ ] Test: Exam CRUD tests

### 4.2 — Exam Question Management
- [ ] Create exam-question service (add, remove, reorder)
- [ ] Create question selector UI (search from bank + add)
- [ ] Create exam question list with drag-and-drop reorder
- [ ] Create marks override per question
- [ ] Test: Question management tests

### 4.3 — Exam Configuration
- [ ] Create exam settings form (shuffle, timing, result display)
- [ ] Create exam scheduling UI (start/end date-time)
- [ ] Create passing marks configuration
- [ ] Create max attempts configuration
- [ ] Test: Exam config tests

### 4.4 — Exam Assignment & Publishing
- [ ] Create class assignment service
- [ ] Create class/section assignment UI (checkbox list)
- [ ] Create exam publish flow (validation → publish)
- [ ] Create exam preview page (teacher view of how students see it)
- [ ] Create exam status management (draft → published → active → completed)
- [ ] Test: Assignment & publish tests

---

## Phase 5: Exam Session - Student (Week 8-10)

### 5.1 — Exam Discovery
- [ ] Create available exams list for student
- [ ] Create exam card with status, schedule, duration info
- [ ] Create exam instruction page (shown before start)
- [ ] Create "start exam" flow with confirmtation
- [ ] Test: Exam discovery tests

### 5.2 — Exam Taking UI
- [ ] Create exam taking layout (minimal, distraction-free)
- [ ] Create timer component (countdown with warnings)
- [ ] Create question navigator/palette (sidebar)
- [ ] Create question display component (routes to type-specific)
- [ ] Create MCQ answer component (radio buttons)
- [ ] Create short answer component (text input)
- [ ] Create long answer component (rich text editor)
- [ ] Create "mark for review" toggle
- [ ] Create previous/next navigation
- [ ] Test: Exam UI component tests

### 5.3 — Session Management
- [ ] Create exam session service (start, save, submit)
- [ ] Create exam session repository
- [ ] Create Zustand store for exam client state
- [ ] Create auto-save hook (debounced, every 60s)
- [ ] Create session heartbeat (every 30s)
- [ ] Create timeout handling (auto-submit on timer end)
- [ ] Create manual submit with confirmation dialog
- [ ] Test: Session management tests

### 5.4 — Edge Cases
- [ ] Handle browser refresh during exam (restore session)
- [ ] Handle network disconnection (queue saves, retry)
- [ ] Handle duplicate tab detection
- [ ] Handle session expiry during exam
- [ ] Test: Edge case tests

---

## Phase 6: Grading Engine (Week 10-12)

### 6.1 — MCQ Auto-Grading
- [ ] Create MCQ grader service (answer matching)
- [ ] Create grading orchestrator service
- [ ] Create answer-grade repository
- [ ] Implement instant MCQ grading on submission
- [ ] Test: MCQ grading tests (100% coverage)

### 6.2 — Queue Infrastructure
- [ ] Set up Redis (Upstash for production, Docker for local)
- [ ] Set up BullMQ queue and workers
- [ ] Create grading queue configuration
- [ ] Create worker process for AI grading
- [ ] Create queue monitoring/health check
- [ ] Test: Queue infrastructure tests

### 6.3 — AI Short Answer Grading
- [ ] Set up Vercel AI SDK with OpenAI provider
- [ ] Create short answer prompt template (v1)
- [ ] Create structured output schema (Zod for AI response)
- [ ] Create AI grader service for short answers
- [ ] Implement confidence scoring
- [ ] Implement retry logic with model escalation
- [ ] Create token usage tracking
- [ ] Test: AI short answer grading tests (with mocked AI)

### 6.4 — AI Long Answer Grading
- [ ] Create long answer prompt template with rubric (v1)
- [ ] Create structured output schema for rubric-based grading
- [ ] Create AI grader service for long answers
- [ ] Implement criterion-level grading
- [ ] Implement confidence scoring for long answers
- [ ] Test: AI long answer grading tests (with mocked AI)

### 6.5 — Result Calculation
- [ ] Create result calculator service
- [ ] Implement total score, percentage, grade calculation
- [ ] Implement pass/fail determination
- [ ] Implement rank calculation per exam
- [ ] Create exam result repository
- [ ] Test: Result calculation tests (100% coverage)

### 6.6 — Teacher Grade Review
- [ ] Create grading review list page (pending, flagged, reviewed)
- [ ] Create grade review card (answer + model answer + AI grade)
- [ ] Create grade override form
- [ ] Create bulk approve action
- [ ] Create regrade request action
- [ ] Create review server actions
- [ ] Test: Grade review tests

---

## Phase 7: Results & Analytics (Week 12-14)

### 7.1 — Student Results
- [ ] Create result card component (score, grade, feedback)
- [ ] Create result detail page (per question breakdown)
- [ ] Create student results list page
- [ ] Create result publication flow (teacher publishes → student sees)
- [ ] Test: Result display tests

### 7.2 — Result Export
- [ ] Create PDF result card generation
- [ ] Create CSV result export for class
- [ ] Create export server actions / API routes
- [ ] Test: Export tests

### 7.3 — Dashboards
- [ ] Create admin dashboard (user counts, exam stats, system overview)
- [ ] Create teacher dashboard (my exams, pending grades, recent activity)
- [ ] Create student dashboard (upcoming exams, recent results)
- [ ] Create stats card component
- [ ] Test: Dashboard data tests

### 7.4 — Analytics Charts
- [ ] Create exam-level analytics (score distribution, pass rate)
- [ ] Create question-level analytics (difficulty, discrimination)
- [ ] Create class comparison charts
- [ ] Create student performance history chart
- [ ] Create subject-wise performance chart
- [ ] Install and configure Recharts
- [ ] Test: Analytics calculation tests

### 7.5 — Notifications
- [ ] Create notification service and repository
- [ ] Create notification bell component (with unread count)
- [ ] Create notification dropdown/page
- [ ] Create notification triggers:
  - Exam assigned to student
  - Exam reminder (day before)
  - Results published
  - AI grade flagged for review
- [ ] Test: Notification tests

---

## Phase 8: Polish, Testing, & Launch (Week 14-16)

### 8.1 — Comprehensive Testing
- [ ] Complete unit test coverage to target levels
- [ ] Run all integration tests
- [ ] Write and run E2E tests for all critical flows
- [ ] Fix all failing tests
- [ ] Performance testing (concurrent exam taking)
- [ ] Security audit (auth, injection, XSS)

### 8.2 — Performance Optimization
- [ ] Run Lighthouse audits, optimize to > 90
- [ ] Audit and optimize bundle size
- [ ] Add proper caching headers
- [ ] Optimize database queries (check for N+1)
- [ ] Add database indexes based on query patterns
- [ ] Load test with simulated concurrent users

### 8.3 — UX Polish
- [ ] Add proper loading skeletons everywhere
- [ ] Add empty states for all lists
- [ ] Add proper error messages throughout
- [ ] Ensure all forms have validation feedback
- [ ] Ensure mobile responsiveness on all pages
- [ ] Accessibility audit (keyboard nav, screen reader)

### 8.4 — Documentation
- [ ] Write README.md (setup, development, deployment)
- [ ] Document environment variables
- [ ] Document API endpoints
- [ ] Create teacher user guide
- [ ] Create student user guide
- [ ] Create admin setup guide

### 8.5 — Deployment
- [ ] Set up production PostgreSQL (Neon)
- [ ] Set up production Redis (Upstash)
- [ ] Configure Vercel production deployment
- [ ] Set up Sentry production project
- [ ] Configure production environment variables
- [ ] Run migration on production database
- [ ] Seed production admin user
- [ ] Deploy and verify

### 8.6 — Launch Checklist
- [ ] All E2E tests pass against production
- [ ] Smoke test all critical flows manually
- [ ] Verify email notifications work
- [ ] Verify AI grading works with production API keys
- [ ] Verify backup system is active
- [ ] Monitoring dashboards active
- [ ] Launch! 🚀

---

## Risk Mitigation

| Risk                          | Mitigation                                    |
| ----------------------------- | --------------------------------------------- |
| AI grading accuracy issues    | Teacher review flow, confidence thresholds     |
| OpenAI API downtime           | Retry logic, queue-based async, manual fallback|
| Database scaling              | Connection pooling, read replicas (future)     |
| Concurrent exam overload      | Queue-based grading, edge caching              |
| Scope creep                   | Strict phase boundaries, MVP-first approach    |
| 300-line rule violations      | ESLint max-lines rule enforced in CI           |

---

## Definition of Done (per feature)

- [ ] Code written and follows all conventions
- [ ] No file exceeds 300 lines
- [ ] TypeScript strict mode — zero errors
- [ ] Unit tests written and passing
- [ ] Integration test (if applicable) written and passing
- [ ] ESLint + Prettier — zero warnings
- [ ] Code reviewed (self-review minimum)
- [ ] Loading and error states handled
- [ ] Mobile responsive
- [ ] Accessibility checked
