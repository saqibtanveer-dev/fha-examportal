# ExamCore — Missing Pages & Routes Specification

> **Date:** February 11, 2026
> **Purpose:** Detailed spec for every page that should exist but doesn't

---

## Public Routes

### `/forgot-password`
- **Purpose:** User enters email to receive password reset link
- **Components:** Simple form with email input, submit button, back to login link
- **Action:** `forgotPasswordAction` → generate token → send email via Resend
- **No Auth Required**

### `/reset-password?token=xxx`
- **Purpose:** User enters new password using email token
- **Components:** Password + confirm password inputs, submit button
- **Action:** `resetPasswordAction` → validate token → update password → redirect to login
- **No Auth Required**

---

## Admin Routes

### `/admin/users/[id]` — User Detail Page
- **Purpose:** View full user profile, role-specific details, activity
- **Content:** User info card, role-specific profile (student: class/section/roll, teacher: employee ID/qualification), recent activity, edit button, status toggle
- **Data:** `getUserById` with profile includes

### `/admin/users/new` — Dedicated Create User Page
- **Purpose:** Full-featured user creation with role-specific fields
- **Content:** Multi-step or tabbed form — Basic Info → Role-Specific Fields → Confirmation
- **Student-specific:** Roll number, registration no, class, section, guardian info
- **Teacher-specific:** Employee ID, qualification, specialization

### `/admin/reports` — Admin Reports Dashboard
- **Purpose:** System-wide reports and exports
- **Content:** Cards for different report types (user reports, exam reports, class performance)
- **Actions:** Generate report, download CSV/PDF

### `/admin/departments/[id]` — Department Detail Page
- **Purpose:** View department with its subjects, teachers, stats
- **Content:** Department info, subject list, teacher count, edit/delete

### `/admin/subjects/[id]` — Subject Detail Page
- **Purpose:** View subject with assigned teachers, question count, exam count
- **Content:** Subject info, assigned teachers (with assign/remove), stats

---

## Teacher Routes

### `/teacher/questions/new` — Dedicated Create Question Page
- **Purpose:** Full-page question creation (more space than dialog)
- **Content:** Multi-section form by question type, tag assignment, preview pane
- **Better UX for:** Rubric editing (long answers), rich text model answers

### `/teacher/questions/[id]` — Question Detail Page
- **Purpose:** Full view of a question with all details, usage stats
- **Content:** Question text, type badge, difficulty, marks, model answer/rubric, MCQ options (if applicable), tags, usage history, edit/delete/duplicate buttons

### `/teacher/questions/[id]/edit` — Edit Question Page
- **Purpose:** Edit existing question (all fields)
- **Content:** Pre-filled form matching create flow, save changes button
- **Guard:** Only if question is not in an active exam

### `/teacher/questions/tags` — Tag Management Page
- **Purpose:** Create, view, edit, delete tags by category
- **Content:** Category tabs (TOPIC, DIFFICULTY, BLOOM_LEVEL, CUSTOM), tag list with counts, create tag form

### `/teacher/exams/new` — Dedicated Create Exam Page
- **Purpose:** Multi-step exam builder (more space than dialog)
- **Content:** Step 1: Basic Info → Step 2: Add Questions (with search/filter) → Step 3: Settings (scheduling, shuffle, rules) → Step 4: Assign Classes → Preview → Publish

### `/teacher/exams/[id]` — Exam Detail Page
- **Purpose:** Full view of an exam with all questions, settings, assignments, session stats
- **Content:** Exam info, question list (ordered), class assignments, scheduling info, session count, status actions (publish, archive, complete)

### `/teacher/exams/[id]/edit` — Edit Exam Page
- **Purpose:** Edit exam configuration and questions (draft only)
- **Content:** Pre-filled multi-step form, same as create
- **Guard:** Only DRAFT status exams can be edited

### `/teacher/exams/[id]/preview` — Exam Preview Page
- **Purpose:** Teacher previews exam as a student would see it
- **Content:** Exam-taking layout with questions, timer display (not counting), but no answer submission
- **Read-only view**

### `/teacher/results/class` — Class-Level Results
- **Purpose:** View results aggregated by class for teacher's exams
- **Content:** Class selector, exam selector, aggregate stats, student list with scores

---

## Student Routes

### `/student/exam/[id]` — Exam Instructions Page
- **Purpose:** Pre-exam screen with instructions, rules, duration, attempt info
- **Content:** Exam title, duration, question count, max attempts, instructions, "Start Exam" button with confirmation
- **NOT the exam-taking page — separate step**

### `/student/results/[resultId]` — Result Detail Page
- **Purpose:** Per-question breakdown of exam result
- **Content:** Exam result card (total, percentage, grade, rank), per-question accordion (question text, student answer, correct answer/model answer, marks, AI feedback, teacher feedback)

### `/student/results/performance` — Performance Analytics Page
- **Purpose:** Longitudinal performance tracking
- **Content:** Performance timeline chart, subject-wise averages, strengths/weaknesses, comparison to class average, trend arrows

---

## Profile Routes (All Roles)

### `/profile` — My Profile Page
- **Purpose:** View and edit own profile information
- **Content:** Avatar, name, email, role, role-specific details, change password link, account stats

### `/profile/change-password` — Change Password Page
- **Purpose:** Change current password
- **Content:** Current password, new password, confirm new password, submit

---

## API Routes (REST Layer)

### Planned but Not Built
| Route | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Health check (DB + Redis connectivity) |
| `/api/v1/users` | GET | List users (paginated, filtered) |
| `/api/v1/users/[id]` | GET | Get user details |
| `/api/v1/users/import` | POST | Bulk import users from CSV |
| `/api/v1/users/export` | GET | Export users to CSV |
| `/api/v1/questions` | GET | Search/filter questions |
| `/api/v1/questions/[id]` | GET | Get question details |
| `/api/v1/questions/import` | POST | Bulk import questions |
| `/api/v1/questions/export` | GET | Export questions |
| `/api/v1/exams/available` | GET | Available exams for student |
| `/api/v1/exams/[id]/session` | GET | Get current session state |
| `/api/v1/exams/[id]/auto-save` | POST | Bulk auto-save answers |
| `/api/v1/results/exam/[examId]` | GET | Results for an exam |
| `/api/v1/results/student/[studentId]` | GET | Student's results |
| `/api/v1/results/[resultId]/export` | GET | Export result as PDF |
| `/api/v1/analytics/dashboard` | GET | Dashboard stats |
| `/api/v1/analytics/exam/[examId]` | GET | Exam analytics |
| `/api/v1/analytics/class/[classId]` | GET | Class analytics |
| `/api/v1/notifications` | GET | User notifications |
| `/api/v1/notifications/unread-count` | GET | Unread count |
| `/api/v1/grading/process` | POST | Queue worker callback |
| `/api/v1/grading/status/[sessionId]` | GET | Grading progress |
| `/api/cron/cleanup-expired-sessions` | GET | Cron: cleanup |
| `/api/cron/send-exam-reminders` | GET | Cron: reminders |

---

## Total Missing Pages Summary

| Category | Missing Pages | Effort |
|---|---|---|
| Public auth pages | 2 | 2 days |
| Admin detail pages | 4 | 2 days |
| Teacher pages | 9 | 5 days |
| Student pages | 3 | 2 days |
| Profile pages | 2 | 1 day |
| API routes | 20+ | 3-5 days |
| **Total** | **~40** | **~15-17 days** |
