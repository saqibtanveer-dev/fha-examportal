# Phased Task List (Brutal, Production-first)

## Phase 0 - Security and guardrails
1. Rotate all exposed credentials (DB, AI, Trigger, auth).
2. Ensure only env references are used in runtime and docs.
3. Add feature flag to toggle hybrid mode safely.

## Phase 1 - Observability baseline
1. Add structured logs for marks save/import requests.
2. Record payload entries count, student count, question count, duration.
3. Add error taxonomy tags (validation, permission, timeout, db, unknown).
4. Capture p50/p95/p99 latencies.

## Phase 2 - Contract hardening
1. Standardize API response shape for marks operations.
2. Include fields: acceptedEntries, persistedEntries, rejectedEntries, errorDetails.
3. Make client treat success=false as hard failure.
4. Remove any optimistic success path without persistence proof.

## Phase 3 - Sync path hardening
1. Keep sync path for small payload only.
2. Split writes into internal chunks.
3. Use short transactions per chunk.
4. Aggregate result and return exact persisted count.

## Phase 4 - Async job model
1. Add job entity for marks processing state.
2. States: QUEUED, RUNNING, COMPLETED, PARTIAL_FAILED, FAILED.
3. Store progress: totalEntries, processedEntries, currentChunk, totalChunks.
4. Store resume cursor and last error metadata.

## Phase 5 - Trigger.dev workflow
1. Add marks-import workflow task with queue concurrency controls.
2. Process chunk, persist progress, renew lease, continue.
3. Add retry policy with max attempts and backoff.
4. Add idempotency keys for safe retries.

## Phase 6 - UI progress and UX reliability
1. Keep one click action for Save All and Import.
2. If async path selected, show job card with live progress.
3. Show partial failure with downloadable error report.
4. Allow retry failed chunk(s) without reprocessing all chunks.

## Phase 7 - Session status correctness
1. Recompute session status from persisted grade counts only.
2. Block finalize if active marks job exists for exam.
3. Add explicit stale-data guard before finalization.

## Phase 8 - Reconciliation and verification
1. Post-run reconciliation: compare intended entries vs persisted entries.
2. Save reconciliation summary to job metadata and audit logs.
3. Fail run if mismatch is above tolerance (expected zero).

## Phase 9 - Load and failure testing
1. Test matrices: 30x20, 50x20, 80x20, 120x20 entries.
2. Inject network failures and DB retry scenarios.
3. Validate idempotency under duplicate click storms.
4. Validate no false success and no silent drops.

## Phase 10 - Rollout strategy
1. Enable hybrid mode for a small cohort first.
2. Monitor error rate and latency for 48 to 72 hours.
3. Gradually increase rollout percentage.
4. Keep rollback switch until stability target is met.

## Stability target
- Timeout failure rate: near zero under expected load.
- Data mismatch rate: zero.
- Recovery from transient failure: automatic with retry/resume.
