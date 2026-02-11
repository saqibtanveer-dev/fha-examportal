# ExamCore — Brutal Analysis: Current State of Implementation

> **Date:** February 11, 2026
> **Scope:** Complete codebase audit vs 12 planning documents
> **Verdict:** ~40% implemented, ~30% partially done, ~30% completely missing

---

## Executive Summary

The project has a solid skeleton — authentication works, CRUD pages exist for all admin entities, exam creation and student exam-taking are functional, MCQ auto-grading works. But the **core differentiator (AI grading)** is completely absent, many UX flows have only "happy path" coverage, and the codebase has significant gaps in editing workflows, error handling pages, testing, and DevOps.

---

## Implementation Scorecard

| Module | Planned | Built | Score | Status |
|--------|---------|-------|-------|--------|
| Prisma Schema | 21 models, 11 enums | ✅ All 21 models, 11 enums | **100%** | ✅ DONE |
| Auth (Login/Logout) | Full flow with middleware | ✅ Login, logout, JWT, role middleware | **90%** | ⚠️ Near-complete |
| Auth (Password Mgmt) | Change + Reset + First-login force | ❌ None | **0%** | ❌ MISSING |
| User Management | CRUD + profiles + import/export | ✅ Create/List/Toggle/Delete, ❌ Edit, ❌ Import, ❌ Export | **40%** | ⚠️ Partial |
| Departments | Full CRUD | ✅ Create/List/Delete, ❌ Edit UI | **70%** | ⚠️ Partial |
| Subjects | CRUD + Teacher assignment | ✅ Create/List/Delete, ❌ Edit, ❌ Teacher assignment | **50%** | ⚠️ Partial |
| Classes & Sections | Full CRUD | ✅ Create/List/Delete | **80%** | ⚠️ Near-complete |
| Question Bank | CRUD + Tags + Import/Export | ✅ Create/List/Delete, ❌ Edit, ❌ Tags UI, ❌ Import/Export | **35%** | ⚠️ Partial |
| Exam Builder | Full lifecycle management | ✅ Create/Publish/Delete, ❌ Edit, ❌ Preview, ❌ Schedule | **45%** | ⚠️ Partial |
| Exam Session (Student) | Full exam-taking experience | ✅ Timer, questions, submit, ❌ Review screen, ❌ Timeout auto-submit | **70%** | ⚠️ Partial |
| MCQ Grading | Auto-grade via answer matching | ✅ Working | **95%** | ✅ DONE |
| AI Grading (GPT) | Full OpenAI integration + queue | ❌ Completely absent | **0%** | ❌ MISSING |
| Results & Analytics | Full analytics + export | ✅ Charts + tables, ❌ Publish flow, ❌ Export PDF/CSV, ❌ Rankings | **40%** | ⚠️ Partial |
| Notifications | Full event-driven notifications | ⚠️ UI exists, ❌ Never triggered | **15%** | ❌ BROKEN |
| Audit Logs | Full action logging | ⚠️ Page exists, ❌ Never written to | **10%** | ❌ BROKEN |
| Settings | School config + grading scale | ✅ Form works, ❌ Grading scale editor, ❌ Timezone | **60%** | ⚠️ Partial |
| Shared Components | DataTable, FormFields, etc. | ✅ Basic set, ❌ DataTable (generic), ❌ FormFields, ❌ SearchInput | **35%** | ⚠️ Partial |
| Testing | Vitest + Playwright | ❌ Zero test files | **0%** | ❌ MISSING |
| CI/CD | GitHub Actions | ❌ No workflows | **0%** | ❌ MISSING |
| DevOps | Docker, Sentry, Husky | ❌ Nothing | **0%** | ❌ MISSING |

**Overall weighted score: ~38%**

---

## Severity Levels

### 🔴 CRITICAL (Blocks core functionality)

1. **No AI Grading** — The entire value proposition of ExamCore is "AI-powered grading." The planning docs have 387 lines of detailed AI grading design (prompts, confidence scoring, retry logic, model selection, rubric-based evaluation). NONE of it exists. Currently, short answer and long answer questions can only be graded manually by teachers — defeating the purpose.

2. **No Password Reset/Change** — Users have no way to change or reset passwords. If a student forgets their password, only the admin seeding new passwords in the DB can help. This is production-blocking.

3. **No Edit Functionality ANYWHERE** — You can CREATE users, questions, exams, departments, subjects... but you CANNOT EDIT any of them. No edit user dialog, no edit question form, no edit exam dialog. This is a fundamental CRUD gap.

4. **Notifications Never Fire** — The `createNotification` helper exists but is never called. When exams are assigned, results published, or grades reviewed — no notification is created. The bell icon shows hardcoded "0". The entire notification system is decorative.

5. **Audit Logs Never Written** — `createAuditLog` exists but is never invoked. Admin can view the audit log page — it's always empty. Security and compliance feature is completely non-functional.

### 🟡 HIGH (Significantly degrades experience)

6. **No Exam Edit/Update Flow** — Teacher creates an exam, publishes it... then realizes there's a typo. Can't edit. Must delete and recreate from scratch (and only if no sessions exist).

7. **No Result Publishing Workflow** — The planning docs describe a flow where teachers publish results, then students can see them. Currently, results are visible immediately. No `publishResultsAction`, no published/unpublished distinction.

8. **No Loading/Error Boundary Pages** — No `loading.tsx` or `error.tsx` files in any route. If a page errors, users get the default Next.js error page. If data takes time, there's no skeleton loading.

9. **No Exam Review Before Submit** — Student submits exam without seeing a summary of answered/unanswered questions. The planning described a review screen showing all questions with status marks.

10. **No Tag Management UI** — Tags are defined in the schema but there's no way to create, view, or assign tags through the UI. Question filtering by tags doesn't work.

11. **Home Page Still Default Next.js** — The root `/` page still shows the Next.js default template. Should redirect to login or show a landing page.

### 🟠 MEDIUM (Missing but not blocking)

12. **No Teacher-Subject Assignment** — Teachers can be created, subjects can be created, but there's no UI to assign teachers to subjects. The `TeacherSubject` table exists in schema but can't be populated from the UI.

13. **No Student Profile Details Flow** — When admin creates a student user, the student profile (rollNumber, registrationNo, class, section) is not created from the UI. Only the seed file creates these.

14. **No Exam Scheduling** — `/scheduledStartAt` and `/scheduledEndAt` fields exist in the schema but the exam create dialog has no date pickers for scheduling.

15. **No User Detail/Profile Page** — Clicking on a user in the admin list doesn't go to a detail page. No profile page for users to view/edit their own profile.

16. **No Question Detail/Preview** — Teachers can see questions in a table but can't click to see a full question preview.

17. **No Result Export (PDF/CSV)** — Planning docs describe PDF result cards and CSV export. None implemented.

18. **No Dark Mode Toggle** — `next-themes` is installed but ThemeProvider is not wired. No toggle exists in the UI.

19. **No File Upload** — Question images, school logo, CSV imports — all planned but no upload infrastructure exists.

20. **Unused Dependencies** — `zustand`, `nuqs`, `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form`, `next-themes` are all installed but never used. Adds bundle bloat.

### 🟢 LOW (Nice to have, not urgent)

21. **No Bulk Import/Export** — CSV import for users and questions is planned but not built.
22. **No Exam Duplication** — Planning describes `duplicateExamAction`, not implemented.
23. **No Question Duplication** — `duplicateQuestionAction` planned, not implemented.
24. **No Grading Scale Editor** — Settings page doesn't have the grading scale visual editor.
25. **No Academic Year Selector** — Simple text field instead of a proper selector.
26. **No Mobile Sidebar (Sheet)** — Desktop sidebar exists but no responsive mobile sheet.

---

## Architecture Deviations from Plan

| Planned Architecture | Actual Implementation | Issue |
|---|---|---|
| **Service + Repository layers per module** | Flat `*-actions.ts` + `*-queries.ts` files | No separation of concerns. Business logic mixed with data access. |
| **Module folder structure**: `actions/`, `services/`, `repositories/`, `schemas/`, `types/`, `hooks/`, `constants/` | Each module has: `*-actions.ts`, `*-queries.ts`, `components/` | Missing ~70% of subdirectories per module |
| **Server actions in individual files**: `create-exam.action.ts`, `update-exam.action.ts` | All actions in ONE file per module: `exam-actions.ts` | Violates single-responsibility but not a dealbreaker |
| **API Route Handlers** for REST endpoints | Only `auth [...nextauth]` route exists | No REST API layer at all — no `/api/v1/` routes |
| **TanStack Query** for server state | All data fetched via Server Components + server actions | TanStack Query never used despite being installed |
| **Zustand** for client state | Never used | Exam timer uses local component state |
| **React Hook Form** for forms | Never used — all forms are native `<form>` with `useTransition` | Different pattern but functional |
| **Shared DataTable component** (TanStack Table) | Each module has its own table component | Duplication, inconsistency |
| **Shared FormField components** | Each form is manually constructed | Repetitive code |

---

## Code Quality Assessment

### Positives ✅
- TypeScript strict mode is ON
- Zod validation on all server actions
- Auth checks on every protected action
- Clean file structure (no file over 200 lines)
- Proper error class hierarchy
- Consistent use of Server Components for data
- Good use of revalidatePath after mutations
- Structured Pino logging setup

### Negatives ❌
- **Zero tests** — 0% test coverage. Planning targeted 80%.
- **No CI/CD** — Code quality not enforced automatically
- **No Husky pre-commit hooks** — No lint/format enforcement on commit
- **No commitlint** — No conventional commits enforcement
- **Duplicate utilities** — `cn()` defined in both `lib/utils.ts` and `utils/cn.ts`
- **No API response standardization** — `api-response.ts` helpers exist but never used
- **No request ID tracking** — Logger exists but no request correlation
- **Hardcoded strings** — Some UI text is hardcoded instead of using constants
- **No service layer** — Business logic directly in action files

---

## Database Schema vs. Usage Analysis

| Schema Feature | Defined | Used in Code |
|---|---|---|
| `User.deletedAt` (soft delete) | ✅ | ⚠️ Set but never filtered in queries |
| `User.lastLoginAt` | ✅ | ✅ Updated on login |
| `User.avatarUrl` | ✅ | ❌ No upload or display |
| `User.phone` | ✅ | ✅ Collected in form |
| `StudentProfile.guardianName/Phone` | ✅ | ❌ Never collected |
| `StudentProfile.dateOfBirth/gender` | ✅ | ❌ Never collected |
| `TeacherSubject` (junction) | ✅ | ❌ Never populated from UI |
| `Tag` / `QuestionTag` | ✅ | ❌ Never used from UI |
| `Question.imageUrl` | ✅ | ❌ No upload |
| `Question.gradingRubric` (JSON) | ✅ | ❌ No rubric editor |
| `Question.expectedTime` | ✅ | ⚠️ Collected but not displayed to student |
| `Question.explanation` | ✅ | ⚠️ Collected but not shown post-exam |
| `Exam.scheduledStartAt/EndAt` | ✅ | ❌ No scheduling UI |
| `Exam.shuffleQuestions` | ✅ | ❌ No shuffle implementation |
| `Exam.showResultAfter` | ✅ | ❌ Results always shown immediately |
| `Exam.allowReview` | ✅ | ❌ No post-exam review |
| `StudentAnswer.isMarkedForReview` | ✅ | ❌ No "mark for review" UI |
| `StudentAnswer.timeSpent` | ✅ | ❌ Not tracked per question |
| `AnswerGrade.aiConfidence` | ✅ | ❌ No AI grading |
| `AnswerGrade.aiModelUsed` | ✅ | ❌ No AI grading |
| `AnswerGrade.aiPromptTokens/ResponseTokens` | ✅ | ❌ No AI grading |
| `ExamResult.rank` | ✅ | ❌ No ranking calculation |
| `ExamResult.grade` (letter) | ✅ | ❌ Not computed |
| `ExamResult.publishedAt` | ✅ | ❌ No publish workflow |
| `AuditLog` | ✅ | ❌ Never written |
| `Notification` | ✅ | ⚠️ Schema used but notifications never created |

**Utilization rate: ~55% of schema fields are actually used in application logic.**

---

## Page Count Analysis

| Route Group | Planned Pages | Built Pages | Missing |
|---|---|---|---|
| **Public** | login, forgot-password, reset-password | login | 2 |
| **Admin** | dashboard, users, users/[id], users/new, classes, subjects, settings, reports | dashboard, users, departments, subjects, classes, settings, audit-log | users/[id], users/new, reports |
| **Teacher** | dashboard, questions, questions/new, questions/[id], questions/[id]/edit, questions/tags, exams, exams/new, exams/[id], exams/[id]/edit, exams/[id]/preview, exams/[id]/results, grading, grading/[sessionId], results, results/class | dashboard, questions, exams, grading, grading/[sessionId], results, results/[examId] | 10 pages |
| **Student** | dashboard, exams, exam/[id] (instructions), exam/[id]/session, results, results/[resultId], results/performance | dashboard, exams, exams/[sessionId], results | 3 pages |
| **API** | 20+ REST endpoints | 1 (auth only) | 19+ endpoints |

**Total: ~15 pages built out of ~35 planned = 43% page coverage**
