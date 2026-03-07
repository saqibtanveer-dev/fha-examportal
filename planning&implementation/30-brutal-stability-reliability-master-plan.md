# Brutal Deep Analysis + Production Stabilization Master Plan

Date: 2026-03-07
Scope: Full project frontend + React Query + Next.js App Router stability review
Mode: Analysis and plan only (no code changes in this document)

## 1. Executive Verdict (Brutal)

Current architecture is feature-rich but operationally fragile in core admin workflows.

The project is not production-stable yet because data consistency contracts are not enforced uniformly across:
- React Query query keys
- mutation invalidation strategy
- Next.js revalidation strategy
- layout-level reference store hydration

This creates non-deterministic UI behavior where some changes appear instantly, some appear after manual reload, and some remain stale for long windows.

Your reported issue (new class/section not appearing immediately) is valid and symptomatic of a systemic issue, not an isolated bug.

## 2. Root Cause of Your Exact Issue

### 2.1 Query Key Mismatch (Primary Root Cause)

Evidence:
- `src/modules/classes/hooks/use-classes-query.ts` uses `queryKey: ['admin', 'classes']`
- `src/lib/cache-utils.ts` invalidates via `queryKeys.classes.all`
- `src/lib/query-keys.ts` defines `queryKeys.classes.all = ['classes']`

Impact:
- `invalidate.classes()` does not target `['admin','classes']`
- cache is not invalidated
- with high stale times, UI stays stale until hard reload/navigation/refetch event

### 2.2 Long Stale Windows Amplify the Bug

Evidence:
- `src/modules/classes/hooks/use-classes-query.ts`: `staleTime: 10 * 60 * 1000`
- Similar pattern in subjects/departments hooks

Impact:
- when invalidation misses, stale data can survive up to 10 minutes
- user experience feels broken even if mutation succeeded in DB

### 2.3 Reference Store Hydration Gate Can Freeze Reference Data

Evidence:
- `src/stores/reference-store.ts`: `hydrate()` exits early when not stale
- stale threshold: 10 minutes
- many dashboards read classes/sessions from this store

Impact:
- even after server layout provides fresh reference data, client may skip hydration
- stale class/section/subject options in forms and selectors

## 3. Systemic Architecture Findings

## 3.1 Data Consistency and Cache Invalidation

Severity: Critical

Findings:
- Mixed key systems: hardcoded query keys and centralized `queryKeys` both exist
- Mixed refresh systems: `revalidatePath`, React Query invalidation, `router.refresh` all coexist without strict contract
- Mutation success does not guarantee deterministic client cache invalidation

Affected domains (confirmed):
- Classes
- Subjects
- Departments
- Users
- Potentially principal/admin list modules where keys are hardcoded

## 3.2 Frontend UX Reliability

Severity: High

Findings:
- Admin pages are mostly client-fetched wrappers (`page.tsx` just renders client component in `Suspense`)
- No guaranteed SSR freshness for critical management lists
- User sees skeleton -> cached state -> uncertain freshness after mutation

Impact:
- perceived slowness
- trust erosion ("action worked or not?")
- manual reload dependency

## 3.3 Maintainability and Modularity

Severity: High

Findings:
- Large action/UI files indicate rising complexity hotspots
- Top hotspots include:
  - `src/modules/written-exams/written-exam-finalize-actions.ts` (445 lines)
  - `src/modules/written-exams/written-exam-actions.ts` (304 lines)
  - `src/modules/grading/ai-grading-actions.ts` (300 lines)
  - Multiple 250-320 line UI components
- Heavy use of `as any` in presentation/reporting zones

Impact:
- onboarding cost high
- regression probability high
- difficult to safely optimize

## 3.4 Error Handling Uniformity

Severity: Medium-High

Findings:
- `safeAction` pattern is strong and widely used
- but some server actions are still plain async functions (for example in sessions module)
- this causes inconsistent error envelope behavior under unexpected exceptions

Impact:
- unpredictable client error UX
- inconsistent observability and alerting paths

## 3.5 Testing and Production Gates

Severity: Critical

Findings:
- No unit/integration/e2e test suite detected
- No CI workflow detected
- No automated regression gate for cache invalidation and role-sensitive flows

Impact:
- every release can silently break core workflows
- stability depends on manual testing

## 3.6 Accessibility and UX Quality

Severity: Medium

Findings:
- Some accessibility attributes exist (`aria-label`) in key controls
- but consistency is limited and not systemically enforced
- no automated accessibility checks detected

Impact:
- uneven UX quality
- future compliance risk

## 4. Stability Risk Matrix

| Risk | Probability | Impact | Priority |
|---|---|---|---|
| Query key mismatch causing stale admin lists | Very High | Critical | P0 |
| Reference store stale hydration lock | High | High | P0 |
| Mixed invalidation strategies without contract | High | High | P0 |
| No test/CI regression gate | Very High | Critical | P0 |
| Large-module complexity causing hidden regressions | High | High | P1 |
| Inconsistent error envelopes in actions | Medium | High | P1 |
| Inconsistent accessibility quality | Medium | Medium | P2 |

## 5. Production-Grade Target Architecture (What Good Looks Like)

Single source of truth for data lifecycle:
1. Query keys must come only from `queryKeys` factory
2. All mutations must invalidate deterministic key sets via one standard mechanism
3. Reference store must support forced hydration after relevant mutations
4. Server revalidation and client invalidation must be mapped per route/domain
5. Every action returns standardized `ActionResult` via `safeAction`
6. Core admin workflows must have e2e regression coverage

## 6. Brutal Action Plan (Phased)

## Phase 0: Emergency Stabilization (1-2 days) [P0]

Goal: Eliminate stale-data bugs in admin CRUD immediately.

Tasks:
- Unify `classes`, `subjects`, `departments`, `users` hooks to `queryKeys.*` keys
- Audit all `useInvalidateCache` calls for these modules and map to same keys
- Add temporary safeguard: post-mutation `router.refresh()` only in critical admin forms where stale reports are currently reproducible
- Lower stale times for critical admin lists to 30-60 seconds until full architecture migration is complete

Exit criteria:
- Create/edit/delete class/section appears without reload
- same for subject/department/user

## Phase 1: Consistency Contract (3-5 days) [P0/P1]

Goal: Remove architectural inconsistency.

Tasks:
- Create a `Data Freshness Contract` document for each module:
  - query keys
  - invalidation keys
  - revalidate paths
  - optimistic update policy
- Replace hardcoded query keys project-wide
- Standardize mutation hooks around one pattern (`useServerAction` + key invalidation map)
- Add lint rule/checklist: no raw `queryKey: ['admin', ...]` literals for managed domains

Exit criteria:
- 100% key generation through `queryKeys`
- 0 key mismatch between hooks and invalidators

## Phase 2: Reference Store Reliability (2-3 days) [P0]

Goal: Remove stale selector/reference options across dashboards.

Tasks:
- Introduce forced hydration path (`hydrate(data, { force: true })`) for layout refresh events
- Add targeted invalidation API per reference domain (`invalidateClasses`, `invalidateSubjects`, etc.)
- Trigger reference refresh after class/subject/session structural mutations

Exit criteria:
- reference dropdowns update deterministically after structural admin changes

## Phase 3: Frontend Architecture Hardening (1-2 weeks) [P1]

Goal: Improve maintainability + modularity.

Tasks:
- Split 250-450 line hotspots into service + orchestration + mapper layers
- Move heavy transform logic out of components into typed selector utilities
- Remove `as any` from critical tables/charts/forms and introduce strict DTO/view-model types
- Establish module boundary rules:
  - `queries` (read)
  - `actions` (write)
  - `hooks` (client orchestration)
  - `components` (presentational/container split)

Exit criteria:
- no mega action/component beyond agreed threshold (e.g., 180-220 lines soft cap)
- reduced type escapes in critical user paths

## Phase 4: Quality Gates (1 week initial, then continuous) [P0]

Goal: Make regressions hard to ship.

Tasks:
- Add test stack:
  - Unit tests for query key factories and invalidation mapping
  - Integration tests for mutation -> cache refresh behavior
  - E2E tests for admin class/section/subject/department/user CRUD freshness
- Add CI pipeline gates:
  - lint
  - type-check
  - tests
  - build

Minimum E2E suite must include:
- Create class -> appears immediately in list
- Add section -> appears immediately under class
- Assign subject to class -> reflected immediately in UI
- Create user (student) -> list and filters update instantly

## Phase 5: Performance + UX Optimization (parallel after stability) [P1/P2]

Goal: Improve responsiveness without sacrificing correctness.

Tasks:
- Introduce module-specific staleTime/caching policy matrix (not one-size-fits-all)
- Use optimistic UI selectively for low-risk operations (e.g., toggles)
- Keep server-rendered shells but prefetch critical admin list data where practical
- Add skeleton budget and perceived-performance metrics

## 7. Design Pattern Standards to Enforce

## 7.1 Command-Query Separation (CQS)
- Queries never mutate
- Actions/mutations never return broad list snapshots unless needed

## 7.2 Repository/Service Boundary
- Keep Prisma queries in query files
- Keep transactional business rules in action/service layer

## 7.3 Deterministic Cache Invalidation Map
- every mutation declares affected query key families explicitly
- no ad-hoc invalidation inside random components

## 7.4 Typed View Models at UI Boundary
- UI consumes typed view models, not raw Prisma-heavy objects

## 8. Production Readiness Checklist

Reliability:
- deterministic mutation refresh
- no stale admin CRUD behavior
- standardized action error envelopes

Stability:
- e2e smoke for all critical admin workflows
- CI-enforced release gate

Maintainability:
- reduced file complexity hotspots
- strict query key and typing rules

Scalability:
- module-level cache policy matrix
- clear boundaries for data orchestration

Modularity:
- unified hook/action/query conventions

Design patterns:
- CQS + invalidation map + typed DTOs

Observability:
- action failure logs grouped by module and action name
- dashboard for mutation failures and latency (future step)

## 9. Suggested Execution Order

1. P0 fix for key mismatch + stale refresh (classes/subjects/departments/users)
2. Reference store forced-hydration contract
3. Add e2e regression tests for these flows
4. Expand same contract to remaining modules
5. Refactor large-file hotspots incrementally

## 10. Success Metrics (Must Track)

- Cache-consistency bug count in admin CRUD: target 0
- Manual reload dependency reports: target 0
- Mean mutation-to-visible-update time: < 1s on local/normal network
- Type safety debt (`as any`) in critical flows: reduce by 80%
- CI pass rate with tests as required gate: 100% on main

## 11. Immediate Priority Snapshot

Do first (non-negotiable):
- query key unification
- invalidation contract enforcement
- reference store hydration fix
- CRUD freshness e2e tests

Do next:
- large-file modularization
- stricter typing and UX consistency improvements

---

This plan is intentionally strict because your target is full stable, full reliable, full optimized, and production-grade behavior.
