# ExamCore — Brutal Performance & State Management CT Scan + Implementation Plan

**Date**: February 21, 2026  
**Scope**: Full project CT scan — state management, caching, performance, scalability, horizontal scaling, data reload problem  
**Project Stats**: 26,453 lines / 302 files / 565-line Prisma schema / 16 modules

---

## PART 1: DIAGNOSIS — The Brutal Truth

### 1.1 The Core Problem: Zero Client-Side Caching

This project has a **100% server-rendered, zero-client-cache architecture**. Every sidebar navigation triggers:

```
User clicks sidebar link
  → Next.js router navigates (full route change)
  → loading.tsx shows skeleton
  → page.tsx (Server Component) re-runs ALL Prisma queries from scratch
  → serialize() deep-clones entire result via JSON.parse(JSON.stringify())
  → Client component renders with fresh props
  → Previous page's data is GARBAGE COLLECTED (was just props)
```

**Concrete example** — the user's exact problem:

| Step | What Happens | DB Queries | Wasted? |
|------|--------------|:---:|:---:|
| User on `/teacher/questions` | 8 Prisma queries fire | 8 | — |
| User clicks "Exams" tab | Questions page unmounts, ALL data gone. Exams page fires 10 queries | 10 | — |
| User clicks "Question Bank" back | Exams page unmounts, ALL data gone. **Same 8 queries fire again** | 8 | **100%** |
| **Total** | 3 navigations | **26** | ~8 fully duplicate |

### 1.2 Dead Weight — Installed But Never Used

| Package | Version | Status | What It Could Do |
|---------|---------|--------|-----------------|
| `@tanstack/react-query` | 5.90.20 | **Provider configured, 0 useQuery calls** | Client cache with 5min staleTime (already configured!) |
| `zustand` | 5.0.11 | **0 imports anywhere** | Global UI state, filter persistence, cross-page data sharing |
| `nuqs` | 2.8.8 | **0 imports anywhere** | Type-safe URL state for filters/pagination (replaces manual URLSearchParams) |
| `react-hook-form` | 7.x | **0 useForm calls** | Form state, validation (replaces raw `<form action>`) |

**We have $350K worth of state management infrastructure collecting dust.** `QueryClientProvider` wraps the entire app with perfect defaults. `queryKeys` factory covers all 16 modules. `useInvalidateCache()` has granular invalidation. None of it is connected.

### 1.3 The Double-Invalidation Anti-Pattern

Every mutation in the codebase does BOTH:
1. Server action calls `revalidatePath('/teacher/exams')` → marks server cache stale
2. Client component calls `router.refresh()` → immediately re-fetches entire RSC tree

These are redundant. `router.refresh()` already forces a server re-render. The `revalidatePath` is wasted if `router.refresh()` follows immediately.

**Affected files**: 27+ client components, 23+ server action files, 50+ total occurrences

### 1.4 Database Query Explosion

#### Per-Page Query Count

| Page | DB Queries | Notes |
|------|:---:|-------|
| Teacher Dashboard | 3-5 | Lightweight |
| Teacher Questions | **8** | subjects, tags, teacher profile all re-fetched |
| Teacher Exams | **10** | 200 questions loaded for picker (with full includes!) |
| Teacher Grading | 3 | But session query is unbounded |
| Teacher Grading [session] | **3** | Single query decomposes to ~8 SQL queries (3-level nested includes) |
| Teacher Results [exam] | **7** | Analytics loads ALL results for computation |
| Principal Dashboard | **17** | 10 count queries + trends + distribution |
| Principal Analytics | **8** | But loads ENTIRE tables into memory for computation |

#### Data Overlap — Same Queries Re-run Across Pages

| Data | Teacher Questions | Teacher Exams | Teacher Grading | Fetched Fresh Each Time? |
|------|:---:|:---:|:---:|:---:|
| `requireRole()` / auth | ✅ | ✅ | ✅ | YES — every navigation |
| `getTeacherProfileId()` | ✅ | ✅ | ❌ | YES — 2x per Q→E navigation |
| `getSubjectsForTeacher()` | ✅ | ✅ | ❌ | YES — identical data, re-fetched |
| `listSubjects()` (fallback) | ✅ | ✅ | ❌ | YES — identical data, re-fetched |
| `getUnreadCount()` (layout) | ✅ | ✅ | ✅ | YES — every navigation |
| `listQuestions(page:1-20)` | ✅ | ❌ | ❌ | — |
| `listQuestions(pageSize:200)` | ❌ | ✅ | ❌ | 200 questions for the picker |

#### Killer Queries (Will Crash at Scale)

| Query | File | Problem | Impact at 10K Students |
|-------|------|---------|----------------------|
| `getPerformanceTrends` | principal-queries.ts | Loads **ENTIRE ExamResult table** into Node.js, groups by month in JS | 50K+ rows loaded into memory |
| `getTopPerformingStudents` | principal-queries.ts | Loads ALL students + ALL results, sorts in JS | 10K students × N results each |
| `getBottomPerformingStudents` | principal-queries.ts | **IDENTICAL query** to top students, just sorted ascending | Runs the same massive query TWICE |
| `getTeacherWiseAnalytics` | principal-queries.ts | ALL teachers + ALL exams + ALL results nested | 50 teachers × 20 exams × 100 results |
| `getClassWiseAnalytics` | principal-queries.ts | ALL classes + ALL exam assignments + ALL results | Memory bomb at scale |
| `getResultsByStudent` | result-queries.ts | Loads ALL results then **filters in JavaScript** | Could load 500 results to show 10 |
| `fetchDetailedResult` | result-queries.ts | 4-level Prisma include = **8+ SQL round-trips** | Slow regardless of scale |
| `getSessionsForGrading` | session-queries.ts | **NO pagination** — loads ALL submitted sessions | Grows linearly forever |
| `listQuestions(pageSize:200)` | Exams page.tsx | 200 questions with full includes for picker | Loaded on EVERY Exams page visit |

### 1.5 Zero Server-Side Caching

| Caching Layer | Status |
|---------------|--------|
| Next.js Route Cache | Not used (`force-dynamic` was removed but cookies still force dynamic) |
| `unstable_cache` / `'use cache'` | **0 usages** |
| Redis / Upstash | **Not installed** (planning docs mention it, never implemented) |
| In-memory cache | **None** |
| React Query client cache | **Configured but unused** |
| HTTP Cache-Control headers | **Not set anywhere** |

### 1.6 Serialization Tax

Every piece of data goes through `JSON.parse(JSON.stringify(data, replacer))`:
- **Deep clones** the entire Prisma result including unused fields
- **Double traversal** — stringify walks the tree, parse walks the result
- On Exams page: 200 questions × full includes = massive serialize overhead
- No field stripping — `include: true` columns survive to the client bundle

### 1.7 Missing Performance Infrastructure

| Feature | Status |
|---------|--------|
| Prisma connection pooling (explicit) | Default only |
| Error boundaries on dynamic routes | Missing |
| Optimistic updates | Zero |
| Pagination on grading sessions | Missing |
| Pagination on student exam list | Missing |
| `select` instead of `include: true` | Inconsistent — some queries are efficient, others load everything |
| DB indexes beyond primary keys | Not audited |
| API rate limiting (production) | In-memory only (won't work with multiple instances) |

---

## PART 2: THE PLAN — Phased Implementation

### Philosophy

We WON'T do a big-bang rewrite. We'll implement in **4 phases**, each independently deployable and testable:

1. **Phase 1**: Zustand global stores for shared/reference data → eliminates redundant fetches
2. **Phase 2**: React Query for page-level data → eliminates reload-on-navigate
3. **Phase 3**: Server-side caching + query optimization → reduces DB load
4. **Phase 4**: Horizontal scaling preparation → production hardening

---

### PHASE 1: Zustand Global State Management
**Goal**: Eliminate duplicate data fetches for reference data that rarely changes  
**Effort**: 3-4 days  
**Impact**: Removes ~40% of redundant DB queries

#### What Goes in Zustand

Zustand is for **synchronous, globally-shared, rarely-changing data** that multiple pages need. NOT for page-specific lists.

| Store | Data | Set When | Used Where | Replaces |
|-------|------|----------|------------|----------|
| `useAuthStore` | Current user role, userId, teacher/student profileId | Login / layout hydration | All pages via layout | `requireRole()` result re-parsing |
| `useReferenceStore` | Subjects list, classes list, academic sessions, teacher's subjects | Dashboard layout initial load | Exams page (dropdowns), Questions page (filters), Create dialogs | 5+ repeated queries per navigation |
| `useUIStore` | Sidebar collapsed, current filters (per-page), last visited pages | User interaction | Layout, all pages | Manual URLSearchParams, sidebar state loss |

#### Store Architecture

```
src/stores/
  auth-store.ts          — user session, role, profileId
  reference-store.ts     — subjects, classes, academic sessions (reference data)
  ui-store.ts            — sidebar, theme, active filters per page
  index.ts               — barrel export
```

#### How Reference Store Works

```
1. Teacher dashboard layout.tsx (Server Component)
   → Fetches: subjects, classes, academic sessions, teacher profile
   → Passes as props to <TeacherShell>

2. <TeacherShell> (Client Component — already exists)
   → Calls useReferenceStore.getState().hydrate({ subjects, classes, ... })
   → Only hydrates if data is not already loaded (check timestamp)

3. Questions page, Exams page, Create dialogs
   → Read from useReferenceStore instead of receiving as props
   → No duplicate DB queries for subjects/classes/sessions

4. When user creates a new subject (admin)
   → Mutation invalidates reference store: useReferenceStore.getState().invalidate('subjects')
   → Next page access fetches fresh data
```

#### Filter Persistence

```
useUIStore = {
  filters: {
    '/teacher/questions': { search: '', subject: '', difficulty: '', page: 1 },
    '/teacher/exams': { search: '', status: '', page: 1 },
  },
  setFilter: (path, key, value) => ...,
  getFilters: (path) => ...,
}
```

When user navigates Questions → Exams → back to Questions, their search text and filters are preserved.

#### Implementation Steps

1. Create `src/stores/reference-store.ts` with Zustand
2. Create `src/stores/auth-store.ts` — extract user info from session
3. Create `src/stores/ui-store.ts` — filter persistence per page path
4. Modify `teacher-shell.tsx` to hydrate reference store on mount (one-time, from layout server data)
5. Modify `principal-shell.tsx`, `admin-shell.tsx`, `student-shell.tsx` similarly
6. Remove duplicate subject/class/session queries from individual page.tsx files
7. Modify Create/Edit dialogs to read reference data from Zustand instead of props

---

### PHASE 2: React Query for Page-Level Data
**Goal**: Eliminate data reload on tab navigation (the user's main complaint)  
**Effort**: 5-7 days  
**Impact**: Zero re-fetch on back-navigation. Stale-while-revalidate on revisit.

#### Strategy: Hybrid Server Prefetch + Client Cache

We keep the server component for **initial SSR** but move the data into React Query's cache so it survives navigation.

**Pattern: `initialData` hydration**

```
1. Server page.tsx fetches data via Prisma (same as now)
2. Server passes serialized data as props to Client Component
3. Client Component calls useQuery with initialData from props
4. React Query caches the data with 5min staleTime (already configured!)
5. User navigates away — data stays in QueryClient (30min gcTime)
6. User navigates back — useQuery returns CACHED data instantly
7. If staleTime expired, React Query refetches silently in background
```

**No API routes needed.** We create thin wrapper hooks that call server actions for fresh data:

#### Hook Architecture

```
src/modules/exams/hooks/
  use-exams-query.ts       — wraps listExams with React Query
  use-exam-detail-query.ts — wraps getExamById

src/modules/questions/hooks/
  use-questions-query.ts   — wraps listQuestions
  use-question-picker.ts   — wraps getQuestionsForPicker (for exam builder)

src/modules/grading/hooks/
  use-grading-sessions.ts  — wraps getSessionsForGrading
  use-grading-session.ts   — wraps getSessionById

src/modules/results/hooks/
  use-results-query.ts     — wraps getResultsByExam
```

#### How a Hook Works

```typescript
// src/modules/exams/hooks/use-exams-query.ts
export function useExamsQuery(
  filters: ExamListFilters,
  initialData?: PaginatedResult<SerializedExam>,
) {
  return useQuery({
    queryKey: queryKeys.exams.list(filters),
    queryFn: () => fetchExamsAction(filters),   // New server action that returns data
    initialData,                                 // From server component (SSR)
    staleTime: 5 * 60 * 1000,                   // 5 min
  });
}
```

#### Mutation Pattern — Replace router.refresh()

```typescript
// Instead of:
const result = await createExamAction(input);
if (result.success) router.refresh();  // ← full page re-render

// Do:
const invalidate = useInvalidateCache();
const result = await createExamAction(input);
if (result.success) await invalidate.afterExamCreate();  // ← surgical cache invalidation
```

This replaces `router.refresh()` with targeted React Query cache invalidation. Only the affected queries refetch — not the entire page.

#### Data Fetching Actions (New Server Actions for Client Queries)

```
src/modules/exams/exam-fetch-actions.ts
  → fetchExamsAction(filters)    — returns serialized exam list
  → fetchExamDetailAction(id)    — returns serialized exam

src/modules/questions/question-fetch-actions.ts
  → fetchQuestionsAction(filters) — returns serialized question list

src/modules/grading/grading-fetch-actions.ts
  → fetchGradingSessionsAction() — returns serialized sessions
```

These are thin `'use server'` functions that call existing query functions + serialize(). They exist because `useQuery({ queryFn })` needs a function that returns data, and we can't call Prisma directly from client components.

#### Implementation Steps

1. Create fetch-action files for each module (thin wrappers)
2. Create React Query hook files per module
3. Modify page.tsx to pass `initialData` prop
4. Modify client components to use `useQuery` with `initialData`
5. Replace `router.refresh()` with `useInvalidateCache()` calls in mutation handlers
6. Remove `revalidatePath()` from server actions (no longer needed when React Query handles cache)
7. Test: navigate away and back → no loading skeleton, instant render

---

### PHASE 3: Server-Side Query Optimization
**Goal**: Reduce DB load by 60-80%, fix queries that will crash at scale  
**Effort**: 4-5 days  
**Impact**: Handles 10x more concurrent users

#### 3.1 Fix Killer Queries with SQL Aggregation

**`getPerformanceTrends`** — Currently loads ENTIRE ExamResult table into Node.js

```sql
-- Replace with:
SELECT DATE_TRUNC('month', "createdAt") as month,
       AVG("percentage") as avgPercentage,
       COUNT(*) as count
FROM "ExamResult"
WHERE "createdAt" >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;
```

**`getTopPerformingStudents` + `getBottomPerformingStudents`** — Two identical queries loading ALL students

```sql
-- Replace with single query:
SELECT u."id", u."firstName", u."lastName",
       AVG(er."percentage") as avgPercentage,
       COUNT(er."id") as examCount
FROM "User" u
JOIN "ExamResult" er ON er."studentId" = u."id"
GROUP BY u."id", u."firstName", u."lastName"
ORDER BY avgPercentage DESC
LIMIT 10;
-- For bottom: ORDER BY avgPercentage ASC LIMIT 10;
```

**`getTeacherWiseAnalytics`** — Loads ALL nested relations

```sql
-- Replace with:
SELECT u."id", u."firstName", u."lastName",
       COUNT(DISTINCT e."id") as examCount,
       COUNT(DISTINCT er."id") as resultCount,
       AVG(er."percentage") as avgPercentage
FROM "User" u
JOIN "Exam" e ON e."createdById" = u."id"
LEFT JOIN "ExamResult" er ON er."examId" = e."id"
WHERE u."role" = 'TEACHER'
GROUP BY u."id", u."firstName", u."lastName";
```

Apply same pattern to: `getClassWiseAnalytics`, `getSubjectWiseAnalytics`

#### 3.2 Fix Over-Fetching with Proper `select`

| Query | Current | Fix |
|-------|---------|-----|
| `listExams` → `examQuestions → question` | `include: { question: true }` (ALL columns) | `select: { id, title, type, marks }` |
| `listQuestions` → `mcqOptions` | `include: true` (ALL columns) | `select: { id, text, sortOrder }` (strip `isCorrect` for client!) |
| `listQuestions(pageSize:200)` on Exams page | Loads 200 questions with ALL includes | Create `getQuestionsForPicker` with minimal `select` (already exists, use it!) |
| `getSessionById` | 3-level `include: true` everywhere | Use `select` at each level |
| `fetchDetailedResult` | 4-level `include: true` | Split into 2 parallel queries + combine |
| `getSubjectById` | `department: true, user: true` = all columns | Use `select` |

#### 3.3 Add Pagination Where Missing

| Query | Current | Fix |
|-------|---------|-----|
| `getSessionsForGrading` | No limit — loads ALL submitted sessions | Add `PaginationParams` + cursor-based pagination |
| `getExamsForStudent` | No limit — loads ALL published exams | Add pagination |
| `getResultsByExam` | No limit | Add pagination |
| `getResultsByStudent` | Loads ALL then filters in JS | Move filter to Prisma `where` clause + paginate |
| `listSubjects` | No limit | OK for now (subjects are few), but add `take: 100` safety limit |

#### 3.4 Next.js Server-Side Cache

Use Next.js `unstable_cache` (or `'use cache'` in Next 16) for data that changes infrequently:

```typescript
// Subjects, classes, academic sessions — change once per term
const getCachedSubjects = unstable_cache(
  () => listSubjectsFromDB(),
  ['subjects-list'],
  { revalidate: 300, tags: ['subjects'] }  // 5 min cache
);

// Principal dashboard stats — change slowly
const getCachedDashboardStats = unstable_cache(
  () => getPrincipalDashboardStats(),
  ['principal-dashboard-stats'],
  { revalidate: 60, tags: ['dashboard-stats'] }  // 1 min cache
);
```

Invalidate with `revalidateTag('subjects')` in mutation server actions.

#### Implementation Steps

1. Rewrite `principal-queries.ts` killer queries using `prisma.$queryRaw`
2. Add `select` clauses to `listExams`, `listQuestions`, `getSessionById`, `fetchDetailedResult`
3. Replace `listQuestions(pageSize:200)` on Exams page with `getQuestionsForPicker`
4. Add pagination to `getSessionsForGrading`, `getExamsForStudent`, `getResultsByExam`, `getResultsByStudent`
5. Move `getResultsByStudent` JS filter logic into Prisma `where`
6. Wrap reference data queries with `unstable_cache` + 5min revalidation
7. Wrap analytics queries with `unstable_cache` + 1min revalidation

---

### PHASE 4: Horizontal Scaling & Production Hardening
**Goal**: Support multiple server instances, 100+ concurrent users  
**Effort**: 3-4 days  
**Impact**: Production readiness

#### 4.1 Rate Limiting → Redis-backed

Current rate limiter is in-memory (`Map<string, ...>`). With 2+ server instances, each has its own map = no real rate limiting.

```
Install: @upstash/ratelimit + @upstash/redis
Replace: src/lib/rate-limit.ts with Redis-backed limiter
```

#### 4.2 Prisma Connection Pooling

```
// For serverless/edge:
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=10"

// Or use PgBouncer:
DIRECT_URL="postgresql://..." (for migrations)
DATABASE_URL="postgresql://...pgbouncer:6432/..." (for queries)
```

Configure in `prisma.config.ts` or `schema.prisma`.

#### 4.3 Session Storage

NextAuth currently uses database sessions. For horizontal scaling:
- Switch to JWT strategy (stateless) OR
- Ensure database session table is indexed properly
- Add session cleanup cron (delete expired sessions)

#### 4.4 Error Boundaries

Add error.tsx files to catch runtime errors gracefully:

```
src/app/(dashboard)/teacher/exams/error.tsx
src/app/(dashboard)/teacher/grading/error.tsx
src/app/(dashboard)/teacher/grading/[sessionId]/error.tsx
src/app/(dashboard)/teacher/results/[examId]/error.tsx
src/app/(dashboard)/principal/analytics/error.tsx
```

Priority: any route with heavy queries or user-generated data (grading, analytics).

#### 4.5 Optimistic Updates

For actions where the outcome is predictable:

| Action | Optimistic Behavior |
|--------|-------------------|
| Delete exam | Remove card from grid instantly, revert if server fails |
| Publish exam | Update badge to "PUBLISHED" instantly |
| Grade answer | Update marks display instantly |
| Mark notification read | Remove from unread count instantly |

React Query's `onMutate` + `onError` rollback makes this straightforward.

#### 4.6 Bundle Optimization

- Audit `@/components/ui/*` imports — many shadcn components may be tree-shaken already by Turbopack but verify
- Lazy-load heavy components: `EditExamDialog`, `CreateExamDialog`, `GradingInterface`, `ExamDetailedAnalytics` (all contain large dependency subgraphs)
- Recharts is ~200KB — ensure it's only loaded on analytics/results pages

#### Implementation Steps

1. Install `@upstash/ratelimit` + `@upstash/redis`, replace in-memory rate limiter
2. Configure Prisma connection pool parameters
3. Add `error.tsx` files to all dynamic routes
4. Implement optimistic updates for delete/publish/grade actions
5. Add `React.lazy()` + `Suspense` for heavy dialogs
6. Audit and optimize bundle with `next build --analyze`

---

## PART 3: PRIORITY ORDER & EXPECTED OUTCOMES

### Implementation Priority

| Priority | Phase | Estimated Impact | Effort |
|:---:|-------|-----------------|--------|
| **P0** | Phase 1: Zustand stores | Eliminates 40% duplicate queries, filter persistence | 3-4 days |
| **P0** | Phase 2: React Query hooks (teacher pages first) | **Fixes the main user complaint** — no reload on tab switch | 5-7 days |
| **P1** | Phase 3.1-3.2: Fix killer queries + add select | Prevents crashes at scale, 60% DB load reduction | 3-4 days |
| **P1** | Phase 3.3: Add pagination | Prevents unbounded growth | 1-2 days |
| **P2** | Phase 3.4: Server-side cache | Further reduces DB load | 1-2 days |
| **P2** | Phase 4.1-4.3: Redis, connection pooling, sessions | Horizontal scaling readiness | 2-3 days |
| **P3** | Phase 4.4-4.6: Error boundaries, optimistic updates, bundle | Polish & production hardening | 2-3 days |

### Expected Metrics After Full Implementation

| Metric | Current | After Phase 1+2 | After Phase 3+4 |
|--------|---------|:---:|:---:|
| DB queries per Questions→Exams→Questions nav | **26** | **10** (first load only, then cached) | **6** (with server cache + select optimization) |
| Data reload on back-navigation | **100% reload** (8 queries) | **0 queries** (React Query cache hit) | Same |
| Principal Dashboard DB queries | **17** | 17 (server page, not React Query initially) | **5** (raw SQL aggregation + server cache) |
| Principal Analytics memory usage | **Loads entire DB tables** | Same (Phase 2 doesn't fix server queries) | **< 1MB** (SQL aggregation, no client-side computation) |
| Time-to-interactive on revisit | **2-4 seconds** (full skeleton → render) | **0ms** (instant from cache) | Same |
| Concurrent user capacity | ~20-30 (limited by DB connections) | ~50 (fewer queries per user) | **200+** (connection pooling + Redis + optimized queries) |

---

## PART 4: FILES TO BE MODIFIED (Full Map)

### New Files

| File | Purpose |
|------|---------|
| `src/stores/reference-store.ts` | Zustand — subjects, classes, sessions |
| `src/stores/auth-store.ts` | Zustand — user role, profileId |
| `src/stores/ui-store.ts` | Zustand — filters, sidebar state |
| `src/stores/index.ts` | Barrel export |
| `src/modules/exams/hooks/use-exams-query.ts` | React Query hook |
| `src/modules/exams/hooks/use-exam-detail-query.ts` | React Query hook |
| `src/modules/exams/exam-fetch-actions.ts` | Server action returning data |
| `src/modules/questions/hooks/use-questions-query.ts` | React Query hook |
| `src/modules/questions/question-fetch-actions.ts` | Server action returning data |
| `src/modules/grading/hooks/use-grading-sessions.ts` | React Query hook |
| `src/modules/grading/grading-fetch-actions.ts` | Server action returning data |
| `src/modules/results/hooks/use-results-query.ts` | React Query hook |
| `src/modules/results/result-fetch-actions.ts` | Server action returning data |
| `src/app/(dashboard)/teacher/exams/error.tsx` | Error boundary |
| `src/app/(dashboard)/teacher/grading/[sessionId]/error.tsx` | Error boundary |
| `src/app/(dashboard)/principal/analytics/error.tsx` | Error boundary |

### Modified Files

| File | Change |
|------|--------|
| `src/app/(dashboard)/teacher/teacher-shell.tsx` | Hydrate Zustand reference store |
| `src/app/(dashboard)/principal/principal-shell.tsx` | Hydrate Zustand reference store |
| `src/app/(dashboard)/admin/admin-shell.tsx` | Hydrate Zustand reference store |
| `src/app/(dashboard)/student/student-shell.tsx` | Hydrate Zustand reference store |
| `src/app/(dashboard)/teacher/exams/page.tsx` | Remove duplicate subject/class queries, pass initialData |
| `src/app/(dashboard)/teacher/exams/exams-page-client.tsx` | Use `useExamsQuery` + Zustand for reference data |
| `src/app/(dashboard)/teacher/questions/page.tsx` | Remove duplicate queries, pass initialData |
| `src/app/(dashboard)/teacher/questions/questions-page-client.tsx` | Use `useQuestionsQuery` + Zustand |
| `src/app/(dashboard)/teacher/grading/page.tsx` | Pass initialData |
| `src/app/(dashboard)/teacher/grading/grading-page-client.tsx` | Use `useGradingSessionsQuery` |
| `src/modules/exams/components/exam-grid.tsx` | Replace `router.refresh()` with `useInvalidateCache()` |
| `src/modules/exams/components/create-exam-dialog.tsx` | Read subjects/classes from Zustand, replace `router.refresh()` |
| `src/modules/exams/components/edit-exam-dialog.tsx` | Replace `router.refresh()` |
| `src/modules/exams/components/exam-question-manager.tsx` | Replace `router.refresh()` |
| `src/modules/questions/components/question-table.tsx` | Replace `router.refresh()` |
| `src/modules/questions/components/create-question-dialog.tsx` | Read subjects from Zustand, replace `router.refresh()` |
| `src/modules/questions/components/edit-question-dialog.tsx` | Replace `router.refresh()` |
| `src/modules/grading/components/grading-page-client.tsx` | Replace `router.refresh()` |
| `src/modules/grading/components/grading-interface.tsx` | Replace `router.refresh()` |
| All other `router.refresh()` files | Replace with `useInvalidateCache()` calls |
| `src/modules/principal/principal-queries.ts` (1,132 lines) | Rewrite killer queries to raw SQL |
| `src/modules/results/result-queries.ts` (694 lines) | Fix `getResultsByStudent` filter, optimize `fetchDetailedResult` |
| `src/modules/exams/exam-queries.ts` | Add `select` to `listExams` includes |
| `src/modules/questions/question-queries.ts` | Add `select` to `listQuestions` mcqOptions |
| `src/modules/sessions/session-queries.ts` | Add `select` to `getSessionById`, add pagination to `getSessionsForGrading` |
| `src/modules/exams/exam-actions.ts` | Remove `revalidatePath` (React Query handles cache) |
| `src/modules/questions/question-actions.ts` | Remove `revalidatePath` |
| All other `*-actions.ts` files | Remove `revalidatePath` |
| `src/lib/rate-limit.ts` | Replace in-memory with Redis |
| `src/lib/prisma.ts` | Add connection pool config |

---

## PART 5: RISK ANALYSIS

| Risk | Severity | Mitigation |
|------|----------|------------|
| React Query + Server Components hydration mismatch | HIGH | Use `initialData` pattern (not `dehydrate/hydrate`) — simpler, fewer SSR bugs |
| Zustand store getting stale (admin changes subjects while teacher is logged in) | MEDIUM | Add `lastFetchedAt` timestamp per data type, auto-refresh if > 10 min old |
| Raw SQL in `principal-queries.ts` breaking on schema changes | MEDIUM | Create typed helper functions, add integration tests for analytics queries |
| Removing `router.refresh()` from grading could show stale grades | LOW | `useInvalidateCache().afterGrading()` already invalidates grading + results |
| Prisma connection pool exhaustion under load | MEDIUM | Set `connection_limit=10`, add pool monitoring, consider PgBouncer for production |
| React Query devtools increasing bundle size | LOW | Only include `ReactQueryDevtools` in development builds |

---

## PART 6: WHAT NOT TO DO

| Anti-Pattern | Why |
|-------------|-----|
| Don't put page-level list data in Zustand | Zustand is for global/shared state, not for paginated lists. That's React Query's job. |
| Don't create API routes just for React Query | Server actions work as `queryFn`. No need for `/api/exams` REST endpoints. |
| Don't migrate all 27 components at once | Start with teacher pages (most used). Admin/principal pages can follow. |
| Don't remove `revalidatePath` before React Query hooks are in place | Keep the old pattern working while migrating. Remove `revalidatePath` only after the corresponding React Query hook is the data source. |
| Don't add Redis just for caching | Redis is for rate limiting and session storage at scale. For query caching, `unstable_cache` + React Query is sufficient. |
| Don't over-normalize Zustand stores | 3 stores max (auth, reference, ui). Don't create per-module stores — that's React Query's domain. |
