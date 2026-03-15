# Worker/Runner Decision Matrix (Vercel + Neon)

Last Updated: 2026-03-15
Context: Result consolidation and heavy grading workflows for school scale (1000+ students)

## Goal
Pick a background execution model that is reliable, scalable, observable, and practical for current stack.

## Options Compared
- Option A: Vercel-only (DB queue + Vercel Cron + Route Handler worker)
- Option B: Hybrid with managed workflow service (Inngest/Trigger.dev/QStash) while app remains on Vercel
- Option C: Dedicated self-managed worker runtime (separate Node worker on VPS/container)

## Evaluation Criteria and Weights
- Reliability and failure recovery: 30%
- Scalability and throughput: 25%
- Operational simplicity: 15%
- Observability and debugging: 15%
- Cost efficiency at current stage: 10%
- Vendor lock-in risk: 5%

## Scoring Scale
- 1 = poor
- 5 = excellent

## Decision Matrix

| Criteria | Weight | Option A Vercel-only | Option B Hybrid managed workflows | Option C Self-managed worker |
|---|---:|---:|---:|---:|
| Reliability and recovery | 30% | 2.5 | 4.5 | 4.0 |
| Scalability and throughput | 25% | 2.5 | 4.5 | 4.0 |
| Operational simplicity | 15% | 4.0 | 4.0 | 2.0 |
| Observability and debugging | 15% | 2.5 | 4.5 | 3.0 |
| Cost efficiency (early stage) | 10% | 4.5 | 3.5 | 3.0 |
| Vendor lock-in risk | 5% | 4.0 | 3.0 | 5.0 |
| **Weighted total** | **100%** | **3.0 / 5** | **4.3 / 5** | **3.6 / 5** |

## Practical Interpretation

### Option A: Vercel-only
Best when:
- Budget is extremely tight.
- Workflows are moderate and can tolerate occasional retries/manual re-runs.

Limitations:
- Harder to build robust retries, checkpoints, dead-letter handling.
- More custom code for lock leasing and monitoring.
- High-risk during result day load spikes.

### Option B: Hybrid managed workflows (Recommended)
Best when:
- Need production reliability with minimal infra burden.
- Need retries, step replay, visibility, and safe long-running orchestration.

Strengths:
- Strong reliability without managing servers.
- Better developer speed for P1 rollout.
- Good fit for Vercel + Neon architecture.

Trade-offs:
- Additional service dependency and monthly cost.

### Option C: Self-managed worker
Best when:
- Team has strong DevOps capacity.
- Need maximum control and lowest vendor lock-in long term.

Trade-offs:
- Highest operational overhead (deployments, scaling, monitoring, uptime).
- Slower delivery for current roadmap.

## Recommendation
Choose Option B (Hybrid managed workflows) for current project phase.

Decision Status: Selected
Selected Provider: Trigger.dev
Selected On: 2026-03-15

Why:
- Gives near-enterprise reliability quickly.
- Reduces risk for 1000+ student result operations.
- Keeps app on Vercel and DB on Neon with minimal architecture disruption.

## Suggested Provider Priority
1. Trigger.dev
2. Inngest
3. QStash

## Implementation Plan Snapshot (if Option B chosen)

### Phase 1 (Immediate)
- Introduce Job table for consolidation state and audit linkage.
- Convert compute action to enqueue-only.
- Execute worker flow with step retries and idempotency key.

### Phase 2
- Add live progress endpoint and UI polling.
- Add cancel/retry controls for admin.
- Add stale-lock auto-recovery.

### Phase 3
- Add throughput controls (section partitioning and bounded concurrency).
- Add alerting for failed jobs and long-running jobs.

## Go/No-Go Checklist Before P1 Start
- [x] Decide provider (Inngest/Trigger.dev/QStash)
- [ ] Confirm budget and plan limits
- [ ] Confirm data residency/compliance constraints
- [ ] Confirm acceptable RTO/RPO for result-day incidents
- [ ] Approve implementation sequence in checklist tracker
