# ExamCore - Brutal Frontend, UI/UX, and UX Audit

Date: 2026-03-13
Mode: Analysis only, no code changes
Scope: Whole project current-state audit with emphasis on frontend quality, mobile UX, maintainability, scalability, reliability, and non-technical user usability

## 1. Executive Verdict

This codebase is no longer in the "rough prototype" state described by older audit files. It now has:
- role-based shells,
- React Query wiring,
- error boundaries,
- loading routes,
- partial test coverage,
- a CI workflow,
- several large subsystems already implemented.

But it is still not at the level required for a non-technical, production-grade school platform serving 1000+ students with consistently excellent mobile UX.

Current brutal score:

| Dimension | Score | Verdict |
|---|---:|---|
| Maintainability | 7.8/10 | Mostly modular runtime code, but still uneven in key architectural contracts |
| Scalability | 6.9/10 | Works for medium load, not yet hardened for high-concurrency operational traffic |
| Reliability | 7.2/10 | Good patterns exist, but test failures and config drift remain |
| Mobile UX | 6.1/10 | Several shared primitives break down under narrow widths |
| Non-technical usability | 6.4/10 | Capable system, but too many flows still expect operator confidence |
| Production readiness | 6.8/10 | Meaningful foundation exists, but still below the user target of 9+/10 |
| Stability | 7.1/10 | Better than earlier docs suggest, still not stable enough for low-friction school operations |

Target state requested by product direction:
- Stability: 9+/10
- Reliability: 9+/10
- Mobile-first readiness: required
- Reusability and modularity: required
- Non-technical operator friendliness: required

## 2. What Is Better Than Older Audit Documents

The repository has materially improved since the February planning docs:

- Root page now redirects to login via `src/app/page.tsx`.
- Forgot password and reset password routes exist under `src/app/(public)/login/...`.
- Loading routes now exist in many admin, teacher, principal, and student areas.
- Error boundaries now exist broadly across route groups.
- Tests now exist for cache utilities, query keys, transaction locks, fees, timetable, and datesheet.
- CI now exists in `.github/workflows/ci.yml`.
- The runtime codebase largely respects the project rule of keeping files under 300 lines.

This matters because the current plan must be based on March 2026 reality, not only on older brutal reports.

## 3. Verified Strengths

### 3.1 Runtime modularity is mostly disciplined

Verified oversized files over 300 lines:

| File | Lines | Comment |
|---|---:|---|
| `prisma/schema.prisma` | 1703 | Major maintainability hotspot |
| `prisma/seed.ts` | 1040 | Major maintainability hotspot |
| `src/modules/fees/__tests__/allocation-engine.test.ts` | 403 | Test-only hotspot |
| `src/modules/fees/__tests__/fee-schemas.test.ts` | 328 | Test-only hotspot |

Meaning: runtime TypeScript/TSX code is mostly already under the 300-line rule. That is a real positive.

### 3.2 Shared app shell is directionally correct

Verified strengths:
- `src/components/layout/dashboard-shell.tsx` uses one shell pattern across roles.
- `src/components/shared/page-header.tsx` already supports breadcrumbs, actions, wrapping, and responsive title sizing.
- `src/components/providers.tsx` centralizes React Query, theme, tooltips, and toasts.
- `src/app/globals.css` already includes safe-area utility classes and global horizontal overflow protection.

### 3.3 Data layer direction is better than before

Verified strengths:
- centralized query key factory exists in `src/lib/query-keys.ts`
- centralized invalidation helper exists in `src/lib/cache-utils.ts`
- reference hydration exists in `src/stores/reference-store.ts`
- admin and teacher shells hydrate shared reference data

This is the right direction for reusability and consistency.

## 4. Verified Critical Frontend and UX Findings

## 4.1 Shared tabs primitive is the root cause of multiple mobile defects

Root cause is in `src/components/ui/tabs.tsx`:
- `TabsList` is `inline-flex w-fit`
- `TabsTrigger` is `flex-1 whitespace-nowrap`
- active state uses border/background styling that visually crowds the selected tab on small widths

Impact:
- admin attendance tabs (`Mark / View`, `Reports`) compress awkwardly on mobile
- teacher attendance tabs have the same structural risk
- family fees tabs wrap unpredictably when multiple children are present
- principal and admissions tabs will become visually unstable as labels grow

This is not one isolated page bug. It is a primitive-level design issue.

Affected verified usages include:
- `src/app/(dashboard)/admin/attendance/attendance-view.tsx`
- `src/app/(dashboard)/teacher/attendance/attendance-view.tsx`
- `src/app/(dashboard)/family/fees/family-fees-view.tsx`
- `src/app/(dashboard)/admin/admissions/[campaignId]/campaign-detail-view.tsx`
- `src/app/(dashboard)/principal/analytics/analytics-client.tsx`

## 4.2 Mobile sheet close button is technically accessible but visually poor

Root cause is in `src/components/ui/sheet.tsx`:
- close control uses visible ring on focus
- icon button is intentionally exempted from 44x44 mobile minimum in `src/app/globals.css`
- the visible ring, tiny tap target, and corner placement create a harsh visual on dark mobile drawers

Impact:
- the close button shown in your screenshot looks like a bug even if technically it is a focus style
- it feels too small and too close to the drawer edge
- it reduces confidence for non-technical users

This is a component contract problem, not just a CSS tweak problem.

## 4.3 PageHeader action areas are not mobile-ready for dense admin controls

`src/components/shared/page-header.tsx` is structurally good, but action content is uncontrolled.

Verified failure pattern:
- `src/app/(dashboard)/admin/fees/fees-overview-view.tsx` injects 5 actions into `PageHeader`
- each action is a normal button or icon button
- actions wrap, but there is no mobile-specific action-bar pattern, no prioritization, and no overflow management

Impact:
- mobile header action rows become crowded and visually fragmented
- important actions compete equally with secondary actions
- fee management top area looks operationally heavy instead of guided

## 4.4 Non-standard mobile data entry patterns still rely too much on desktop assumptions

Verified examples:
- attendance pages use fixed-width date inputs (`w-40`) in narrow layouts
- family fees uses multi-child tabs instead of a mobile-friendly child switcher
- many pages still rely on wide tables or multiple compact controls within the same row

The platform often "responds" but is not consistently mobile-first.

## 4.5 Shared interaction primitives still use `transition-all`

Verified in:
- `src/components/ui/button.tsx`
- `src/components/ui/tabs.tsx`
- shell layout files

Impact:
- unnecessary property animation
- harder-to-predict visual states
- avoidable performance cost on low-end devices

This is not catastrophic, but it is beneath production-grade UI discipline.

## 4.6 Data consistency contract is improved but not fully unified

Good news:
- `queryKeys` and `useInvalidateCache` exist
- `forceHydrate` exists in the reference store

Remaining verified drift:
- `src/app/(dashboard)/student/attendance/attendance-page-client.tsx` uses `['my-student-profile']`
- `src/app/(dashboard)/student/timetable/timetable-page-client.tsx` uses `['my-student-profile']`
- `src/app/(dashboard)/admin/admissions/campaigns-page-client.tsx` uses `['classes-for-select']` and `['academic-sessions-for-select']`

Impact:
- some flows still bypass the canonical query key factory
- invalidation and freshness guarantees remain uneven

## 4.7 Reference store freshness contract contains internal drift

In `src/stores/reference-store.ts`:
- stale time is 2 minutes
- comment says it matches React Query stale time

In `src/components/providers.tsx`:
- default query stale time is 5 minutes

Impact:
- comments are wrong
- mental model is wrong
- future maintainers can make bad invalidation decisions based on false assumptions

This is a documentation/contract drift issue that can grow into functional inconsistency.

## 4.8 Production-readiness is still held back by platform-level issues

Verified issues:
- `prisma/schema.prisma` shows a current compile/config warning about deprecated datasource URL usage
- `package.json` build script runs `prisma migrate deploy` inside build
- CI file is named "Type Check, Lint & Test" but only runs type-check and test, not lint
- `README.md` is still effectively default boilerplate and does not document the real platform

Impact:
- deployment pipeline is under-specified
- build and migration responsibilities are mixed
- developer onboarding is weaker than required for production maintenance

## 4.9 Reliability baseline is real, but not yet clean

Verified test run result:
- 174 tests passed
- 3 tests failed
- failing suite: `src/modules/fees/__tests__/fee-generation-actions.test.ts`

This is better than having no tests, but it means the repository is not currently at a "clean green baseline" standard.

## 5. Non-Technical User UX Findings

This platform still behaves too much like an expert operator system.

Pain points:
- too many top-level actions shown at once
- repeated class/section/date selection across flows
- tabs used where step-based or task-based navigation would be easier
- bulk repetition workflows are not consistently surfaced in the UI
- some pages expose system structure instead of user goals

For non-technical staff, good UX should answer:
- What do I do first?
- What changed after my action?
- Can I safely repeat this for many classes?
- Can I undo or review before finalizing?

The current product does this partially, not consistently.

## 6. High-Value Workflow Opportunities

These are the most obvious workflow simplification opportunities confirmed by repository direction and your example:

1. Timetable day replication flow
Replicate one day to multiple days with preview and conflict summary.

2. Weekly template flow
Save a class/section timetable as reusable weekly template.

3. Bulk attendance quick-fill patterns
"All present", "copy yesterday", "mark absentees only", and "repeat same section/date filters" should be one-tap actions.

4. Fee management task segmentation
Separate overview, structure management, discount management, and collection into guided primary flows instead of one crowded action row.

5. Family and student views should prefer selectors over multi-row tab bars
Mobile users understand pickers and cards faster than crowded tab strips.

6. Admin campaigns and detail pages need mobile-safe subnavigation
Horizontal segmented controls or responsive task nav are better than wrapped dense tab groups.

## 7. Brutal Priority Order

### P0
- Replace the current shared mobile tab strategy
- Introduce a production-grade sheet/dialog close pattern with proper mobile hit target
- Fix fee overview header action overload
- restore fully green test baseline
- resolve Prisma datasource/config warning

### P1
- unify all hardcoded query keys under `queryKeys`
- standardize non-technical bulk workflows across timetable, attendance, diary, and fees
- separate primary actions from secondary actions in all high-traffic admin pages

### P2
- reduce `transition-all` usage across shared primitives
- tighten visual language for mobile cards, tables, and segmented navigation
- document actual architecture and operator flows

## 8. Final Brutal Conclusion

ExamCore has a solid and improving technical base. It is not broken. It is also not yet polished enough, predictable enough, or simplified enough for the user expectation you set.

The biggest remaining gap is not raw feature count. The biggest gap is product coherence:
- shared mobile patterns,
- operator-friendly workflows,
- unified cache/data contracts,
- production deployment discipline.

If those are fixed deliberately, this project can realistically move into the 9/10 stability and reliability band.