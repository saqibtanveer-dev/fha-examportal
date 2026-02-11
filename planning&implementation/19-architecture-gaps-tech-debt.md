# ExamCore — Architecture Gaps & Technical Debt

> **Date:** February 11, 2026
> **Purpose:** Document all architectural deviations, technical debt, and patterns that need refactoring

---

## 1. Module Structure Deviation

### Planned (from 06-module-breakdown.md)
```
module-name/
├── components/          # UI components
├── actions/             # Server Actions
├── services/            # Business logic (pure)
├── repositories/        # Database access
├── schemas/             # Zod schemas
├── types/               # TypeScript types
├── hooks/               # React hooks
├── constants/           # Constants
└── utils/               # Utilities
```

### Actual
```
module-name/
├── components/          # UI components ✅
├── *-actions.ts         # Single action file (flat) ⚠️
├── *-queries.ts         # Single query file (flat) ⚠️
└── (nothing else)       # ❌ No services, repos, schemas, types, hooks
```

### Gap Analysis
| Subdirectory | Planned | Exists | Impact |
|---|---|---|---|
| `components/` | ✅ | ✅ | — |
| `actions/` (directory) | ✅ | ⚠️ (single file) | Low — works but less modular |
| `services/` | ✅ | ❌ | **HIGH** — Business logic mixed with actions |
| `repositories/` | ✅ | ❌ | **HIGH** — No DB abstraction layer |
| `schemas/` | ✅ (per module) | ⚠️ (centralized in `/validations`) | Medium — works but violates co-location |
| `types/` | ✅ (per module) | ❌ | Medium — Types scattered or inline |
| `hooks/` | ✅ | ❌ | Low — Not using custom hooks |
| `constants/` | ✅ (per module) | ⚠️ (centralized in `/lib/constants.ts`) | Low |
| `utils/` | ✅ (per module) | ❌ | Low |

### Recommendation
**Decision needed:** Either implement the full module structure as planned, OR accept the simpler flat structure and update the planning docs. The current flat structure is actually cleaner for a project this size — the planned structure has more boilerplate than benefit until the codebase grows significantly.

**Recommended approach:** Keep the flat structure but:
- Extract business logic into `service` functions (separate from action files)
- Co-locate validation schemas within modules (move from centralized `/validations`)
- Add per-module type files where types are complex

---

## 2. Service Layer Missing

### Problem
Server actions directly call Prisma:

```
Server Action → Zod Validate → Prisma Query → Return/Revalidate
```

### Should be:
```
Server Action → Zod Validate → Service Function → Repository/Prisma → Return/Revalidate
```

### Impact
- Business logic is tightly coupled to Next.js server actions
- Cannot easily test business rules without mocking the entire server action
- If migrating to a different framework, ALL business logic must be rewritten
- Complex operations (like result calculation) are in action files

### Affected Areas
| Module | Has Service Layer? | Business Logic Location |
|---|---|---|
| Auth | ❌ | Spread across actions.ts, auth.ts |
| Users | ❌ | In user-actions.ts |
| Departments | ❌ | In department-actions.ts |
| Subjects | ❌ | In subject-actions.ts |
| Classes | ❌ | In class-actions.ts |
| Questions | ❌ | In question-actions.ts |
| Exams | ❌ | In exam-actions.ts |
| Sessions | ❌ | In session-actions.ts |
| Grading | ⚠️ Partial | `grading-engine.ts` is like a service file |
| Results | ❌ | In result-queries.ts |

---

## 3. Installed but Unused Dependencies

### Dead Code in Bundle
| Package | Installed Version | Used? | Removal Impact |
|---|---|---|---|
| `@tanstack/react-query` | * | ❌ | Provider in `providers.tsx` wraps app — remove Provider + package |
| `@tanstack/react-table` | * | ❌ | Not imported anywhere — safe to remove |
| `zustand` | * | ❌ | Not imported anywhere — safe to remove |
| `nuqs` | * | ❌ | Not imported anywhere — safe to remove |
| `react-hook-form` | * | ❌ | Not imported anywhere — safe to remove |
| `@hookform/resolvers` | * | ❌ | Not imported anywhere — safe to remove |
| `next-themes` | * | ❌ | Not imported in any component — safe to remove OR wire up |
| `uuid` | * | ❓ | Need to check usage — Prisma handles UUIDs |

### Recommendation
Either:
1. **Remove** all unused deps → cleaner bundle, honest dependencies
2. **Use them** as planned → re-adopt react-hook-form for forms, zustand for exam state, etc.

**Recommended:** Use and wire them up properly. They were chosen for good reasons:
- `@tanstack/react-query` — Use for client-side data fetching in interactive components
- `zustand` — Use for exam session state (timer, answer buffer)
- `react-hook-form` — Use for complex forms (question editor, exam builder)
- `nuqs` — Use for URL state management (filters, pagination)
- `next-themes` — Use for dark mode

---

## 4. Duplicate Utility Functions

### `cn()` Defined Twice
| Location | Lines |
|---|---|
| `src/lib/utils.ts` | `cn(...inputs: ClassValue[])` |
| `src/utils/cn.ts` | `cn(...inputs: ClassValue[])` |

Both are identical. shadcn components import from `@/lib/utils`, custom code imports from `@/utils/cn`.

### Fix
Choose ONE location. Recommend keeping in `src/lib/utils.ts` (shadcn convention) and removing `src/utils/cn.ts`. Update all imports.

---

## 5. Missing Error Boundaries & Loading States

### Current State
Every route that fetches data can:
- Throw an unhandled error (shows default Next.js error page)
- Take time to load (shows nothing — blank flash)

### What Should Exist
```
Every route group should have:
├── loading.tsx     # Skeleton/spinner while data loads
├── error.tsx       # Error display with retry button
└── not-found.tsx   # 404 for dynamic routes
```

### Routes Missing Boundaries
| Route | loading.tsx | error.tsx | not-found.tsx |
|---|---|---|---|
| `/admin/dashboard` | ❌ | ❌ | — |
| `/admin/users` | ❌ | ❌ | ❌ |
| `/admin/departments` | ❌ | ❌ | — |
| `/admin/subjects` | ❌ | ❌ | — |
| `/admin/classes` | ❌ | ❌ | — |
| `/admin/settings` | ❌ | ❌ | — |
| `/admin/audit-log` | ❌ | ❌ | — |
| `/teacher/dashboard` | ❌ | ❌ | — |
| `/teacher/questions` | ❌ | ❌ | — |
| `/teacher/exams` | ❌ | ❌ | — |
| `/teacher/grading` | ❌ | ❌ | — |
| `/teacher/grading/[sessionId]` | ❌ | ❌ | ❌ |
| `/teacher/results` | ❌ | ❌ | — |
| `/teacher/results/[examId]` | ❌ | ❌ | ❌ |
| `/student/dashboard` | ❌ | ❌ | — |
| `/student/exams` | ❌ | ❌ | — |
| `/student/exams/[sessionId]` | ❌ | ❌ | ❌ |
| `/student/results` | ❌ | ❌ | — |

---

## 6. Validation Schema Location

### Current: Centralized
```
src/validations/
├── user-schemas.ts
├── organization-schemas.ts
├── question-schemas.ts
├── exam-schemas.ts
├── session-schemas.ts
└── index.ts
```

### Planned: Co-located per module
```
src/modules/users/schemas/user.schema.ts
src/modules/questions/schemas/question.schema.ts
src/modules/exams/schemas/exam.schema.ts
```

### Impact
- Centralized works fine for this project size
- Co-located is more modular but adds directory depth
- **Recommendation:** Keep centralized but consider co-location if modules grow

---

## 7. API Layer Missing

### Planned: Full REST API
```
/api/v1/users          GET, POST
/api/v1/users/[id]     GET, PUT, DELETE
/api/v1/questions       GET, POST
/api/v1/exams           GET, POST
/api/v1/results         GET
/api/v1/analytics       GET
/api/v1/notifications   GET
...  (20+ endpoints)
```

### Actual: Only auth route
```
/api/auth/[...nextauth]   # NextAuth handler only
```

### Impact
- No programmatic access to ExamCore data
- No webhook/integration capability
- No external tool connectivity
- Mobile app can't be built against this backend

### Recommendation
Build a minimal REST API for:
1. Health check (`/api/health`)
2. Student exam auto-save (`/api/v1/exams/[id]/auto-save`)
3. Notification count (`/api/v1/notifications/unread-count`)
4. Analytics dashboard data (`/api/v1/analytics/dashboard`)

Server Actions are fine for all CRUD operations called from the UI.

---

## 8. State Management Inconsistency

### Planned State architecture
```
Server State  → TanStack Query (caching, refetch, optimistic)
Client State  → Zustand (UI state, exam timer)
Form State    → React Hook Form (validation, performance)
URL State     → nuqs (filters, pagination)
```

### Actual State architecture
```
Server State  → Server Components + server actions (no caching)
Client State  → React useState (ad-hoc, per component)
Form State    → Native HTML forms + useTransition
URL State     → Manual searchParams parsing
```

### Impact
- No client-side caching (every navigation re-fetches)
- No optimistic updates (mutations wait for round-trip)
- No debounced search (instant re-render on every keystroke)
- Forms re-render entire component on every change
- URL state not type-safe

### Recommendation
The current approach (Server Components + server actions) is actually valid and simpler. But integrate the planned libraries where they genuinely help:
- **Zustand:** Exam session state (timer, answer buffer, navigation)
- **nuqs:** Filter/sort/pagination URL state (type-safe)
- **TanStack Query:** ONLY for client components that need real-time polling (notifications, exam monitor)
- **React Hook Form:** Complex forms (question editor with dynamic MCQ options)

---

## 9. Missing Shared Components

### Planned (09-frontend-architecture.md)
| Component | Planned | Built |
|---|---|---|
| `DataTable` (generic TanStack Table) | ✅ | ❌ (each module builds own table) |
| `DataTableToolbar` | ✅ | ❌ |
| `DataTablePagination` | ✅ | ❌ |
| `DataTableColumnHeader` | ✅ | ❌ |
| `TextField` (form field) | ✅ | ❌ |
| `SelectField` (form field) | ✅ | ❌ |
| `TextareaField` (form field) | ✅ | ❌ |
| `CheckboxField` (form field) | ✅ | ❌ |
| `DatePickerField` (form field) | ✅ | ❌ |
| `FileUploadField` (form field) | ✅ | ❌ |
| `SearchInput` (debounced) | ✅ | ❌ |
| `RoleBadge` | ✅ | ❌ (inline bad rendering) |
| `Breadcrumbs` | ✅ | ❌ |
| `MobileSidebar` (Sheet) | ✅ | ❌ |
| `PageHeader` | ✅ | ✅ |
| `EmptyState` | ✅ | ✅ |
| `LoadingSpinner` | ✅ | ✅ (Spinner + PageLoader) |
| `ConfirmDialog` | ✅ | ✅ |
| `StatusBadge` | ✅ | ✅ |

**Built: 5/19 = 26%**

### Impact
- Code duplication across modules (each module has its own table + form)
- Inconsistent UX (different table styles, different empty states)
- More effort when changing shared patterns (must update many files)

### Priority Recommendation
1. **DataTable** (generic) — HIGH priority, used by 6+ modules
2. **SearchInput** — HIGH priority, used on every list page
3. **Breadcrumbs** — MEDIUM priority, improves navigation
4. **MobileSidebar** — MEDIUM priority, mobile usability
5. **FormField components** — LOW priority if keeping native forms

---

## 10. Missing Global Config Files

| File | Exists? | Purpose |
|---|---|---|
| `.env.example` | ❌ | Developer onboarding — document all env vars |
| `docker-compose.yml` | ❌ | Local dev — PostgreSQL + Redis |
| `vitest.config.ts` | ❌ | Unit/integration testing |
| `playwright.config.ts` | ❌ | E2E testing |
| `.husky/pre-commit` | ❌ | Git hook for pre-commit lint |
| `lint-staged.config.js` | ❌ | Pre-commit lint-staged config |
| `commitlint.config.js` | ❌ | Conventional commit enforcement |
| `vercel.json` | ❌ | Vercel deployment config (region, crons) |
| `.github/workflows/ci.yml` | ❌ | CI pipeline |
| `.github/PULL_REQUEST_TEMPLATE.md` | ❌ | PR template |
| `CONTRIBUTING.md` | ❌ | Contribution guidelines |

---

## Total Technical Debt Score

| Area | Debt Level | Effort to Fix |
|---|---|---|
| No service layer | Medium | 5-7 days (refactor as you go) |
| No repository layer | Medium | 3-5 days (refactor as you go) |
| Unused dependencies | Low | 0.5 day |
| Duplicate utilities | Low | 0.5 hour |
| No error boundaries | Medium | 1 day |
| No loading states | Medium | 1 day |
| No shared DataTable | Medium | 2 days |
| No API layer | Low-Medium | 3-5 days |
| State management inconsistency | Low | 2-3 days (adopt where valuable) |
| Missing config files | Low | 1 day |
| **TOTAL** | — | **~20-30 days** |

> **Note:** Much of this debt can be addressed incrementally (refactor as you build new features) rather than as a big-bang refactor.
