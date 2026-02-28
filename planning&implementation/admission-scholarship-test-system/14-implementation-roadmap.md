# Admission Test & Scholarship Test — Implementation Roadmap

> **Date:** February 28, 2026
> **Scope:** Phase-by-phase implementation plan with dependencies, effort estimates, priority sequencing

---

## 1. Implementation Phases Overview

```
Phase 0: Foundation (Prerequisites)           ████  1 week
Phase 1: Database & Grading Core Refactor     ████  1 week
Phase 2: Campaign Management (Admin)          ████████  2 weeks
Phase 3: Public Portal — Registration         ██████  1.5 weeks
Phase 4: Public Portal — Test Taking          ██████  1.5 weeks
Phase 5: Grading Pipeline                     ████████  2 weeks
Phase 6: Merit List & Decisions               ██████  1.5 weeks
Phase 7: Scholarship System                   ██████  1.5 weeks
Phase 8: Enrollment Conversion                ████  1 week
Phase 9: Analytics & Reporting                ████  1 week
Phase 10: Security Hardening & Polish         ██████  1.5 weeks
Phase 11: Testing & QA                        ████████  2 weeks
                                              ─────────────────
                                              Total: ~16 weeks
```

---

## 2. Phase 0: Foundation (Week 1)

### Prerequisites — Set Up Before Any Code

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 0.1 | Install dependencies: `@marsidev/react-turnstile`, `p-limit`, `recharts` | 0.5h | — |
| 0.2 | Set up Upstash Redis for caching + rate limiting | 2h | — |
| 0.3 | Set up Resend API for email sending | 1h | — |
| 0.4 | Configure Cloudflare Turnstile (CAPTCHA) | 1h | — |
| 0.5 | Add `ADMISSION` to NotificationType enum in Prisma | 0.5h | — |
| 0.6 | Extend `src/lib/query-keys.ts` with admission keys | 0.5h | — |
| 0.7 | Create base email template (`src/lib/email-templates/base.ts`) | 2h | 0.3 |
| 0.8 | Set up `src/lib/captcha.ts` with Turnstile verification | 1h | 0.4 |
| 0.9 | Enhance `src/lib/rate-limit.ts` with per-endpoint limiters | 2h | 0.2 |
| 0.10 | Set up `src/lib/cache-utils.ts` with `cachedQuery` helper | 1h | 0.2 |

**Deliverable:** Infrastructure ready, all third-party services configured.

---

## 3. Phase 1: Database & Grading Refactor (Week 2)

### New Prisma Schema + Shared Grading Core

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 1.1 | Add all new enums to `schema.prisma` (CampaignStatus, CampaignType, ApplicantStatus, etc.) | 1h | — |
| 1.2 | Add `TestCampaign` model | 1h | 1.1 |
| 1.3 | Add `CampaignQuestion` model | 0.5h | 1.2 |
| 1.4 | Add `CampaignScholarshipTier` model | 0.5h | 1.2 |
| 1.5 | Add `CampaignEvaluationStage` model | 0.5h | 1.2 |
| 1.6 | Add `Applicant` model with all fields + unique constraints | 1h | 1.2 |
| 1.7 | Add `ApplicantTestSession` model | 0.5h | 1.6 |
| 1.8 | Add `ApplicantAnswer` model with composite unique | 0.5h | 1.7 |
| 1.9 | Add `ApplicantAnswerGrade` model | 0.5h | 1.8 |
| 1.10 | Add `ApplicantResult` model with composite unique | 0.5h | 1.7 |
| 1.11 | Add `ApplicantScholarship` model | 0.5h | 1.4, 1.6 |
| 1.12 | Add `AdmissionDecision` model | 0.5h | 1.6 |
| 1.13 | Add all indexes defined in schema design | 1h | 1.1-1.12 |
| 1.14 | Run `prisma migrate dev` and verify | 0.5h | 1.13 |
| 1.15 | Extract pure grading logic into `grading-core.ts` | 3h | — |
| 1.16 | Refactor existing `grading-engine.ts` to use `grading-core.ts` | 2h | 1.15 |
| 1.17 | Verify existing exam grading still works (regression test) | 1h | 1.16 |

**Deliverable:** Database migration applied, shared grading core extracted, zero regression.

---

## 4. Phase 2: Campaign Management — Admin (Weeks 3-4)

### Server Actions + Admin UI

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 2.1 | Create `src/modules/admissions/admission-schemas.ts` (all Zod schemas) | 3h | 1.14 |
| 2.2 | Create `admission-actions.ts` — `createCampaignAction` | 2h | 2.1 |
| 2.3 | Create `admission-actions.ts` — `updateCampaignAction` | 1h | 2.2 |
| 2.4 | Create `admission-actions.ts` — `publishCampaignAction` with validation | 2h | 2.2 |
| 2.5 | Create `admission-actions.ts` — `closeCampaignAction`, `archiveCampaignAction` | 1h | 2.2 |
| 2.6 | Create `admission-actions.ts` — `addQuestionsToCampaignAction` | 2h | 2.2 |
| 2.7 | Create `admission-actions.ts` — `configureScholarshipTiersAction` | 2h | 2.2 |
| 2.8 | Create `admission-fetch-actions.ts` — all read queries | 3h | 1.14 |
| 2.9 | Create `admission-types.ts` — TypeScript interfaces | 1h | — |
| 2.10 | Create admin route layout: `/admin/admissions/layout.tsx` | 1h | — |
| 2.11 | Create campaign list page: `/admin/admissions/page.tsx` | 3h | 2.8 |
| 2.12 | Create `CampaignStatsCards` component | 1h | 2.8 |
| 2.13 | Create `CampaignTable` with filters (nuqs) | 3h | 2.8 |
| 2.14 | Create `CampaignStatusBadge` component | 0.5h | — |
| 2.15 | Create campaign create wizard (5 steps) | 8h | 2.2, 2.6, 2.7 |
| 2.16 | Create campaign detail layout with tabs | 2h | 2.8 |
| 2.17 | Create campaign overview tab | 3h | 2.8 |
| 2.18 | Create questions tab (reuse QuestionBankTable + assignment) | 4h | 2.6 |
| 2.19 | Create scholarship tiers configuration tab | 3h | 2.7 |
| 2.20 | Create TanStack Query hooks: `use-campaigns.ts` | 2h | 2.8 |
| 2.21 | Add sidebar navigation link for admissions | 0.5h | — |

**Deliverable:** Admin can create, configure, publish, and manage campaigns.

---

## 5. Phase 3: Public Portal — Registration (Weeks 5-6)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 3.1 | Create `src/modules/public-portal/portal-schemas.ts` | 2h | — |
| 3.2 | Create `portal-actions.ts` — `registerApplicantAction` | 4h | 3.1, 0.8, 0.9 |
| 3.3 | Create `portal-actions.ts` — `verifyOtpAction`, `resendOtpAction` | 3h | 3.2 |
| 3.4 | Create email templates: OTP, registration confirmation | 2h | 0.7 |
| 3.5 | Create public portal layout: `/apply/layout.tsx` | 2h | — |
| 3.6 | Create `SchoolBranding` component (logo + name) | 1h | — |
| 3.7 | Create campaign listing page: `/apply/page.tsx` | 3h | 2.8 |
| 3.8 | Create campaign detail page: `/apply/[slug]/page.tsx` | 3h | 2.8 |
| 3.9 | Create multi-step registration form with react-hook-form | 6h | 3.2 |
| 3.10 | Integrate Turnstile CAPTCHA in registration form | 1h | 0.8 |
| 3.11 | Create OTP verification page: `/apply/[slug]/verify/page.tsx` | 3h | 3.3 |
| 3.12 | Create OTP input component (6-digit) | 1h | — |
| 3.13 | Create `portal-fetch-actions.ts` — public read queries | 2h | 1.14 |
| 3.14 | Implement registration number generation | 1h | — |
| 3.15 | Test full registration flow end-to-end | 2h | 3.2-3.12 |

**Deliverable:** Public users can browse campaigns, register, verify email via OTP.

---

## 6. Phase 4: Public Portal — Test Taking (Weeks 6-7)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 4.1 | Create `portal-actions.ts` — `startTestSessionAction` | 3h | 3.3 |
| 4.2 | Create `portal-actions.ts` — `submitAnswerAction` (individual) | 2h | 4.1 |
| 4.3 | Create `portal-actions.ts` — `submitTestAction` (bulk final) | 3h | 4.1 |
| 4.4 | Create `portal-actions.ts` — `batchSaveAnswers` (debounced batch) | 2h | 4.1 |
| 4.5 | Create test-taking Zustand store (`useTestStore`) | 3h | — |
| 4.6 | Create test container page: `/apply/[slug]/test/page.tsx` | 2h | 4.1 |
| 4.7 | Create `QuestionRenderer` component (MCQ + subjective) | 4h | — |
| 4.8 | Create `QuestionNavigator` component (grid buttons) | 2h | — |
| 4.9 | Create `TestTimer` component (countdown) | 2h | — |
| 4.10 | Create `AnswerInput` component (radio for MCQ, textarea for subjective) | 2h | — |
| 4.11 | Create `SubmitConfirmation` dialog | 1h | — |
| 4.12 | Implement auto-save (debounced 5s save to server) | 2h | 4.4, 4.5 |
| 4.13 | Implement server-side time validation | 1h | 4.1 |
| 4.14 | Send test access link email when campaign goes TEST_ACTIVE | 2h | 3.4 |
| 4.15 | Create test submitted confirmation page | 1h | 4.3 |
| 4.16 | Test full test-taking flow end-to-end | 3h | 4.1-4.15 |

**Deliverable:** Applicants can take the test with timer, auto-save, and submit.

---

## 7. Phase 5: Grading Pipeline (Weeks 8-9)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 5.1 | Create `admission-grading.ts` — `autoGradeAdmissionMcqs` | 3h | 1.15, 4.3 |
| 5.2 | Create `admission-grading.ts` — `aiGradeAdmissionSubjective` | 4h | 1.15 |
| 5.3 | Implement negative marking in `gradeMcqAnswers` core | 2h | 1.15 |
| 5.4 | Create `admission-grading.ts` — `calculateAdmissionResult` | 3h | 5.1, 5.2 |
| 5.5 | Create batch grading: `batchAutoGradeMcqs` | 2h | 5.1 |
| 5.6 | Create batch AI grading: `batchAiGradeSubjective` with concurrency | 3h | 5.2 |
| 5.7 | Create `batchGradeAdmissionCampaign` orchestrator | 2h | 5.5, 5.6 |
| 5.8 | Create auto-submit cron job for expired sessions | 2h | — |
| 5.9 | Create campaign status transition cron job | 2h | — |
| 5.10 | Create admission grading dashboard tab UI | 4h | 5.1, 5.2 |
| 5.11 | Create grading progress indicator (batch progress bar) | 2h | 5.7 |
| 5.12 | Create manual grade review UI for low-confidence AI grades | 4h | 5.2 |
| 5.13 | Server actions for admin: `runBatchGradingAction`, `overrideGradeAction` | 3h | 5.7 |
| 5.14 | Test grading pipeline with 100+ mock sessions | 3h | 5.1-5.7 |

**Deliverable:** Complete grading pipeline — MCQ auto, AI subjective, manual review, batch processing.

---

## 8. Phase 6: Merit List & Decisions (Weeks 9-10)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 6.1 | Create `generateMeritRankings` function | 3h | 5.4 |
| 6.2 | Create `admission-actions.ts` — `generateMeritListAction` | 1h | 6.1 |
| 6.3 | Create `admission-actions.ts` — `makeDecisionAction` (single) | 2h | 6.1 |
| 6.4 | Create `admission-actions.ts` — `bulkDecisionAction` | 3h | 6.3 |
| 6.5 | Create `admission-actions.ts` — `promoteWaitlistedAction` | 2h | 6.4 |
| 6.6 | Create merit list tab UI (`/campaigns/[id]/merit`) | 5h | 6.1, 6.2 |
| 6.7 | Create `MeritListTable` with rank, score, decision columns | 3h | 6.6 |
| 6.8 | Create `MeritQuickActions` ("Accept top N" form) | 2h | 6.4 |
| 6.9 | Create `DecisionDialog` (individual/bulk decision modal) | 3h | 6.3, 6.4 |
| 6.10 | Create applicant detail page (`/applicants/[id]`) | 4h | 2.8 |
| 6.11 | Create bulk actions bar for applicant list | 2h | 6.4 |
| 6.12 | Create decision email templates (accepted, rejected, waitlisted) | 2h | 0.7 |
| 6.13 | Send decision emails after bulk/single decision | 2h | 6.12 |
| 6.14 | Create result checker page: `/results/page.tsx` | 3h | — |
| 6.15 | Create result display page: `/results/[token]/page.tsx` | 4h | — |
| 6.16 | Create `portal-actions.ts` — `checkResultAction` | 2h | — |

**Deliverable:** Merit list, accept/reject/waitlist, result publishing, applicant result portal.

---

## 9. Phase 7: Scholarship System (Weeks 10-11)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 7.1 | Create `autoAssignScholarships` function | 4h | 6.1 |
| 7.2 | Create `admission-actions.ts` — `autoAssignScholarshipsAction` | 1h | 7.1 |
| 7.3 | Create `admission-actions.ts` — `manualAssignScholarshipAction` | 2h | — |
| 7.4 | Create `admission-actions.ts` — `revokeScholarshipAction` | 1h | — |
| 7.5 | Create `handleScholarshipDecline` with cascade to next eligible | 3h | 7.1 |
| 7.6 | Create scholarships tab UI (`/campaigns/[id]/scholarships`) | 4h | 7.1 |
| 7.7 | Create `ScholarshipAssignmentTable` component | 3h | 7.6 |
| 7.8 | Create `ScholarshipStatsCards` component | 2h | 7.6 |
| 7.9 | Create `AutoAssignDialog` (confirm + run) | 1h | 7.2 |
| 7.10 | Create scholarship offered email template | 1h | 0.7 |
| 7.11 | Add scholarship accept/decline UI to result display page | 3h | 6.15, 7.5 |
| 7.12 | Create `portal-actions.ts` — `respondToScholarshipAction` | 2h | 7.5 |
| 7.13 | Test full scholarship flow: assign → offer → accept/decline → cascade | 3h | 7.1-7.12 |

**Deliverable:** Scholarship tiers auto-assigned, applicant accept/decline, cascade offer system.

---

## 10. Phase 8: Enrollment Conversion (Week 12)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 8.1 | Create `convertApplicantToStudent` function | 4h | 6.4 |
| 8.2 | Create `admission-actions.ts` — `enrollApplicantAction` | 2h | 8.1 |
| 8.3 | Create `admission-actions.ts` — `bulkEnrollAction` | 3h | 8.1 |
| 8.4 | Create enrollment tab UI (`/campaigns/[id]/enrollment`) | 4h | 8.1 |
| 8.5 | Create `EnrollDialog` (class/section picker) | 2h | 8.2 |
| 8.6 | Create `BulkEnrollForm` | 2h | 8.3 |
| 8.7 | Create enrollment welcome email template | 1h | 0.7 |
| 8.8 | Send welcome email with login credentials on enrollment | 2h | 8.7 |
| 8.9 | Update applicant status to ENROLLED after conversion | 0.5h | 8.1 |
| 8.10 | Create application tracker page: `/track/[token]/page.tsx` | 3h | — |
| 8.11 | Test enrollment: applicant → User + StudentProfile creation | 2h | 8.1-8.9 |

**Deliverable:** Accepted applicants converted to enrolled students with credentials.

---

## 11. Phase 9: Analytics & Reporting (Week 13)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 9.1 | Create `admission-analytics.ts` — all query functions | 4h | All data phases |
| 9.2 | Create analytics tab UI (`/campaigns/[id]/analytics`) | 4h | 9.1 |
| 9.3 | Create `RegistrationFunnelChart` (Recharts) | 2h | 9.1 |
| 9.4 | Create `ScoreDistributionChart` (Recharts bar chart) | 2h | 9.1 |
| 9.5 | Create `RegistrationTimelineChart` (Recharts line chart) | 2h | 9.1 |
| 9.6 | Create `QuestionAnalyticsTable` (per-question accuracy) | 2h | 9.1 |
| 9.7 | Create `DecisionPieChart` | 1h | 9.1 |
| 9.8 | Create CSV export functions (merit, applicants, scholarships) | 3h | — |
| 9.9 | Create export buttons with download handlers | 1h | 9.8 |
| 9.10 | Add cross-campaign comparison view | 3h | 9.1 |
| 9.11 | Add analytics to main admissions dashboard page | 2h | 9.1-9.7 |

**Deliverable:** Full analytics dashboard with charts, stats, and CSV export.

---

## 12. Phase 10: Security Hardening & Polish (Weeks 14-15)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 10.1 | Add rate limiting to ALL public endpoints | 3h | 0.9 |
| 10.2 | Add CAPTCHA to registration + result check forms | 2h | 0.8 |
| 10.3 | Hash access tokens in DB (store only hash) | 2h | — |
| 10.4 | Implement CSP headers for public routes | 1h | — |
| 10.5 | Add `X-Frame-Options`, `HSTS` headers | 0.5h | — |
| 10.6 | Implement suspicious activity detection (tab switches) | 3h | 4.5 |
| 10.7 | Implement session flagging + admin review UI | 3h | 10.6 |
| 10.8 | Add audit logging to all admin mutation actions | 2h | — |
| 10.9 | Redact PII from all log outputs | 1h | — |
| 10.10 | Add security event monitoring (alerts for rate limit hits) | 2h | 0.9 |
| 10.11 | Input sanitization on all string fields | 1h | — |
| 10.12 | Verify cross-campaign data isolation (no leakage) | 2h | — |
| 10.13 | UI polish: loading states, error states, empty states | 4h | — |
| 10.14 | Responsive design for public portal (mobile-friendly) | 3h | — |
| 10.15 | Accessibility audit (ARIA labels, keyboard navigation) | 2h | — |

**Deliverable:** Production-ready security, polished UI, mobile-friendly.

---

## 13. Phase 11: Testing & QA (Weeks 15-16)

| Task | Description | Effort | Depends On |
|------|-------------|--------|------------|
| 11.1 | Unit tests for `grading-core.ts` (pure functions) | 3h | 1.15 |
| 11.2 | Unit tests for `admission-grading.ts` (adapter) | 3h | 5.1-5.4 |
| 11.3 | Unit tests for Zod schemas (all edge cases) | 2h | 2.1, 3.1 |
| 11.4 | Integration tests for campaign CRUD actions | 3h | Phase 2 |
| 11.5 | Integration tests for registration + OTP flow | 3h | Phase 3 |
| 11.6 | Integration tests for test-taking flow | 3h | Phase 4 |
| 11.7 | Integration tests for decision + enrollment flow | 3h | Phases 6-8 |
| 11.8 | E2E test: full lifecycle (register → test → grade → decide → enroll) | 4h | All phases |
| 11.9 | Load testing: 500 concurrent test-takers simulation | 4h | Phase 4 |
| 11.10 | Security testing: rate limits, token security, injection | 3h | Phase 10 |
| 11.11 | Cross-browser testing (Chrome, Firefox, Safari, Edge) | 2h | — |
| 11.12 | Mobile testing (iOS Safari, Android Chrome) | 2h | — |
| 11.13 | Seed data script for admission system | 3h | 1.14 |
| 11.14 | Fix all bugs found during testing | 8h | 11.1-11.12 |
| 11.15 | Final regression test of existing exam system | 2h | All phases |

**Deliverable:** Comprehensive test coverage, no regressions, production confidence.

---

## 14. Dependency Graph

```
Phase 0 (Foundation)
  │
  ├─→ Phase 1 (DB + Grading Core) ─────→ Phase 5 (Grading Pipeline)
  │     │                                        │
  │     └─→ Phase 2 (Campaign Admin) ──→ Phase 6 (Merit + Decisions)
  │           │                                  │
  │           └─→ Phase 3 (Registration) ──→ Phase 7 (Scholarships)
  │                 │                            │
  │                 └─→ Phase 4 (Test Taking) ─→ Phase 8 (Enrollment)
  │                                                    │
  │                                              Phase 9 (Analytics)
  │                                                    │
  └───────────────────────────────────────→ Phase 10 (Security)
                                                       │
                                                 Phase 11 (Testing)
```

---

## 15. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI grading API rate limits | Grading delayed | Medium | Concurrency limit + batch retry |
| DB connection exhaustion under load | Service down | Medium | Connection pooler (PgBouncer) |
| Email delivery failures | Applicants miss notifications | Low | Retry queue + fallback SMS |
| Existing exam system regression | Core feature broken | Low | Integration tests before/after |
| CAPTCHA blocks legitimate users | Lost registrations | Low | Fallback to email-only verification |
| Question leak via inspect/scrape | Test integrity compromised | Medium | Rate limit + watermarking (future) |
| Negative marking edge cases | Wrong scores | Low | Extensive unit tests with edge cases |
| Scholarship cascade infinite loop | System hang | Very Low | Max cascade depth limit (10) |

---

## 16. Definition of Done (Per Phase)

Each phase is considered DONE when:
- [ ] All tasks in the phase are implemented
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No ESLint errors
- [ ] Basic manual testing passes (happy path)
- [ ] Code reviewed for architectural consistency
- [ ] Existing features not broken (quick regression check)

---

## 17. Estimated Total Effort

| Category | Hours |
|----------|-------|
| Database & schema | 15h |
| Server actions & business logic | 80h |
| Frontend pages & components | 100h |
| Email templates | 12h |
| Caching & performance | 10h |
| Security | 20h |
| Testing | 45h |
| Integration & polish | 20h |
| **Total** | **~300h** |

At 20h/week development pace: **~15 weeks / ~4 months**
At 40h/week full-time: **~8 weeks / ~2 months**
