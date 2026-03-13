# ExamCore - Production Readiness, Scalability, and Reliability Plan

Date: 2026-03-13
Mode: Plan only
Target environment: production-grade school platform, 1000+ students, high daily concurrent usage, horizontal scalability readiness

## 1. Current Verified Baseline

## 1.1 Tooling and quality gates

Verified:
- React 19, Next 16, Prisma 6, React Query, Zustand
- Vitest test suite exists
- CI workflow exists
- many `loading.tsx` and `error.tsx` routes exist

Verified gaps:
- CI job title says lint is included, but workflow does not run lint
- `README.md` does not document the real product
- Prisma config migration is incomplete according to current editor error surface

## 1.2 Runtime code modularity

Verified:
- runtime TS/TSX files are mostly below 300 lines

Verified hotspots:
- `prisma/schema.prisma` at 1703 lines
- `prisma/seed.ts` at 1040 lines

Implication:
- frontend/runtime modularity is healthier than schema and data bootstrap modularity

## 1.3 Reliability baseline

Verified test result:
- 177 tests total
- 174 passed
- 3 failed
- failures are in `src/modules/fees/__tests__/fee-generation-actions.test.ts`

Implication:
- the project has meaningful reliability infrastructure now
- but it does not yet have a fully green release baseline

## 1.4 Config and build risk

Verified risks:
- editor reports Prisma datasource deprecation warning in `prisma/schema.prisma`
- `package.json` build script runs `prisma migrate deploy && next build`

Why this is risky:
- build and deploy responsibilities are coupled
- build reproducibility becomes environment-dependent
- horizontal scaling setups usually want migration orchestration outside the app build itself

## 2. Brutal System Scores

| Category | Current | Target | Gap |
|---|---:|---:|---:|
| Stability | 7.1 | 9.0+ | High |
| Reliability | 7.2 | 9.0+ | High |
| Horizontal scaling readiness | 6.5 | 8.8+ | High |
| Mobile-first readiness | 6.1 | 9.0+ | Very high |
| Non-technical operator readiness | 6.4 | 9.0+ | Very high |
| Performance under daily operational load | 7.0 | 9.0+ | High |

## 3. Main Risks Blocking 9/10 Stability

## 3.1 Shared interaction primitives still create multi-page defects

This is a stability problem, not just a design issue.
If tabs, sheets, and header actions are unstable on mobile, many modules inherit the defect.

## 3.2 Data freshness rules are not fully centralized yet

Verified drift remains in query keys and reference freshness assumptions.

Impact:
- stale data bugs
- inconsistent user trust
- higher support load for school staff

## 3.3 Platform release baseline is not fully green

Impact:
- known failing tests weaken release confidence
- config warnings signal upcoming breakage risk
- CI is present but not complete

## 3.4 Operational workflows still generate too much manual repetition

Impact:
- human error increases under volume
- staff throughput drops
- training burden rises

This directly hurts reliability in real-world usage even if the code is technically correct.

## 4. Architecture Targets for 1000+ Students

## 4.1 Frontend targets

- mobile-safe primitives used consistently
- stable query key contract
- filter and context persistence across related pages
- card/list fallback for all operational tables on small screens
- batch and template UX for repeat-heavy tasks

## 4.2 Data freshness targets

- all query keys produced by `queryKeys`
- all structural mutations mapped to deterministic invalidation rules
- reference store hydration policy documented and consistent with Query Client defaults
- zero anonymous key literals for shared domain data

## 4.3 Performance targets

- no unnecessary full-page refresh after common CRUD when targeted invalidation is enough
- no unbounded high-cardinality list rendering without mobile strategy
- reduced `transition-all` usage in shared primitives
- task surfaces optimized for low-end mobile devices

## 4.4 Deployment targets

- migrations moved out of generic app build step
- clean separation between build, migrate, and deploy
- documented environment requirements
- explicit rollback and incident guidance

## 5. Phased Plan

## Phase 0: Release Baseline Repair

Goal:
- restore clean repository health before larger UX or scale work

Tasks:
- fix the 3 failing fee generation tests
- resolve the Prisma datasource/config warning
- add lint step to CI or rename the job honestly
- write a real README covering setup, scripts, env, migrations, and module map

Exit criteria:
- 100% tests green
- no active Prisma config warning
- CI reflects actual quality gates

## Phase 1: Shared Primitive Stabilization

Goal:
- eliminate defects that repeat across modules

Tasks:
- replace current mobile tab behavior with a stable adaptive primitive
- redesign sheet and dialog close controls for mobile
- standardize page header action management
- define one shared responsive data surface strategy

Exit criteria:
- attendance tabs fixed across admin and teacher
- family and admissions tabs no longer wrap unpredictably
- close button issue removed across drawers/dialogs

## Phase 2: Data Contract Unification

Goal:
- reduce stale UI and cache inconsistency risk

Tasks:
- replace remaining hardcoded query keys
- document query key ownership per module
- align reference store freshness rules with Query Client defaults
- define exact invalidation rules for structural mutations

Verified immediate candidates:
- `['my-student-profile']`
- `['classes-for-select']`
- `['academic-sessions-for-select']`

Exit criteria:
- all shared data queries use canonical keys
- freshness behavior is predictable and documented

## Phase 3: Non-Technical Workflow Hardening

Goal:
- make the system operationally reliable for ordinary school staff

Tasks:
- timetable replication and templates
- attendance quick-fill patterns
- fee action prioritization and guided flows
- batch preview and conflict summary for risky operations
- persistent context across related pages

Exit criteria:
- repeated clerical work reduced significantly
- fewer manual correction paths needed

## Phase 4: Horizontal Scaling Readiness

Goal:
- prepare for multi-instance production deployment and heavier load

Tasks:
- separate migration execution from build
- review cache invalidation assumptions for multi-instance environments
- review any local-only process assumptions in operational workflows
- define production runbook for deploy, migrate, rollback, and incident response

Notes:
- React Query client cache helps UX but does not solve multi-instance server concerns
- operational integrity still depends on server-side consistency and release discipline

Exit criteria:
- deployment flow suitable for controlled multi-instance production environments

## Phase 5: Observability and Ongoing Quality

Goal:
- keep the product stable after growth

Tasks:
- track UX-critical regressions in CI and test coverage
- add module-level release checklist for attendance, timetable, fees, datesheet, diary
- define smoke test pack for mobile views
- add operational analytics for slow or failed critical workflows

Exit criteria:
- regressions become easier to catch before release

## 6. Module Priority Matrix

| Module | Why It Matters | Priority |
|---|---|---|
| Attendance | daily operational use, visible mobile tab defect | P0 |
| Timetable | highest repetition burden, strong template opportunity | P0 |
| Fees | admin action overload, current failing tests | P0 |
| Shared UI primitives | root cause of repeated frontend defects | P0 |
| Admissions | dynamic tab complexity, mobile scalability risk | P1 |
| Family self-service | non-technical audience, dynamic child switching | P1 |
| Principal analytics | dense mobile information architecture | P1 |
| Schema and seed modularization | maintainability and onboarding | P2 |

## 7. Reliability Gates Required Before Calling This 9/10

1. Green test suite with no known failing module tests.
2. No active Prisma config warnings in the workspace.
3. All shared mobile primitives stable on narrow devices.
4. Canonical query key usage for shared domain data.
5. Build, migrate, and deploy responsibilities separated.
6. At least one polished batch workflow in timetable and attendance.
7. Fee management usable on mobile without action overload.
8. Real onboarding and operational documentation in README and planning docs.

## 8. Recommended Documentation Strategy

Keep these docs as the source of truth:
- March 2026 frontend/UI audit
- mobile-first UX master plan
- production readiness roadmap

Then add or update:
- real README
- deployment runbook
- data freshness contract
- module ownership map

## 9. Final Brutal Conclusion

This project is much stronger than the oldest brutal analysis files suggest. It now has genuine engineering shape.

But reaching the requested production-grade level for 1000+ students is not just about adding more modules. It requires tightening four things at the same time:
- shared mobile interaction primitives,
- deterministic data freshness contracts,
- green release baseline,
- simpler batch workflows for non-technical staff.

Once those are handled, the platform can credibly move from "strong internal build" to "reliable production school system".