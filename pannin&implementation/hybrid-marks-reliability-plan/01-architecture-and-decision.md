# Architecture and Decision

## Problem statement
The current marks write path can process many upserts in one request/transaction, which risks timeout and partial reliability issues in serverless environments.

## Constraints
- Hosting: Vercel (serverless runtime constraints)
- Existing stack: Next.js, Prisma, Trigger.dev already present
- Must support spreadsheet Save All and Excel import
- Must preserve role-based access and grading permissions

## Decision: Hybrid execution mode
Use two execution paths selected by payload size.

1. Sync path (fast path)
- Use for small payloads (configurable threshold).
- Process in short internal chunks with bounded transaction time.
- Return immediate success with exact persisted count.

2. Async path (safe path)
- Use for large payloads above threshold.
- Create a job record and enqueue Trigger.dev workflow.
- Process chunk-by-chunk with retries and resume support.
- UI polls job state and shows progress.

## Why hybrid instead of async-only
- Better UX for normal workloads.
- Lower queue overhead for simple submissions.
- Keeps architecture simple while preserving reliability for heavy cases.

## Why hybrid instead of sync-only
- Sync-only remains fragile for high payload size and peak load.
- Serverless timeout risk remains non-zero even with optimization.
- Harder to provide resilient retries and recovery.

## Reliability guarantees
- Idempotency key at request/job/chunk level.
- Deterministic chunk ordering.
- Persisted-count verification before success state.
- Retry with backoff for transient DB/network failures.
- Resume from last successful chunk after interruption.

## Data consistency guarantees
- No false success toasts.
- No duplicate writes on repeated submit.
- Final session status computed from persisted grades only.
- Reconciliation report after completion.

## Suggested thresholds (initial)
- Sync threshold: up to 300 entries.
- Async threshold: more than 300 entries.
- Chunk size: 100 to 150 entries per chunk.
- Thresholds are configuration values and can be tuned from metrics.
