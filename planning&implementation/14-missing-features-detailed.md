# ExamCore — Missing Features & Incomplete Implementations (Detailed)

> **Date:** February 11, 2026
> **Purpose:** Exhaustive list of every gap, ordered by module, with specific missing details

---

## 1. Authentication & Security Module

### ❌ Completely Missing
| Feature | Details | Planning Reference |
|---|---|---|
| **Password Change Flow** | No `/change-password` page, no `changePasswordAction`, users can't update their own password | 08-auth-rbac-design.md, 12-implementation-roadmap.md Phase 1.2 |
| **Forgot Password Flow** | No `/forgot-password` page, no email-based token flow, no `resetPasswordAction` | 08-auth-rbac-design.md Phase 1.2 |
| **Reset Password Flow** | No `/reset-password` page, no token validation, no `newPasswordSchema` | 08-auth-rbac-design.md |
| **Force Password Change on First Login** | Admin creates user → user should be forced to change default password | 08-auth-rbac-design.md |
| **Brute Force Protection** | No login attempt tracking, no 15-min lockout, no Redis-based rate limiting | 08-auth-rbac-design.md |
| **Session Invalidation on Password Change** | Not implemented since password change doesn't exist | 08-auth-rbac-design.md |
| **Rate Limiting** | No rate limiter on ANY endpoint (login, API, AI grading) | 05-api-design.md |
| **Password Validation Regex** | `loginSchema` validates email + min length but NO uppercase/special char requirement | 08-auth-rbac-design.md |

### ⚠️ Partially Done
| Feature | What Exists | What's Missing |
|---|---|---|
| **Middleware route protection** | Role-based route guards work | No fine-grained resource ownership checks at middleware level |
| **Session management** | JWT with 30-day expiry | No "single session per user" option, no session listing |

---

## 2. User Management Module

### ❌ Completely Missing
| Feature | Details |
|---|---|
| **Edit User Dialog** | `updateUserAction` exists in planning but no edit form UI. Users cannot be edited after creation. |
| **User Detail Page** | `/admin/users/[id]` planned but not built. No way to view full user profile. |
| **Create User Page** | `/admin/users/new` planned as dedicated page, currently only a dialog |
| **Student Profile from UI** | When creating a student, roll number, registration no, class, section are NOT collected. Only name + email + password |
| **Teacher Profile from UI** | When creating a teacher, employee ID, qualification, specialization are NOT collected |
| **User CSV Import** | No import dialog, no CSV parser, no bulk creation |
| **User CSV Export** | No export button, no CSV generation |
| **User Search** | Basic search param exists but only filters by name/email substring — no advanced search |
| **Profile Edit (Own)** | No `/profile` page where users can edit their own info |
| **Avatar Upload** | `avatarUrl` field in schema but no upload mechanism |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **User Table** | Works with pagination + role filter, but no sorting, no column visibility toggle |
| **Soft Delete** | `deletedAt` is set but queries don't filter out soft-deleted users (they still appear) |

---

## 3. Department Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Edit Department** | `updateDepartmentAction` exists but no edit dialog/form in UI |
| **Department Detail Page** | No way to click into a department and see its subjects |
| **Department Status Toggle** | `isActive` field exists but no toggle UI |

---

## 4. Subject Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Edit Subject** | `updateSubjectAction` exists but no edit UI |
| **Teacher-Subject Assignment UI** | `TeacherSubject` table in schema, assignment action in planning, but NO UI to assign teachers to subjects |
| **Subject Detail Page** | No page showing subject's questions, exams, assigned teachers |
| **Subject Status Toggle** | `isActive` field not toggleable from UI |

---

## 5. Class & Section Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Edit Class** | No edit dialog |
| **Edit Section** | No edit option |
| **Student-Class Assignment UI** | No way to move students between classes/sections from UI |
| **Class Detail Page** | No page showing class students, sections, exam assignments |
| **Bulk Student Move** | Moving multiple students to a different section |

---

## 6. Question Bank Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Edit Question** | No edit form. Teacher must delete and recreate. |
| **Question Detail/Preview Page** | No dedicated question view with full details |
| **Tag Management UI** | No way to create/view/delete tags |
| **Tag Assignment UI** | No way to add/remove tags from questions |
| **Question Import** | No CSV/JSON import for bulk questions |
| **Question Export** | No CSV/JSON export |
| **Question Duplication** | `duplicateQuestionAction` planned but not built |
| **Rubric Editor** | Planned `RubricEditor` component for long answers — not built |
| **Rich Text Editor (Tiptap)** | Planned for long answer questions — not integrated |
| **Question Image Upload** | `imageUrl` field exists but no upload |
| **Full-Text Search** | Planned for question title/description — not implemented |
| **Bloom's Taxonomy Tagging** | `BLOOM_LEVEL` tag category in schema, never used |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **MCQ Options Editor** | Works well (add/remove/mark correct), but no image support per option |
| **Question Filtering** | Type and difficulty filters work, but no tag filter, no subject dropdown |
| **Model Answer** | Collected for SHORT_ANSWER type, but not displayed to student after exam |

---

## 7. Exam Builder Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Edit Exam** | `updateExamAction` exists (draft-only check) but no edit dialog |
| **Exam Detail Page** | No dedicated exam view showing all questions + settings |
| **Exam Preview** | Teacher can't preview how the exam looks to students |
| **Exam Scheduling** | `scheduledStartAt`/`scheduledEndAt` fields unused, no date pickers |
| **Question Reordering** | No drag-and-drop, `sortOrder` ignored visually |
| **Question Search in Exam Builder** | Current dialog shows ALL questions as checkboxes, no search/filter |
| **Auto-Generate Exam from Question Bank** | `autoGenerateExamAction` planned — not built |
| **Exam Duplication** | `duplicateExamAction` planned — not built |
| **Exam Archive** | `archiveExamAction` planned — status change not implemented |
| **Marks Override per Question** | `ExamQuestion.marks` can differ from `Question.marks` but UI uses question marks directly |
| **Exam Instructions Editor** | Basic text area, no rich text |
| **Shuffle Questions** | `shuffleQuestions` boolean in schema, never applied |
| **Show Result After** | `showResultAfter` enum in schema, never enforced |
| **Allow Review** | `allowReview` boolean in schema, never enforced |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **Exam Status Management** | DRAFT → PUBLISHED works. No ACTIVE → COMPLETED → ARCHIVED transitions |
| **Class Assignment** | Works at class level, but section-level assignment not functional |

---

## 8. Exam Session Module (Student Experience)

### ❌ Missing
| Feature | Details |
|---|---|
| **Exam Instructions Page** | No pre-exam instructions screen. Student goes directly to questions. |
| **Start Exam Confirmation** | No "Are you sure you want to start?" dialog |
| **Review Before Submit** | No summary screen showing answered/unanswered/flagged questions |
| **Mark for Review** | `isMarkedForReview` in schema — no UI button or visual indicator |
| **Timeout Auto-Submit** | Timer exists but no auto-submit when timer hits 0 (or notification) |
| **Time Spent Per Question** | `timeSpent` field in `StudentAnswer` — not tracked |
| **Session Heartbeat** | No 30-second heartbeat to detect disconnection |
| **Browser Refresh Recovery** | Partially works (session restored via DB), but no localStorage backup |
| **Duplicate Tab Detection** | Not implemented |
| **Network Disconnection Handling** | No offline queue or retry |
| **IP/User Agent Tracking** | `ipAddress`/`userAgent` in schema — never captured |
| **Rich Text Input for Long Answers** | Plain textarea, no Tiptap editor |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **Timer** | ✅ Countdown works, ⚠️ No warning at 5min/1min, ❌ No auto-submit |
| **Auto-Save** | ✅ Saves on question blur/change, ❌ No periodic 60s bulk save |
| **Question Navigation Palette** | ✅ Shows question numbers, ⚠️ No answered/unanswered/flagged differentiation styling |

---

## 9. Grading Module

### ❌ Completely Missing
| Feature | Details |
|---|---|
| **AI Grading Engine (OpenAI)** | Zero implementation. No Vercel AI SDK usage. No prompts. No structured output. |
| **BullMQ Queue** | No queue setup. No workers. No Redis integration for grading. |
| **Confidence Scoring** | `aiConfidence` field in schema — never computed |
| **Model Selection Strategy** | GPT-4o-mini → GPT-4o fallback — not built |
| **Retry Logic** | No exponential backoff, no model escalation |
| **Token Usage Tracking** | `aiPromptTokens`/`aiResponseTokens` — never tracked |
| **AI Grade Review Flow** | Teacher can override marks manually, but no AI confidence badge, no bulk approve |
| **Regrade Request** | `requestRegradeAction` — not built |
| **Grade Letter Computation** | `ExamResult.grade` (A+, A, B) — never computed against grading scale |
| **Ranking Calculation** | `ExamResult.rank` — never calculated |
| **Result Publishing** | `ExamResult.publishedAt` — never set, results always visible |
| **Post-Exam Explanation Display** | `Question.explanation` — never shown to student after exam |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **MCQ Auto-Grading** | ✅ Works correctly |
| **Manual Teacher Grading** | ✅ Grading interface works for non-MCQ answers, marks + feedback |
| **Result Calculation** | ✅ Total, percentage, pass/fail computed. ❌ Grade letter + rank missing |

---

## 10. Results & Analytics Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Result Detail Page (Student)** | No per-question breakdown view for students |
| **PDF Result Card** | No PDF generation for result cards |
| **CSV Result Export** | No CSV export for class results |
| **Class-Level Analytics** | Only exam-level analytics exist |
| **Question-Level Analytics** | No difficulty index, discrimination index per question |
| **Class Comparison Charts** | Planned but not built |
| **Student Performance History Page** | `/student/results/performance` — not a separate page |
| **Result Rankings Display** | No rank column in results |
| **Result Publishing Workflow** | No publish/unpublish toggle for teachers |
| **Report Cards** | Planned under admin reports — not built |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **Exam Analytics** | ✅ Distribution chart + summary stats, ❌ Question-level breakdown |
| **Student Analytics** | ✅ Timeline + subject averages, ❌ Ranking, ❌ Performance trend |
| **Results Table** | ✅ Shows marks/percentage/pass, ❌ Only basic fields |

---

## 11. Notification System

### ❌ Missing
| Feature | Details |
|---|---|
| **Notification Triggers** | No code calls `createNotification` anywhere in the app |
| **Exam Assigned Notification** | When teacher publishes exam → students NOT notified |
| **Result Published Notification** | When result calculated → student NOT notified |
| **AI Grade Flagged Notification** | Low confidence → teacher NOT notified |
| **Exam Reminder** | No cron job for day-before reminders |
| **Top-Nav Bell Integration** | Bell component shows hardcoded "0" instead of real count |
| **Real-Time Updates** | No WebSocket/SSE for live notification push |

### ⚠️ Partially Done
| Feature | Status |
|---|---|
| **Notification UI** | ✅ List component with mark read/delete, ⚠️ Nothing to display |
| **Backend Helpers** | ✅ `createNotification`/`createBulkNotifications` exist but never invoked |

---

## 12. Audit Logging

### ❌ Missing
| Feature | Details |
|---|---|
| **Audit Log Writing** | `createAuditLog` exists but ZERO calls in the entire codebase |
| **Actions that should be logged** | User create/delete, exam create/publish/delete, grade override, password change, settings update — NONE logged |
| **IP Address Capture** | Planned per audit entry — not captured |

---

## 13. Settings Module

### ❌ Missing
| Feature | Details |
|---|---|
| **Grading Scale Visual Editor** | Planned interactive editor for A+/A/B/C/D/F boundaries |
| **Timezone Selector** | Simple text field instead of timezone dropdown |
| **Academic Year Management** | No start/end year management, just a text field |
| **School Logo Upload** | `schoolLogo` field — no upload capability |

---

## 14. Infrastructure & DevOps

### ❌ Completely Missing
| Feature | Details |
|---|---|
| **Vitest Configuration** | No `vitest.config.ts` |
| **Unit Tests** | 0 test files |
| **Integration Tests** | 0 test files |
| **Playwright E2E Tests** | No `playwright.config.ts`, no test files |
| **GitHub Actions CI** | No `.github/workflows/` directory |
| **GitHub Actions Deploy** | No deploy workflows |
| **Husky Pre-commit** | No `.husky/` directory |
| **lint-staged** | No `lint-staged.config.js` |
| **commitlint** | No `commitlint.config.js` |
| **Docker Compose** | No `docker-compose.yml` for local PostgreSQL + Redis |
| **Sentry Integration** | No Sentry SDK installed or configured |
| **`.env.example`** | No example env file for developer onboarding |
| **`vercel.json`** | No Vercel configuration file |
| **Health Check API** | No `/api/health` endpoint |
| **Cron Jobs** | No scheduled tasks for cleanup or reminders |
| **Redis Setup** | No Redis client, no BullMQ configuration |
| **Vercel Analytics** | Not integrated |
| **Content Security Policy** | No CSP headers |
| **API Versioning** | No `/api/v1/` prefix structure |

---

## 15. UI/UX Gaps

### Missing Pages (Planned but not created)
| Page | Description |
|---|---|
| `/forgot-password` | Password reset request form |
| `/reset-password` | New password entry with token |
| `/admin/users/[id]` | User detail page |
| `/admin/users/new` | Dedicated create user page |
| `/admin/reports` | Admin reports dashboard |
| `/teacher/questions/new` | Dedicated create question page |
| `/teacher/questions/[id]` | Question detail view |
| `/teacher/questions/[id]/edit` | Edit question page |
| `/teacher/questions/tags` | Tag management page |
| `/teacher/exams/new` | Dedicated create exam page |
| `/teacher/exams/[id]` | Exam detail page |
| `/teacher/exams/[id]/edit` | Edit exam page |
| `/teacher/exams/[id]/preview` | Exam preview (teacher view) |
| `/teacher/results/class` | Class-level results page |
| `/student/exam/[id]` | Exam instructions page (before start) |
| `/student/results/[resultId]` | Detailed result breakdown |
| `/student/results/performance` | Performance analytics page |

### Missing UI Components
| Component | Described In |
|---|---|
| **Generic DataTable** (with sorting, column visibility, toolbar) | 09-frontend-architecture.md |
| **Reusable FormField components** (TextField, SelectField, etc.) | 09-frontend-architecture.md |
| **SearchInput** (debounced) | 09-frontend-architecture.md |
| **Breadcrumbs** | 09-frontend-architecture.md |
| **Mobile Sidebar** (Sheet) | 09-frontend-architecture.md |
| **Loading Skeletons** per module | 09-frontend-architecture.md |
| **Empty States** per module (custom per context) | 09-frontend-architecture.md |
| **RoleBadge** component | 09-frontend-architecture.md |
| **NotificationBell** (wired to real data) | 09-frontend-architecture.md |
| **UserMenu** with proper avatar | 09-frontend-architecture.md |
| **Exam Timer Warnings** (5min, 1min visual) | 09-frontend-architecture.md |
| **Drag-and-Drop Question Reorder** | 06-module-breakdown.md |

### Missing UX Flows
| Flow | Description |
|---|---|
| **Bulk operations** | Select multiple users/questions → bulk delete/export |
| **Confirmation on destructive actions** | `ConfirmDialog` exists but not used everywhere (e.g., exam delete) |
| **Form validation feedback** | Some forms show errors but not field-level inline validation |
| **Toast notifications** | Sonner installed but inconsistently used across actions |
| **Keyboard navigation** | Not tested or ensured |
| **Responsive mobile layouts** | Desktop-first built, mobile not verified |
