# Whole Project Brutal Production Analysis (March 2026)

Date: 2026-03-15
Scope: Entire codebase health with current implementation focus on reports consolidation reliability.
Constraint: No cross-module disturbance while improving production stability for 1000+ students.

## Executive Verdict
- Architecture maturity: Medium-High (strong domain coverage, broad feature set, large implementation surface).
- Production readiness for 1000+ concurrent student workflows: Medium (core features exist, but operational controls and consistency debt remain).
- Stability/Reliability target 9/10: Not yet achieved globally; reports consolidation path is now materially improved.

## Current High-Impact Findings

### 1) Database migration drift is the top release blocker
- Symptom: Prisma migration history diverged between local files and target database.
- Impact: New schema changes cannot be safely applied in normal migration flow.
- Risk: Deployment instability and environment inconsistency.
- Evidence:
  - Last common migration: `20260312120000_add_student_fee_discount`
  - Missing locally but present in DB: `20260310125848_add_custom_allocation_strategy`
  - Pending locally not in DB: `20260313205419_add_report_consolidation_system`

### 2) Modularity policy (<300 lines/file) is violated in critical paths
- Measured TypeScript files: 828
- Files >300 lines: 2 (improved from 12 after reports + attendance/diary + subjects/fees modularization waves)
- Largest offenders include:
  - `src/modules/fees/__tests__/allocation-engine.test.ts` (437)
  - `src/modules/fees/__tests__/fee-schemas.test.ts` (386)

Current runtime/modules status:
- All non-test runtime files in `src/` are now <=300 lines.
- Remaining over-limit files are test files only.

### 3) Prisma schema tooling config warning exists
- IDE/diagnostics flag datasource url placement for Prisma 7 direction.
- Current runtime still works with Prisma 6, but forward-compat readiness needs cleanup.

## What Has Been Completed in Consolidation Reliability

### Async worker architecture (Trigger.dev)
- Request path is enqueue-only.
- Background workflow executes consolidation.
- Retry/idempotency/concurrency key added.

### Checkpointed resumable processing
- Batch checkpoints now persisted in audit log.
- Workflow resumes from latest checkpoint offset within active queue cycle.

### Lock lease and stale lock recovery (code complete)
- `ResultTerm` now uses lock ownership and lease fields in code path.
- Stale lock acquisition and recovery audit added.
- Guard-railed admin force unlock action added (only stale locks).

Note: Schema migration apply is blocked until migration drift is resolved.

## Role-Based Brutal Action Matrix

### Senior Backend Expert
- Break oversized actions/clients into service-oriented modules (<300 lines strict target).
- Enforce workflow contracts with typed payload/result boundaries.
- Add dedicated lock-service abstraction reused by report jobs.

### Senior Database Expert
- Resolve migration drift first (single source of truth for migration chain).
- Add documented migration governance: no hot schema changes outside migrations.
- Validate index strategy for high-volume report/fee/attendance query paths.

### Senior Server/Platform Expert
- Standardize background task observability (run id, state, retries, duration, owner).
- Add dead-letter and replay strategy for failed jobs.
- Define SLO-aligned timeout/queue settings for Vercel + Trigger.

### Senior Security Expert
- Ensure all force/admin actions are role-gated and audited (already started in consolidation).
- Add abuse protection for expensive actions (rate limiting and cooldown windows).
- Expand audit metadata redaction policy for sensitive contexts.

### Senior Performance & High-Users Expert
- Add pagination and query limits for large list endpoints.
- Shift heavy computed views to cached snapshots where possible.
- Run synthetic load profiles for 1k+ students and publish p95/p99 budgets.

Progress note (2026-03-15):
- Teacher exam result list now uses server-side pagination.
- Written exam finalize/refinalize writes now run in bounded chunks to avoid unbounded transaction pressure.

### Senior Scalability & Horizontal Scaling Expert
- Ensure all long operations are queue-backed and idempotent.
- Remove singleton-process assumptions from mutable workflows.
- Use lock-token ownership everywhere shared resources are mutated.

### Senior Maintainability Expert
- Create module-level line budgets and CI check for >300 line files.
- Extract shared UI status blocks and server action wrappers.
- Consolidate duplicated status/action enums in a shared contract package.

### Senior Reliability/Production-Readiness Expert
- Build incident playbooks for lock-stuck, drift, and queue failure scenarios.
- Add health dashboards for job lag, stale locks, failed attempts.
- Add canary verification checks before production release.

## Mobile-First and UI Reliability
- Consolidation UI now supports live status polling and progressive visibility.
- Result term detail screen was split into focused reusable UI components (group card + dialogs) with unchanged behavior.
- Next phase should include compact mobile layout stress test for admin heavy screens.

## Non-Disturbance Compliance
- Changes were scoped to reports module and planning docs only.
- Latest wave additionally touched attendance/diary fetch modules only for safe extraction (no behavior-change refactor).
- No fee/admission/timetable runtime flows were modified in this phase.

## Immediate Next 3 Steps (Execution Order)
1. Resolve Prisma migration drift safely (do not reset shared DB blindly).
2. Add retry strategy for transient DB failures in written-exam finalize/refinalize chunk execution.
3. Add optimized DB index + on-demand/snapshotted analytics path for heavy result dashboards.
