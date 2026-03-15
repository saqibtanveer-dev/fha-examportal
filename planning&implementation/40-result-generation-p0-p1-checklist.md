# Result Generation Module - P0/P1 Execution Checklist

Last Updated: 2026-03-15
Owner: Backend + DB + Platform
Scope: Result generation, visibility, consolidation reliability, scale readiness (1000+ students)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked

## P0 - Critical (Correctness + Race Safety)

### P0.1 Manual release policy must be real
- Priority: P0
- Why: MANUAL mode should never auto-publish results.
- Checklist:
  - [x] Ensure grading flow sets `publishedAt = null` when exam policy is `MANUAL`.
  - [x] Ensure written finalize flow sets `publishedAt = null` when exam policy is `MANUAL`.
  - [x] Ensure written re-finalize flow sets `publishedAt = null` when exam policy is `MANUAL`.
- Execution Notes:
  - Updated in `src/modules/grading/grading-engine.ts`.
  - Updated in `src/modules/written-exams/written-exam-result-actions.ts`.
- Completed On: 2026-03-15

### P0.2 Consolidation lock must be atomic
- Priority: P0
- Why: Prevent concurrent consolidation runs for same term.
- Checklist:
  - [x] Replace check-then-set lock pattern with atomic DB update (`where isComputing = false`).
  - [x] Return explicit already-running error when lock acquisition fails.
- Execution Notes:
  - Updated in `src/modules/reports/actions/consolidation-actions.ts`.
- Completed On: 2026-03-15

### P0.3 Recompute flag must match UI behavior
- Priority: P0
- Why: `recompute=false` should skip already computed students.
- Checklist:
  - [x] Preload existing summary student IDs for current batch.
  - [x] Skip student processing when summary exists and recompute is false.
  - [x] Count skipped entries correctly.
- Execution Notes:
  - Updated in `src/modules/reports/engine/consolidation-engine.ts`.
- Completed On: 2026-03-15

### P0 Validation
- [x] Compile/static errors check passed for all P0-touched files.

## P1 - High (Reliability + Throughput + Operations)

### P1.1 Async consolidation execution model
- Priority: P1
- Why: Avoid long request-bound server action jobs on Vercel.
- Checklist:
  - [ ] Add consolidation job table/model (queued, running, failed, completed, cancelled).
  - [x] Convert compute action to enqueue-only path.
  - [x] Add Trigger.dev worker/runner with retries/idempotency and per-term concurrency key.
  - [x] Replace previous Inngest integration with Trigger.dev task trigger path.
  - [x] Add resumable checkpoints.
  - [x] Add status endpoint and progress polling in UI.

### P1.2 Lock lease + stale lock recovery
- Priority: P1
- Why: Prevent permanent stuck `isComputing` in crash/timeout scenarios.
- Checklist:
  - [x] Add lock metadata (`lockedAt`, `lockOwner`, `lockExpiresAt`).
  - [x] Add safe stale-lock recovery flow with audit logging.
  - [x] Add admin action for force unlock with guardrails.
  - [!] Migration-chain reconciliation blocked by existing Prisma migration drift in shared DB (schema synced via `prisma db push` as temporary path).

### P1.3 Bounded write concurrency
- Priority: P1
- Why: Reduce DB pressure spikes for large classes.
- Checklist:
  - [x] Replace unbounded `Promise.all` finalize/refinalize writes with chunked execution.
  - [x] Keep transaction size bounded by configurable chunk size.
  - [x] Add retry strategy for transient DB failures.

### P1.4 Result query performance hardening
- Priority: P1
- Why: Keep teacher result and analytics pages responsive for 1000+ students.
- Checklist:
  - [x] Add pagination to exam result list APIs and UI.
  - [ ] Add optimized index for common sorting/filtering patterns.
  - [ ] Split heavy analytics into on-demand or precomputed snapshots.

### P1.5 Test coverage for critical paths
- Priority: P1
- Why: Prevent regressions in high-stakes result workflows.
- Checklist:
  - [ ] Unit tests: visibility policy and recompute semantics.
  - [ ] Integration tests: consolidation idempotency and ranking correctness.
  - [ ] Load test scenario: class=100, school=1000+.

## Update Protocol (Important)
After each task completion:
1. Flip checklist status immediately.
2. Add one line in Update Log with date, task ID, and outcome.
3. If blocked, mark `[!]` and add blocker + owner.

## Update Log
- 2026-03-15: Initialized tracker and marked completed P0 items already executed in code.
- 2026-03-15: Implemented Option B base architecture with Inngest (enqueue action + workflow runner + API route) and updated consolidation UI messaging to async queueing.
- 2026-03-15: Added operator handoff setup guide for Inngest keys, endpoint wiring, and smoke testing.
- 2026-03-15: Migrated consolidation orchestration from Inngest to Trigger.dev (task definition + SDK trigger call), removed Inngest runtime files.
- 2026-03-15: Added consolidation job snapshot fetch action and UI polling loop with queued/running/completed/failed visibility plus run metadata display.
- 2026-03-15: Implemented resumable consolidation checkpoints (batch offset checkpoints in audit log + workflow resume from last checkpoint).
- 2026-03-15: Implemented lock lease/stale recovery/force unlock in reports consolidation flow; migration apply currently blocked due existing migration history drift.
- 2026-03-15: Synced lock lease schema to DB via `prisma db push` to keep runtime stable; formal migration history reconciliation still pending.
- 2026-03-15: Enforced modularity pass for reports consolidation by extracting maintenance actions, snapshot fetch logic, UI status panel, and batch processor (target files reduced below 300 lines each).
- 2026-03-15: Completed modular extraction for result term detail screen (dialogs + group card components), reducing `result-term-detail-client.tsx` from 407 to 231 lines.
- 2026-03-15: Reduced oversized fetch modules by extracting attendance self-service actions and diary analytics fetch actions; `attendance-fetch-actions.ts` and `diary-fetch-actions.ts` are now <300 lines.
- 2026-03-15: Extracted enrollment fetch wrappers and fee report/ledger fetch actions into dedicated modules; reduced `enrollment-actions.ts` to 268 and `fee-fetch-actions.ts` to 166 lines.
- 2026-03-15: Extracted student assignment list UI from fee payment tab; reduced `student-payment-tab.tsx` from 311 to 238 lines.
- 2026-03-15: Implemented P1.3 bounded write concurrency for written exam finalize/refinalize using chunked execution helper (`FINALIZE_WRITE_CHUNK_SIZE=25`).
- 2026-03-15: Implemented P1.4 server-side pagination for teacher exam result list (`getResultsByExamPage`) and wired page navigation in teacher results detail route.
- 2026-03-15: Added transient retry strategy to chunked written-exam finalize/refinalize writes (retryable Prisma/network timeout/deadlock classes with bounded backoff).
