# ExamCore — Revised Implementation Roadmap (Post-Analysis)

> **Date:** February 11, 2026
> **Purpose:** Updated action plan based on brutal analysis, prioritized for maximum impact
> **Goal:** Take the project from 38% → 85% completion

---

## Phase A — Fix the Broken Foundation (Week 1-2)

> **Priority:** CRITICAL — Nothing else matters until these work

### A.1 — Password Management (2 days)
- [ ] Create `changePasswordAction` server action
- [ ] Create change password page at `/profile/change-password` or modal
- [ ] Create `forgotPasswordAction` — generate token, store in DB
- [ ] Create forgot password page at `/forgot-password`
- [ ] Create `resetPasswordAction` — validate token, update password
- [ ] Create reset password page at `/reset-password`
- [ ] Add password validation (uppercase, lowercase, number, special char)
- [ ] Add email service setup (Resend) for reset emails
- [ ] Force password change on first login (track `mustChangePassword` flag)

### A.2 — Edit Flows for ALL Entities (3-4 days)
- [ ] Create `EditUserDialog` — pre-filled form, calls `updateUserAction`
- [ ] Create `EditDepartmentDialog` — pre-filled, calls `updateDepartmentAction`
- [ ] Create `EditSubjectDialog` — pre-filled, calls `updateSubjectAction`
- [ ] Create `EditClassDialog` — name, grade editing
- [ ] Create `EditQuestionDialog` — full question editing with MCQ options
- [ ] Create `EditExamDialog` — title, settings, question management (draft only)
- [ ] Ensure all update actions exist and are tested via manual testing

### A.3 — Wire Notification System (1 day)
- [ ] Trigger `createNotification` in `publishExamAction` → notify assigned students
- [ ] Trigger notification in `calculateResult` → notify student of result
- [ ] Trigger notification in `gradeAnswerAction` → notify student of teacher review
- [ ] Wire `NotificationBell` in top-nav to real `getUnreadCount` query
- [ ] Add notification polling/refetch mechanism

### A.4 — Wire Audit Logging (1 day)
- [ ] Add `createAuditLog` calls in:
  - `createUserAction`, `deleteUserAction`, `toggleUserActiveAction`
  - `createExamAction`, `publishExamAction`, `deleteExamAction`
  - `createQuestionAction`, `deleteQuestionAction`
  - `gradeAnswerAction` (grade override)
  - `updateSettingsAction`
  - Login/logout events
- [ ] Capture IP address from request headers where possible

### A.5 — Loading & Error States (1 day)
- [ ] Add `loading.tsx` with skeleton loaders to all route groups:
  - `/admin/dashboard`, `/admin/users`, `/admin/classes`, etc.
  - `/teacher/dashboard`, `/teacher/questions`, `/teacher/exams`, etc.
  - `/student/dashboard`, `/student/exams`, `/student/results`
- [ ] Add `error.tsx` with ErrorDisplay component to all route groups
- [ ] Add `not-found.tsx` global 404 page

### A.6 — Quick Fixes (0.5 day)
- [ ] Replace home page `/` with redirect to login or a minimal landing page
- [ ] Fix soft-delete filtering — add `deletedAt: null` to all list queries
- [ ] Wire dark mode toggle (install ThemeProvider, add toggle in top-nav)
- [ ] Create `.env.example` with all required variables documented
- [ ] Remove or relocate duplicate `cn()` utility
- [ ] Add form success toasts consistently across all actions

---

## Phase B — Complete Existing Features (Week 3-5)

> **Priority:** HIGH — Make what exists actually complete

### B.1 — Student Profile & Teacher Profile Management (2 days)
- [ ] Add student profile fields (roll number, registration no, class, section, DOB, gender, guardian) to user create/edit flow
- [ ] Add teacher profile fields (employee ID, qualification, specialization) to user create/edit flow
- [ ] Create "Teacher-Subject Assignment" UI in admin subjects page
- [ ] Create "Assign Students to Class/Section" UI with dropdown

### B.2 — Question Bank Completion (2 days)
- [ ] Create tag management page (`/teacher/questions/tags`)
- [ ] Create tag CRUD actions
- [ ] Add tag selector to question create/edit form
- [ ] Add tag-based filtering in question list
- [ ] Create question detail/preview page
- [ ] Add question duplication action
- [ ] Add rubric editor component for LONG_ANSWER questions
- [ ] Display question explanation after exam (where `allowReview` is true)

### B.3 — Exam Builder Completion (2 days)
- [ ] Add exam scheduling with date-time pickers (start/end)
- [ ] Implement exam time window enforcement (can't start before scheduledStartAt)
- [ ] Add shuffle questions implementation (randomize order per student)
- [ ] Add result visibility enforcement (`showResultAfter` enum)
- [ ] Add exam preview page (teacher sees student view)
- [ ] Add exam status transitions (PUBLISHED → ACTIVE → COMPLETED → ARCHIVED)
- [ ] Add exam detail page showing all questions, settings, assignments, sessions
- [ ] Add question reordering (drag-and-drop)

### B.4 — Exam Session Completion (2 days)
- [ ] Add exam instructions page (shown before start with duration, question count, rules)
- [ ] Add "Start Exam" confirmation dialog
- [ ] Add "Mark for Review" toggle button per question
- [ ] Add review screen before submit (summary of answered/unanswered/flagged)
- [ ] Add timer warnings (visual + audio) at 5 min and 1 min
- [ ] Auto-submit on timeout with notification
- [ ] Implement periodic auto-save (every 60 seconds) in addition to blur save
- [ ] Track and save `timeSpent` per question

### B.5 — Results Completion (1-2 days)
- [ ] Implement grade letter computation using school's grading scale
- [ ] Implement rank calculation per exam
- [ ] Add result publishing workflow (teacher publishes → students can see)
- [ ] Create result detail page for students (per-question breakdown with feedback)
- [ ] Create class-level results view for teachers

---

## Phase C — AI Grading Engine (Week 5-7)

> **Priority:** CRITICAL — This is the main project differentiator

### C.1 — Infrastructure Setup (1 day)
- [ ] Install Vercel AI SDK (`ai`, `@ai-sdk/openai`)
- [ ] Install and configure Redis client (`@upstash/redis` or `ioredis`)
- [ ] Install and configure BullMQ for job queues
- [ ] Create AI client setup (`lib/ai.ts`)
- [ ] Create Redis client setup (`lib/redis.ts`)
- [ ] Create queue setup (`lib/queue.ts`)
- [ ] Add AI config constants (thresholds, retry config, model selection)

### C.2 — Short Answer AI Grading (2 days)
- [ ] Create short answer prompt template v1 (from doc 07)
- [ ] Create Zod schema for AI response validation
- [ ] Create `aiGradeShortAnswer` service function
- [ ] Implement confidence scoring logic
- [ ] Implement retry with model escalation (4o-mini → 4o)
- [ ] Implement token tracking
- [ ] Add unit tests for grading with mocked AI responses

### C.3 — Long Answer AI Grading (2 days)
- [ ] Create rubric-based prompt template v1 (from doc 07)
- [ ] Create Zod schema for rubric grading response
- [ ] Create `aiGradeLongAnswer` service function
- [ ] Implement per-criterion grading
- [ ] Implement confidence scoring for long answers
- [ ] Implement retry logic
- [ ] Add unit tests with mocked responses

### C.4 — Queue Integration (2 days)
- [ ] Create BullMQ grading queue with priority levels
- [ ] Create grading worker process
- [ ] Dispatch AI grading jobs on exam submission
- [ ] Handle job completion — save grades to DB
- [ ] Handle job failure — flag for manual grading
- [ ] After all answers graded → auto-calculate result
- [ ] Create AI grading status/progress endpoint

### C.5 — Teacher AI Review UI (1-2 days)
- [ ] Add confidence badges (green/yellow/red) to grading interface
- [ ] Add AI reasoning display (teacher-only)
- [ ] Add "Approve AI Grade" action
- [ ] Add "Bulk Approve" action for high-confidence grades
- [ ] Add "Request Regrade" action
- [ ] Add filter by confidence level in grading list
- [ ] Show AI model used + token cost per grading

---

## Phase D — New Features (Week 7-9)

### D.1 — Anti-Cheating Measures (2 days)
- [ ] Tab switch detection with logging
- [ ] Full-screen request on exam start
- [ ] Copy-paste blocking in exam mode
- [ ] MCQ option randomization per student
- [ ] Screenshot key detection
- [ ] Tab switch count display in teacher grading view

### D.2 — Email Notification System (1-2 days)
- [ ] Install Resend SDK
- [ ] Create email templates (password reset, exam assigned, results published)
- [ ] Create email sending service
- [ ] Wire email on password reset
- [ ] Wire email on exam publication
- [ ] Wire email on result publication

### D.3 — User Profile Page (1 day)
- [ ] Create `/profile` page accessible to all roles
- [ ] Display user info, role-specific details, stats
- [ ] Add avatar upload capability (Uploadthing)
- [ ] Add "Change Password" section

### D.4 — Advanced Analytics (2 days)
- [ ] Add question-level analytics (difficulty index, discrimination index)
- [ ] Add class comparison charts (section A vs B)
- [ ] Add teacher view of their subject performance trends
- [ ] Add student performance goals and tracking
- [ ] Add export analytics to PDF

### D.5 — Import/Export System (2 days)
- [ ] Create user CSV import with validation report
- [ ] Create user CSV export
- [ ] Create question CSV/JSON import
- [ ] Create result PDF export (with school branding)
- [ ] Create result CSV export for class data

---

## Phase E — Testing & DevOps (Week 9-11)

### E.1 — Testing Infrastructure (1 day)
- [ ] Install and configure Vitest
- [ ] Install and configure React Testing Library
- [ ] Install and configure Playwright
- [ ] Create test helpers (DB reset, auth, fixtures)
- [ ] Create test fixtures for common entities

### E.2 — Unit Tests — Critical Paths (3 days)
- [ ] Auth service tests (validate credentials, hash/verify password)
- [ ] MCQ grading tests (correct/incorrect/null)
- [ ] AI grading tests (mock responses, confidence scoring)
- [ ] Result calculation tests (percentage, grade, pass/fail, rank)
- [ ] Validation schema tests (valid + invalid inputs for all schemas)
- [ ] Utility function tests (format, pagination, serialize)
- [ ] Error handling tests

### E.3 — Integration Tests (2 days)
- [ ] Auth flow (login → session → protected route)
- [ ] User CRUD flow (create → read → update → delete)
- [ ] Exam lifecycle (create → publish → student takes → grade → result)
- [ ] AI grading pipeline (submit → queue → grade → result)

### E.4 — E2E Tests (2 days)
- [ ] Login as all three roles
- [ ] Teacher creates exam with questions
- [ ] Student takes exam and submits
- [ ] Teacher grades and publishes results
- [ ] Student views results

### E.5 — CI/CD Pipeline (1 day)
- [ ] Create `.github/workflows/ci.yml` (lint, type-check, test)
- [ ] Create `.github/workflows/deploy-preview.yml`
- [ ] Create `.github/workflows/deploy-production.yml`
- [ ] Set up Husky pre-commit hooks
- [ ] Set up lint-staged for pre-commit linting
- [ ] Set up commitlint for conventional commits

### E.6 — DevOps Setup (1 day)
- [ ] Create `docker-compose.yml` (PostgreSQL + Redis)
- [ ] Install and configure Sentry for error tracking
- [ ] Create health check endpoint `/api/health`
- [ ] Create `vercel.json` with cron jobs and region config
- [ ] Add Vercel Analytics integration
- [ ] Create comprehensive README.md

---

## Phase F — Polish & Launch Readiness (Week 11-12)

### F.1 — UI Polish (2 days)
- [ ] Add breadcrumb navigation to all pages
- [ ] Create mobile sidebar (Sheet component)
- [ ] Add responsive design testing on all pages
- [ ] Add keyboard shortcut support (exam navigation)
- [ ] Add contextual empty states for all list views
- [ ] Add skeleton loading states per module
- [ ] Ensure consistent toast notifications on all actions
- [ ] Add form success/error states everywhere

### F.2 — Performance Optimization (1 day)
- [ ] Run Lighthouse audits on all pages
- [ ] Remove all unused dependencies
- [ ] Audit bundle size and lazy-load where needed
- [ ] Add proper image optimization where applicable
- [ ] Check for N+1 query patterns

### F.3 — Security Hardening (1 day)
- [ ] Implement rate limiting on login endpoint
- [ ] Implement rate limiting on AI grading endpoints
- [ ] Add Content Security Policy headers
- [ ] Add input sanitization layer (beyond Zod)
- [ ] Password policy enforcement (regex validation)
- [ ] Session management audit

### F.4 — Documentation (1 day)
- [ ] Write comprehensive README.md (setup, development, deploy)
- [ ] Document environment variables in `.env.example`
- [ ] Document API endpoints (if REST API exists)
- [ ] Create user guides per role (admin/teacher/student)
- [ ] Add inline code documentation for complex logic

---

## Summary Timeline

```
Week 1-2:   Phase A — Fix Foundation      (~7 days)
Week 3-5:   Phase B — Complete Features    (~10 days)
Week 5-7:   Phase C — AI Grading Engine    (~8-10 days)
Week 7-9:   Phase D — New Features         (~8-10 days)
Week 9-11:  Phase E — Testing & DevOps     (~10 days)
Week 11-12: Phase F — Polish & Launch      (~5 days)
─────────────────────────────────────────────────
Total:      ~48-52 working days (~10-12 weeks)
```

### Milestone Targets

| Milestone | Target | Score |
|---|---|---|
| Phase A complete | End of Week 2 | 55% |
| Phase B complete | End of Week 5 | 68% |
| Phase C complete | End of Week 7 | 78% |
| Phase D complete | End of Week 9 | 83% |
| Phase E complete | End of Week 11 | 88% |
| Phase F complete | End of Week 12 | **92%** |

---

## Definition of Done (Updated)

For every feature:
- [ ] Functional implementation complete
- [ ] Edit/update flow exists (not just create)
- [ ] Loading state handled (loading.tsx or skeleton)
- [ ] Error state handled (error.tsx or try-catch with toast)
- [ ] Empty state handled (EmptyState component with action)
- [ ] Notification triggered where applicable
- [ ] Audit log written where applicable
- [ ] At least 1 unit test for business logic
- [ ] Mobile responsive
- [ ] No file exceeds 300 lines
- [ ] TypeScript strict — zero errors
- [ ] Toast feedback on all mutations
