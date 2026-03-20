# Hybrid Marks Reliability Plan (Vercel)

## Purpose
This plan defines a production-grade, timeout-safe strategy for written-exam marks entry and Excel import.

## Why this exists
- Current marks operations can become heavy when many students and questions are submitted in one request.
- On Vercel, long requests are vulnerable to runtime and upstream timeout limits.
- Import flow must never report success unless persistence is verified.

## Target outcome
- Reliable for normal classes (up to 50 students) with low latency.
- Reliable for larger loads via queued background processing.
- No silent failures, no fake success messages, and full auditability.

## Hybrid policy summary
- Small payload: process synchronously in short chunks.
- Large payload: enqueue Trigger.dev job and process asynchronously.
- The UI remains one-click; backend chooses execution mode.

## Documents in this folder
- 01-architecture-and-decision.md
- 02-phased-task-list.md
- 03-implementation-map.md
- 04-rollout-and-validation.md

## Security note
Rotate any leaked credentials and move all secrets to environment variables managed by the deployment platform.
