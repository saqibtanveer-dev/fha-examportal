# ExamCore Stabilization — Phase Checklist Tracker

**Created**: 2026-03-08  
**Last Updated**: 2026-03-09  
**Status**: ✅ Phase 0 + Phase 1 + Phase 2 Complete + Stability Improvements

---

## Phase 0: Surgical Cache Freshness Fix (P0 — Critical)
> Fix query key mismatches causing silent invalidation failures across all admin modules

| # | Task | Status | Files |
|---|------|--------|-------|
| 0.1 | Fix classes hooks → use centralized `queryKeys` | ✅ Done | `src/modules/classes/hooks/use-classes-query.ts` |
| 0.2 | Fix subjects hooks → use centralized `queryKeys` | ✅ Done | `src/modules/subjects/hooks/use-subjects-query.ts` |
| 0.3 | Fix departments hooks → use centralized `queryKeys` | ✅ Done | `src/modules/departments/hooks/use-departments-query.ts` |
| 0.4 | Fix users hooks → use centralized `queryKeys` | ✅ Done | `src/modules/users/hooks/use-users-query.ts` |
| 0.5 | Lower staleTime for critical admin lists (10min → 2min) | ✅ Done | All 4 hook files above |
| 0.6 | Verify `cache-utils.ts` invalidation targets match new keys | ✅ Done | `src/lib/cache-utils.ts` |
| 0.7 | Fix reference store hydration to force-refresh on mutations | ✅ Done | `src/stores/reference-store.ts` + `src/lib/cache-utils.ts` |
| 0.8 | Audit all other hardcoded query keys across codebase | ✅ Done | 2 student keys noted for Phase 1 |
| 0.9 | Build verification — project compiles clean | ✅ Done | `tsc --noEmit` — 0 errors |

---

## Phase 1: Consistency Contract (P1 — High)
> Standardize all query keys, mutation hooks, and invalidation patterns project-wide

| # | Task | Status | Files |
|---|------|--------|-------|
| 1.1 | Replace ALL remaining hardcoded query keys | ✅ Done | `use-principal-queries.ts` (9 keys → factory), `use-exams-query.ts`, `use-results-query.ts` + added `student` section to `query-keys.ts` |
| 1.2 | Audit & fix mutation invalidation consistency | ✅ Done | Diary custom `useInvalidateDiary` → central `useInvalidateCache`, fixed `principalDashboard` hardcoded key in `cache-utils.ts` |
| 1.3 | Add cross-module invalidation for linked entities | ✅ Done | Added `afterStructuralChange()`, `afterUserMutation()`, `diary()` to `cache-utils.ts` |
| 1.4 | Added `dashboard.all` to principal query key factory | ✅ Done | `query-keys.ts` |
| 1.5 | Build verification | ✅ Done | `tsc --noEmit` — 0 errors |

---

## Phase 2: Reference Store Reliability (P1 — High)
> Ensure reference data (classes, subjects, sessions) is always fresh in forms/selectors

| # | Task | Status | Files |
|---|------|--------|-------|
| 2.1 | Add `forceHydrate()` method bypassing stale gate | ✅ Done | `reference-store.ts` |
| 2.2 | Structural mutation invalidation triggers reference refresh | ✅ Done | `cache-utils.ts` — `afterStructuralChange()` |
| 2.3 | Standardize shell types to use shared `ReferenceDataPayload` | ✅ Done | `admin-shell.tsx`, `principal-shell.tsx` |
| 2.4 | Verified reference hydration across all 5 role shells | ✅ Done | Admin ✓, Teacher ✓, Principal ✓, Student (no ref data needed), Family (no ref data needed) |

---

## Phase 3: Frontend Architecture Hardening (P2 — Medium)
> Split large files, remove type escapes, enforce module boundaries

| # | Task | Status | Files |
|---|------|--------|-------|
| 3.1 | Split files > 300 lines into composable modules | ⬜ Not Started | 12+ files |
| 3.2 | Remove all `as any` type escapes (30+ instances) | ⬜ Not Started | Multiple modules |
| 3.3 | Remove `eslint-disable` comments and fix underlying issues | ⬜ Not Started | 3 files |
| 3.4 | Wrap all server actions in `safeAction` | 🔄 Partial | Principal (9 fns) + Attendance (14 fns) wrapped in `safeFetchAction`. Created `safeFetchAction` utility in `safe-action.ts`. 15 more files to go. |
| 3.5 | Enforce module boundary rules | ⬜ Not Started | ESLint config |

---

## Phase 4: Quality Gates & Testing (P2 — Medium)
> Add test infrastructure and CI pipeline

| # | Task | Status | Files |
|---|------|--------|-------|
| 4.1 | Setup Vitest + React Testing Library | ⬜ Not Started | Config files |
| 4.2 | Write unit tests for query key factory | ⬜ Not Started | Test file |
| 4.3 | Write integration tests for cache invalidation flows | ⬜ Not Started | Test files |
| 4.4 | Write E2E tests for critical CRUD workflows | ⬜ Not Started | Playwright tests |
| 4.5 | Setup CI pipeline (lint + type-check + test) | ⬜ Not Started | GitHub Actions |

---

## Phase 5: Performance & Scalability (P3 — Low)
> Optimize for 1000+ concurrent students

| # | Task | Status | Files |
|---|------|--------|-------|
| 5.1 | Implement connection pooling optimization | ✅ Done | `prisma.ts` — Wired Neon serverless adapter (`@prisma/adapter-neon@6.19.2`) for production, fixed version mismatch (was 7.4.2 → 6.19.2) |
| 5.2 | Add database query optimization (indexes, pagination) | ⬜ Not Started | Prisma schema |
| 5.3 | Fix N+1 patterns in written-exam-result-actions | ✅ Done | Sequential `for` loop → `Promise.all` batch for both `finalize` and `refinalize` |
| 5.4 | Add bundle size analysis + lazy loading | ⬜ Not Started | Next.js config |
| 5.5 | Stress test with simulated concurrent users | ⬜ Not Started | Load testing |
| 5.6 | Add rate limiting and request throttling | ⬜ Not Started | Middleware |

---

## CT Scan Reports

| Report | Status | File |
|--------|--------|------|
| Initial Analysis (2026-03-07) | ✅ Complete | `30-brutal-stability-reliability-master-plan.md` |
| Post-Phase-0 CT Scan | ✅ Complete | `32-brutal-ct-scan-system-stability.md` |
| Full System Stability Report | ✅ Complete | `32-brutal-ct-scan-system-stability.md` |

---

## CT Scan Summary (Post-Phase 1+2)

| Dimension | Before | After | Delta |
|-----------|--------|-------|-------|
| Reliability | 8/10 | 8.5/10 | +0.5 (safeFetchAction wrapping, error sanitization) |
| Stability | 7/10 | 8/10 | +1.0 (zero hardcoded keys, centralized invalidation, diary dedup) |
| Scalability | 6/10 | 7/10 | +1.0 (Neon adapter, N+1 fix, Promise.all batch) |
| Maintainability | 7.5/10 | 8/10 | +0.5 (shared types, DRY patterns, factory keys) |
| Security | 8.5/10 | 8.5/10 | — |
| Design Patterns | 7/10 | 8/10 | +1.0 (consistent factory, centralized cache contract) |
| Production Readiness | 6.5/10 | 7.5/10 | +1.0 (Neon adapter wired, safeFetchAction, error handling) |
| **Overall** | **7.2/10** | **7.9/10** | **+0.7** |

**Verdict**: System is significantly more stable with zero hardcoded keys, centralized invalidation, Neon adapter, and error-safe fetch actions. Peak-event scalability improved with N+1 fix and connection pooling.
