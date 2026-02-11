# ExamCore — New Features & Enhancements to Add

> **Date:** February 11, 2026
> **Purpose:** Features NOT in the original planning docs that should be added to make ExamCore truly production-ready and portfolio-impressive

---

## Tier 1: Must-Have New Features (High Impact)

### 1.1 Exam Anti-Cheating Measures
**Why:** Any exam system without anti-cheating is a toy project.

| Feature | Description |
|---|---|
| **Tab Switch Detection** | Detect when student switches browser tab during exam. Log count. Optionally auto-submit after N switches. |
| **Full-Screen Mode** | Request fullscreen mode during exam. Warn if exited. |
| **Copy-Paste Blocking** | Disable right-click and copy-paste in exam mode |
| **Question Randomization** | Shuffle question order per student (already in schema, needs implementation) |
| **MCQ Option Randomization** | Shuffle option order per student per question |
| **Browser History Blocking** | Prevent going back to previous pages during exam |
| **Screenshot Alert** | Detect PrintScreen key |

**Implementation:** Zustand store for exam session + event listeners + server-side logging.

### 1.2 Comprehensive Activity Dashboard
**Why:** Every SaaS product needs an activity feed.

| Feature | Description |
|---|---|
| **Admin Activity Feed** | Recent actions across the system (user created, exam published, etc.) |
| **Teacher Activity Feed** | My recent grading, question creation, exam activity |
| **Student Activity Feed** | Exams taken, results received, upcoming deadlines |
| **Real-Time Activity Count** | "5 students are currently taking Math Quiz" |

### 1.3 Advanced Analytics & Reporting
**Why:** Data-driven decisions are a key selling point.

| Feature | Description |
|---|---|
| **Exam Difficulty Analysis** | Auto-compute difficulty index per question based on student performance |
| **Discrimination Index** | How well each question discriminates between high and low performers |
| **Item Response Theory (IRT)** | Advanced psychometric analysis of questions |
| **Subject-Wise Class Comparison** | Compare Class 9A vs 9B in Physics across multiple exams |
| **Teacher Performance Report** | Avg student scores for each teacher's exams |
| **Trend Analysis** | Performance trends over academic year with line charts |
| **Export to PDF Reports** | Auto-generated report cards with school logo + formatting |

### 1.4 Email Notification System
**Why:** In-app notifications alone aren't enough for a school environment.

| Feature | Description |
|---|---|
| **Exam Assignment Email** | Email students when a new exam is assigned |
| **Exam Reminder Email** | 24 hrs before exam deadline |
| **Result Published Email** | When teacher publishes results |
| **Password Reset Email** | Token-based email for password recovery |
| **Welcome Email** | On new user account creation |
| **Email Provider** | Resend or Nodemailer — both well-documented |

### 1.5 Comprehensive User Profile System
**Why:** Users need to see and manage their own information.

| Feature | Description |
|---|---|
| **Profile Page** | `/profile` — view own info, avatar, role-specific details |
| **Avatar Upload** | Uploadthing integration for profile pictures |
| **Personal Stats** | Student: exam count, avg score, rank; Teacher: question/exam count; Admin: system stats |
| **Account Security** | Last login, active sessions, password change history |

---

## Tier 2: High-Value Additions (Portfolio Differentiators)

### 2.1 Question Bank Intelligence
| Feature | Description |
|---|---|
| **AI Question Generation** | Use GPT to generate questions from a topic or text passage |
| **Similar Question Detection** | Detect duplicate/similar questions in the bank |
| **Question Quality Score** | Auto-rate questions based on usage stats (discrimination, avg time) |
| **Question Version History** | Track edits to questions over time |

### 2.2 Exam Session Monitoring (Teacher View)
| Feature | Description |
|---|---|
| **Live Exam Monitor** | Teacher sees which students are online, current progress |
| **Real-Time Progress Board** | Dashboard showing all active exam sessions |
| **Student Status Indicators** | Online/offline, current question, time remaining |
| **Emergency Actions** | Teacher can extend time, pause exam, or force-submit for a student |

### 2.3 Student Self-Service
| Feature | Description |
|---|---|
| **Practice Mode** | Students can retake exams in practice mode (no grading) |
| **Study Guides** | Show correct answers + explanations after exam review period |
| **Performance Goals** | Students set target grades, track progress toward them |
| **Question Bank Access (Limited)** | Let students practice with random questions from a subject |

### 2.4 Data Import/Export System
| Feature | Description |
|---|---|
| **User CSV Import** | Bulk import students/teachers from CSV with validation report |
| **Question CSV/JSON Import** | Import questions in bulk from structured files |
| **Result Export (PDF)** | Beautiful PDF result cards with school branding |
| **Result Export (CSV/Excel)** | Full data export for spreadsheet analysis |
| **Exam Export** | Export exam as PDF for offline use or record-keeping |
| **Database Backup UI** | Admin can trigger/download database backups |

### 2.5 Advanced Exam Features
| Feature | Description |
|---|---|
| **Question Pools** | Define a pool of 50 questions, each student gets random 20 |
| **Sectioned Exams** | Exam divided into sections (Section A: MCQ, Section B: Short Answer) |
| **Mandatory Questions** | Some questions required, some optional |
| **Negative Marking** | Configurable negative marks for wrong MCQ answers |
| **Partial Marking** | Partial credit for partially correct answers |
| **Question Weightage by Category** | Auto-generate based on difficulty distribution |

---

## Tier 3: Nice-to-Have Features (Polish & UX)

### 3.1 UI/UX Enhancements
| Feature | Description |
|---|---|
| **Dark Mode** | Already have `next-themes` — just wire it up |
| **Theme Customization** | Admin can set school's primary color in settings |
| **Keyboard Shortcuts** | `Ctrl+S` to save, arrow keys in exam, etc. |
| **Contextual Help** | Tooltip help icons on complex forms |
| **Onboarding Wizard** | First-time admin setup: school info → create departments → subjects → classes |
| **Dashboard Widgets** | Drag-and-drop customizable dashboard layout |
| **Command Palette** | `Cmd+K` search across exams, users, questions (like VS Code) |
| **Breadcrumb Navigation** | Show where user is in the hierarchy |

### 3.2 Communication Features
| Feature | Description |
|---|---|
| **Announcements** | Admin/teacher can post announcements visible on dashboards |
| **Exam Comments** | Teacher can add notes to individual student exams |
| **Feedback System** | Students can submit concerns about AI grading |

### 3.3 Accessibility Enhancements
| Feature | Description |
|---|---|
| **Screen Reader Optimization** | ARIA labels on all custom components |
| **High Contrast Mode** | For visually impaired users |
| **Font Size Control** | User preference for text size |
| **Keyboard-Only Navigation** | Full app navigable with keyboard |
| **Exam Accommodations** | Extended time for specific students |

### 3.4 Performance & Reliability
| Feature | Description |
|---|---|
| **Offline Exam Mode** | Service worker caches exam, syncs on reconnect |
| **Rate Limiting** | Protect auth + API endpoints from abuse |
| **Request Deduplication** | Prevent double-submissions |
| **Concurrent Edit Prevention** | Lock exam while teacher is editing |
| **Connection Pooling Dashboard** | Admin can monitor DB connection health |

---

## Tier 4: Future Scope Ideas (V2+)

| Feature | Description |
|---|---|
| **Multi-Language Support** (i18n) | Urdu, Arabic, English |
| **Parent Portal** | Parents can view child's results and attendance |
| **Attendance Integration** | Track exam attendance |
| **Learning Management System (LMS)** hooks | Integration with Google Classroom |
| **API for Third-Party Integration** | REST API for external tools |
| **Webhook System** | Notify external systems on events |
| **Mobile App** (PWA) | Progressive Web App for mobile-native feel |
| **Proctoring via Webcam** | Advanced video proctoring |
| **AI Tutor Chat** | Students ask AI about their mistakes |
| **Plagiarism Detection** | Detect similar answers between students |

---

## Priority Matrix

```
                    HIGH IMPACT
                        ↑
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │  Tier 1: MUST     │  Tier 2: HIGH     │
    │  - AI Grading ★   │  - AI Question Gen│
    │  - Anti-Cheating  │  - Live Monitor   │
    │  - Email System   │  - Practice Mode  │
    │  - User Profiles  │  - Import/Export  │
    │  - Activity Feed  │  - Advanced Exams │
    │                   │                   │
LOW ├───────────────────┼───────────────────┤ HIGH
EFFORT│                 │                   │ EFFORT
    │  Tier 3: NICE     │  Tier 4: FUTURE   │
    │  - Dark Mode      │  - i18n           │
    │  - Shortcuts      │  - Parent Portal  │
    │  - Breadcrumbs    │  - LMS Integration│
    │  - Accessibility  │  - Webcam Proctor │
    │  - Onboarding     │  - AI Tutor       │
    │                   │                   │
    └───────────────────┼───────────────────┘
                        ↓
                    LOW IMPACT
```

---

## Recommended Feature Prioritization for Development

### Phase A — Fix the Foundation (Before adding new features)
1. ✅ Add edit flows for ALL entities (users, questions, exams, etc.)
2. ✅ Wire up notification system (trigger on real events)
3. ✅ Wire up audit logging (log on every mutation)
4. ✅ Implement password change + reset
5. ✅ Add loading.tsx and error.tsx boundaries
6. ✅ Fix home page (redirect or landing)
7. ✅ Fix soft-delete query filtering
8. ✅ Implement all planned schema fields (scheduling, shuffle, etc.)

### Phase B — Core New Features
1. 🔴 AI Grading (the whole value proposition)
2. 🔴 Anti-cheating measures for exams
3. 🟡 Email notifications (Resend)
4. 🟡 User profile pages
5. 🟡 Exam scheduling with date pickers
6. 🟡 Tag management UI
7. 🟡 Teacher-Subject assignment

### Phase C — Portfolio Polish
1. 🟡 Live exam monitoring
2. 🟡 Advanced analytics & reports
3. 🟡 Dark mode
4. 🟡 Import/Export system
5. 🟡 PDF generation
6. 🟢 Command palette
7. 🟢 Onboarding wizard
8. 🟢 Keyboard shortcuts

### Phase D — Testing & DevOps
1. 🔴 Vitest unit tests for grading + auth
2. 🔴 GitHub Actions CI
3. 🟡 Playwright E2E for critical flows
4. 🟡 Sentry error tracking
5. 🟡 Docker Compose for local dev
6. 🟡 `.env.example` file
7. 🟡 Husky + lint-staged
