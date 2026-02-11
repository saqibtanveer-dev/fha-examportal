# ExamCore — Statistical Analysis & Project Health Report

> **Date:** February 11, 2026
> **Purpose:** Deep quantitative analysis of the project across multiple dimensions

---

## 1. Codebase Size Statistics

### File Counts
| Category | Count |
|---|---|
| **Total source files** (src/) | ~70 files |
| **React Components** (.tsx) | ~40 files |
| **Server Actions** (*-actions.ts) | ~10 files |
| **Query/Data files** (*-queries.ts) | ~10 files |
| **Utility/Lib files** | ~15 files |
| **Type definition files** | ~3 files |
| **Validation schema files** | ~6 files |
| **shadcn UI components** | 24 files |
| **Planning documents** | 12 files |
| **Test files** | 0 files ❌ |
| **CI/CD workflow files** | 0 files ❌ |

### Lines of Code (Estimated)
| Layer | Files | Est. Total Lines |
|---|---|---|
| Prisma Schema | 1 | ~544 |
| Modules (actions + queries) | ~20 | ~1,300 |
| Module Components | ~18 | ~2,100 |
| Page Routes | ~25 | ~1,500 |
| Layout Components | 5 | ~350 |
| Shared Components | 7 | ~300 |
| shadcn UI Components | 24 | ~2,400 |
| Lib Files | 7 | ~350 |
| Utils/Errors/Types | 8 | ~400 |
| Validations | 6 | ~350 |
| Seed File | 1 | ~328 |
| Config Files | 5 | ~200 |
| **TOTAL** | **~127** | **~10,000** |
| Planning Docs | 12 | ~5,500 |
| **Grand Total** | **~139** | **~15,500** |

### 300-Line Rule Compliance
| Status | Count |
|---|---|
| Files under 200 lines | ~95% |
| Files 200-300 lines | ~5% |
| Files exceeding 300 lines | 0% ✅ |
| **Compliance:** | **100%** |

---

## 2. Feature Completion Matrix

### By Phase (from Implementation Roadmap)

| Phase | Phase Name | Tasks | Done | Partial | Missing | Score |
|---|---|---|---|---|---|---|
| 0 | Project Setup & Foundation | 35 tasks | 25 | 5 | 5 | 72% |
| 1 | Auth & User Management | 30 tasks | 12 | 3 | 15 | 40% |
| 2 | Organization Setup | 20 tasks | 14 | 2 | 4 | 70% |
| 3 | Question Bank | 25 tasks | 8 | 3 | 14 | 32% |
| 4 | Exam Builder | 24 tasks | 8 | 4 | 12 | 33% |
| 5 | Exam Session | 20 tasks | 10 | 4 | 6 | 50% |
| 6 | Grading Engine | 30 tasks | 5 | 2 | 23 | 17% |
| 7 | Results & Analytics | 22 tasks | 6 | 3 | 13 | 27% |
| 8 | Polish, Testing & Launch | 30 tasks | 0 | 2 | 28 | 0% |
| **TOTAL** | — | **236** | **88** | **28** | **120** | **37%** |

### By Module (Functional Completeness)

```
Auth            ████████░░░░░░░░░░░░  40%
Users           ████████░░░░░░░░░░░░  40%
Departments     ██████████████░░░░░░  70%
Subjects        ██████████░░░░░░░░░░  50%
Classes         ████████████████░░░░  80%
Questions       ███████░░░░░░░░░░░░░  35%
Exams           █████████░░░░░░░░░░░  45%
Sessions        ██████████████░░░░░░  70%
MCQ Grading     ███████████████████░  95%
AI Grading      ░░░░░░░░░░░░░░░░░░░░   0%
Results         ████████░░░░░░░░░░░░  40%
Analytics       ████████░░░░░░░░░░░░  40%
Notifications   ███░░░░░░░░░░░░░░░░░  15%
Audit           ██░░░░░░░░░░░░░░░░░░  10%
Settings        ████████████░░░░░░░░  60%
Testing         ░░░░░░░░░░░░░░░░░░░░   0%
CI/CD           ░░░░░░░░░░░░░░░░░░░░   0%
DevOps          ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 3. CRUD Coverage Analysis

| Entity | Create | Read (List) | Read (Detail) | Update | Delete | Import | Export |
|---|---|---|---|---|---|---|---|
| User | ✅ | ✅ | ❌ | ❌ | ✅ (soft) | ❌ | ❌ |
| Department | ✅ | ✅ | ❌ | ❌ (action only) | ✅ | — | — |
| Subject | ✅ | ✅ | ❌ | ❌ (action only) | ✅ | — | — |
| Class | ✅ | ✅ | ❌ | ❌ | ✅ | — | — |
| Section | ✅ | ✅ (nested) | — | ❌ | ✅ | — | — |
| Question | ✅ | ✅ | ❌ | ❌ | ✅ (soft) | ❌ | ❌ |
| Exam | ✅ | ✅ | ❌ | ❌ (action only) | ✅ (soft) | — | — |
| Session | ✅ | ✅ | ✅ | ✅ (answers) | — | — | — |
| Grade | ✅ (auto + manual) | ✅ | ✅ | ✅ (override) | — | — | — |
| Result | ✅ (auto-calc) | ✅ | ❌ | — | — | — | ❌ |
| Notification | — | ✅ | — | ✅ (read status) | ✅ | — | — |
| Audit Log | — | ✅ | — | — | — | — | — |
| Settings | — | ✅ | — | ✅ | — | — | — |
| Tag | ❌ | ❌ | — | ❌ | ❌ | — | — |
| Teacher-Subject | ❌ | ❌ | — | — | ❌ | — | — |

**CRUD Completeness: Create 77% | Read List 92% | Read Detail 15% | Update 23% | Delete 69%**

---

## 4. Schema Utilization Analysis

### Fields Defined vs. Used in Application Logic

| Category | Fields Defined | Fields Used | Utilization |
|---|---|---|---|
| User | 12 | 10 | 83% |
| StudentProfile | 9 | 5 | 56% |
| TeacherProfile | 7 | 5 | 71% |
| Question | 15 | 10 | 67% |
| Exam | 17 | 10 | 59% |
| ExamSession | 9 | 6 | 67% |
| StudentAnswer | 7 | 4 | 57% |
| AnswerGrade | 10 | 4 | 40% |
| ExamResult | 10 | 6 | 60% |
| **Overall** | **~96** | **~60** | **62%** |

### Specific Unused Fields
- `User.avatarUrl` — no upload
- `StudentProfile.guardianName/Phone/dateOfBirth/gender` — never collected
- `Question.imageUrl/gradingRubric/expectedTime` — partially neglected
- `Exam.scheduledStartAt/EndAt/shuffleQuestions/showResultAfter/allowReview` — completely unused
- `StudentAnswer.isMarkedForReview/timeSpent` — not tracked
- `AnswerGrade.aiConfidence/aiModelUsed/aiPromptTokens/aiResponseTokens` — no AI
- `ExamResult.rank/grade/publishedAt` — not computed

---

## 5. Dependency Health Analysis

### Used Dependencies
| Package | Used? | Purpose |
|---|---|---|
| next | ✅ | Core framework |
| react | ✅ | UI library |
| @prisma/client | ✅ | Database ORM |
| next-auth | ✅ | Authentication |
| bcryptjs | ✅ | Password hashing |
| zod | ✅ | Validation |
| tailwindcss | ✅ | Styling |
| lucide-react | ✅ | Icons |
| recharts | ✅ | Charts |
| sonner | ✅ | Toast notifications |
| pino + pino-pretty | ✅ | Logging |
| date-fns | ✅ | Date utilities |
| class-variance-authority | ✅ | Component variants |
| tailwind-merge | ✅ | Class merging |
| All @radix-ui/* | ✅ | UI primitives |
| cmdk | ✅ | Command component |

### UNUSED Dependencies (Installed but never imported)
| Package | Installed | Used | Status |
|---|---|---|---|
| `@tanstack/react-query` | ✅ | ❌ | **DEAD** — Provider exists, no queries |
| `@tanstack/react-table` | ✅ | ❌ | **DEAD** — Tables are manual |
| `zustand` | ✅ | ❌ | **DEAD** — No store files |
| `nuqs` | ✅ | ❌ | **DEAD** — URL state manual |
| `react-hook-form` | ✅ | ❌ | **DEAD** — All forms native |
| `@hookform/resolvers` | ✅ | ❌ | **DEAD** — Goes with react-hook-form |
| `next-themes` | ✅ | ❌ | **DEAD** — No ThemeProvider wired |
| `uuid` | ✅ | ❓ | Unclear usage |

**Bundle impact:** ~8 unused packages adding unnecessary JS to client bundle.

### Missing Dependencies (Needed for planned features)
| Package | Needed For |
|---|---|
| `@vercel/ai` / `ai` | AI grading (Vercel AI SDK) |
| `openai` | OpenAI API integration |
| `bullmq` | Job queue for async grading |
| `ioredis` / `@upstash/redis` | Redis for queues + rate limiting |
| `resend` / `nodemailer` | Email notifications |
| `@tiptap/*` | Rich text editor for long answers |
| `@sentry/nextjs` | Error tracking |
| `uploadthing` | File uploads |
| `vitest` | Unit testing |
| `@testing-library/react` | Component testing |
| `playwright` | E2E testing |
| `msw` | API mocking for tests |
| `husky` | Git hooks |
| `lint-staged` | Pre-commit linting |
| `@commitlint/*` | Commit message linting |

---

## 6. Security Assessment

| Security Feature | Status | Risk Level |
|---|---|---|
| Password hashing (bcrypt, 12 rounds) | ✅ Implemented | Low |
| JWT session management | ✅ Implemented | Low |
| Role-based middleware | ✅ Implemented | Low |
| Server action auth checks | ✅ Implemented | Low |
| SQL injection prevention (Prisma) | ✅ Built-in | Low |
| XSS prevention (React) | ✅ Built-in | Low |
| CSRF protection (Server Actions) | ✅ Built-in | Low |
| Password policy enforcement | ❌ Missing | **HIGH** |
| Brute force protection | ❌ Missing | **HIGH** |
| Rate limiting | ❌ Missing | **HIGH** |
| Password reset flow | ❌ Missing | **CRITICAL** |
| Session invalidation | ❌ Missing | **MEDIUM** |
| Content Security Policy | ❌ Missing | **MEDIUM** |
| Input sanitization (beyond Zod) | ❌ Missing | **MEDIUM** |
| Exam session security (IP, UA) | ❌ Missing | **LOW** |
| Anti-cheating measures | ❌ Missing | **LOW** |
| Audit trail | ❌ Missing (broken) | **MEDIUM** |

**Security Score: 5/16 = 31%**

---

## 7. Architectural Pattern Adherence

| Planned Pattern | Adherence | Notes |
|---|---|---|
| Modular Monolith | ⚠️ Partial | Modules exist but flat structure |
| Service Layer (pure functions) | ❌ Missing | Business logic in action files |
| Repository Layer (DB abstraction) | ❌ Missing | Prisma called directly in queries |
| Feature-Sliced Design | ⚠️ Partial | Modules have actions + queries + components, but no services/repos/types/hooks/constants |
| 300-line file limit | ✅ Enforced | All files under 300 lines |
| Server Components default | ✅ Enforced | Pages are server components |
| Client Components opt-in | ✅ Enforced | Only forms/interactive parts are client |
| Error boundary pattern | ❌ Missing | No error.tsx files |
| Loading state pattern | ❌ Missing | No loading.tsx files |
| Barrel exports | ⚠️ Partial | Some index.ts files, not consistent |

**Architecture Adherence: 4/10 = 40%**

---

## 8. What Should Be Added (Stats-Driven Recommendations)

### High ROI Additions (Maximum impact per effort)

| Addition | Effort (days) | Impact | ROI |
|---|---|---|---|
| Edit dialogs for all entities | 3-4 | HIGH — Fixes fundamental CRUD gap | ★★★★★ |
| loading.tsx + error.tsx boundaries | 1 | HIGH — Professional error handling | ★★★★★ |
| Wire notification triggers | 1 | HIGH — Notification system becomes functional | ★★★★★ |
| Wire audit log triggers | 1 | HIGH — Audit system becomes functional | ★★★★★ |
| Password change/reset | 2-3 | CRITICAL — Security requirement | ★★★★★ |
| Home page redirect | 0.5 | MEDIUM — No more default Next.js page | ★★★★★ |
| Dark mode toggle | 0.5 | MEDIUM — Already have next-themes | ★★★★☆ |
| `.env.example` file | 0.1 | LOW — Developer onboarding | ★★★★☆ |
| Remove unused deps | 0.5 | LOW — Clean bundle | ★★★★☆ |
| AI grading engine | 5-7 | CRITICAL — Core feature | ★★★★☆ |
| Vitest setup + core tests | 3-4 | HIGH — Testing from 0% to 50% | ★★★☆☆ |
| GitHub Actions CI | 1 | HIGH — Automated quality gates | ★★★☆☆ |
| Tag management UI | 1-2 | MEDIUM — Question bank enhancement | ★★★☆☆ |
| Exam scheduling | 1-2 | MEDIUM — Basic exam feature | ★★★☆☆ |
| Anti-cheating (tab detection) | 1-2 | HIGH — Exam credibility | ★★★☆☆ |

### Estimated Effort to 80% Completion
| Area | Current | Target | Est. Days |
|---|---|---|---|
| Missing CRUD operations | 37% | 80% | 8-10 |
| AI grading system | 0% | 80% | 7-10 |
| Password management | 0% | 100% | 2-3 |
| Notification wiring | 15% | 80% | 2-3 |
| Audit log wiring | 10% | 80% | 1-2 |
| Testing setup + core tests | 0% | 50% | 5-7 |
| CI/CD pipeline | 0% | 80% | 2-3 |
| UI polish (loading, errors, dark mode) | 10% | 80% | 3-5 |
| Missing pages | 43% | 80% | 5-7 |
| **TOTAL** | **~38%** | **~80%** | **~35-50 days** |

---

## 9. Portfolio Impression Score

Evaluating how this project would appear to a hiring manager or technical reviewer:

| Dimension | Score (1-10) | Notes |
|---|---|---|
| **Problem Definition** | 9/10 | Clear, well-scoped, real-world problem |
| **Planning Documentation** | 9/10 | 12 comprehensive docs covering every aspect |
| **Architecture Design** | 8/10 | Sound architecture decisions |
| **Schema Design** | 9/10 | Complete, normalized, well-indexed |
| **Authentication** | 7/10 | Works but missing password management |
| **Core Feature (AI Grading)** | 1/10 | ❌ Completely missing — the differentiator |
| **CRUD Completeness** | 4/10 | Can create but can't edit most things |
| **UI/UX Quality** | 6/10 | Clean and functional but lacks polish |
| **Error Handling** | 5/10 | Error classes exist, but no error boundaries |
| **Testing** | 0/10 | Zero tests |
| **DevOps** | 0/10 | Zero infrastructure |
| **Code Quality** | 7/10 | Clean, typed, modular — but untested |
| **Documentation** | 8/10 | Planning docs excellent, code docs minimal |

**Overall Portfolio Score: 5.6/10**

### To reach 8/10:
1. Implement AI grading (→ +2.0)
2. Add edit flows everywhere (→ +0.5)
3. Add testing + CI (→ +1.0)
4. Wire notifications + audit (→ +0.3)
5. Add loading/error states (→ +0.3)
6. Add password management (→ +0.2)

---

## 10. Risk Heat Map

```
                    HIGH LIKELIHOOD
                        ↑
    ┌───────────────────┼───────────────────┐
    │ HIGH RISK         │ CRITICAL RISK     │
    │                   │                   │
    │ - No tests →      │ - No AI grading → │
    │   bugs in prod    │   project loses   │
    │ - No CI →         │   its USP         │
    │   quality drift   │ - No pwd reset →  │
    │ - Unused deps →   │   security fail   │
    │   confusion       │ - No edit flows → │
    │                   │   usability fail   │
    │                   │                   │
LOW ├───────────────────┼───────────────────┤ HIGH
IMPACT│                 │                   │ IMPACT
    │ LOW RISK          │ MEDIUM RISK       │
    │                   │                   │
    │ - No dark mode    │ - No audit logs → │
    │ - No mobile sheet │   compliance gap  │
    │ - No keyboard     │ - No export →     │
    │   shortcuts       │   limited utility │
    │ - No breadcrumbs  │ - No tag mgmt →   │
    │                   │   question org    │
    │                   │   is limited      │
    └───────────────────┼───────────────────┘
                        ↓
                    LOW LIKELIHOOD
```
