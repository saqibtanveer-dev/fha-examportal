# Fee Management — Implementation Roadmap

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 26. Implementation Roadmap

### Phase 1: Database & Foundation (2-3 days)

- [ ] Add all new enums to `schema.prisma` (including `AllocationStrategy`)
- [ ] Add all new models to `schema.prisma` (9 models: FeeCategory, FeeStructure, FeeAssignment, FeeLineItem, FeeDiscount, FeePayment, FeeTransaction, FamilyPayment, FeeSettings)
- [ ] Add relations to existing models (StudentProfile, Class, AcademicSession, FamilyProfile)
- [ ] Add new NotificationType values (including FEE_FAMILY_PAYMENT_RECEIVED)
- [ ] Run migration: `add_fee_management_system`
- [ ] Add fee seed data to `seed.ts` (default FeeSettings with both receipt prefixes)
- [ ] Create `src/modules/fees/` directory structure
- [ ] Create `fees.types.ts` with all domain types (including FamilyFeeOverview, ChildAllocation, etc.)
- [ ] Create `fees.constants.ts` with status colors, frequency labels, currency formatting, allocation strategy labels
- [ ] Create `fees.utils.ts` with amount formatting, status resolution, date helpers
- [ ] Create `allocation-engine.ts` with all 4 strategies (OLDEST_FIRST, CHILD_PRIORITY, EQUAL_SPLIT, MANUAL)
- [ ] Create `src/validations/fee-schemas.ts` with all Zod schemas (including family payment schemas)
- [ ] Add `fees.*` query keys to `src/lib/query-keys.ts` (including familyPayments keys)
- [ ] Add fee routes to `src/lib/constants.ts`
- [ ] Add fee nav items to all role navigation configs

### Phase 2: Query & Action Layer (3-4 days)

- [ ] Create `fee-category-queries.ts`
- [ ] Create `fee-category-actions.ts` + `fee-category-fetch-actions.ts`
- [ ] Create `fee-structure-queries.ts`
- [ ] Create `fee-structure-actions.ts` + `fee-structure-fetch-actions.ts`
- [ ] Create `fee-assignment-queries.ts` (including class-level aggregations)
- [ ] Create `fee-assignment-actions.ts` + `fee-assignment-fetch-actions.ts`
- [ ] Create `fee-payment-queries.ts`
- [ ] Create `fee-payment-actions.ts` (student mode) + `fee-payment-fetch-actions.ts`
- [ ] Create `family-payment-queries.ts` (family outstanding, history, receipt)
- [ ] Create `family-payment-actions.ts` (record, reverse, reallocate) + `family-payment-fetch-actions.ts`
- [ ] Create `fee-reports-queries.ts` (class-wise, section-wise, drill-down, payment mode breakdown)
- [ ] Create `fee-reports-fetch-actions.ts` (all report actions including class detail + section)
- [ ] Create `fee-receipt-service.ts` (receipt number generation for BOTH individual + family receipts)
- [ ] Add audit logging to ALL mutation actions
- [ ] Add notification triggers to ALL payment/discount actions

### Phase 3: React Hooks Layer (1-2 days)

- [ ] Create `hooks/use-fee-categories.ts`
- [ ] Create `hooks/use-fee-structures.ts`
- [ ] Create `hooks/use-fee-assignments.ts`
- [ ] Create `hooks/use-fee-payments.ts`
- [ ] Create `hooks/use-family-payments.ts` (history, outstanding, summary, master receipt)
- [ ] Create `hooks/use-fee-reports.ts` (including class detail, section-wise, payment mode breakdown)
- [ ] Create `hooks/use-fee-mutations.ts` (including family payment mutations)
- [ ] Create `hooks/index.ts` barrel export

### Phase 4: Admin UI — Configuration (2-3 days)

- [ ] Create `/admin/fees/page.tsx` (hub with overview cards + payment mode stats)
- [ ] Create `/admin/fees/loading.tsx`
- [ ] Create fee category components (list, form)
- [ ] Create `/admin/fees/categories/page.tsx`
- [ ] Create fee structure components (table, form, clone dialog)
- [ ] Create `/admin/fees/structures/page.tsx`
- [ ] Create fee settings components
- [ ] Create `/admin/fees/settings/page.tsx`

### Phase 5: Admin UI — Fee Generation & Collection (3-4 days)

- [ ] Create fee generation wizard component
- [ ] Create `/admin/fees/generate/page.tsx`
- [ ] Create `fee-collection-mode-toggle.tsx` (Student/Family toggle)
- [ ] Create `student-fee-search.tsx` (student mode search)
- [ ] Create `family-fee-search.tsx` (family mode search by guardian)
- [ ] Create `student-fee-summary.tsx` (single student overview)
- [ ] Create `family-fee-overview.tsx` (all children consolidated view)
- [ ] Create `allocation-strategy-selector.tsx` (4 strategy radio group)
- [ ] Create `family-allocation-preview.tsx` (per-child allocation preview)
- [ ] Create `fee-collection-form.tsx` (adapts to student/family mode)
- [ ] Create `payment-method-selector.tsx`
- [ ] Create `/admin/fees/collect/page.tsx` (dual-mode collection)
- [ ] Create fee discount form dialog
- [ ] Create fee penalty form dialog
- [ ] Create fee assignment table with actions

### Phase 6: Receipt System (1-2 days)

- [ ] Create `fee-receipt-view.tsx` (printable HTML receipt — individual)
- [ ] Create `family-receipt-view.tsx` (printable HTML receipt — family master receipt)
- [ ] Create `fee-receipt-print-button.tsx`
- [ ] Create print CSS (A4, margins, dual copy — works for both receipt types)
- [ ] Wire receipt generation into payment flow (both student + family modes)
- [ ] Add receipt view/print in payment history (detect RCP- vs FRCP- and render appropriate component)

### Phase 7: Admin UI — Reports & Analytics (2-3 days)

- [ ] Create collection overview cards component
- [ ] Create payment mode breakdown component (direct vs family analytics)
- [ ] Create monthly trend line chart component (Recharts)
- [ ] Create class-wise table + bar chart component (CLICKABLE — drill-down)
- [ ] Create class fee detail component (drill-down: section + category + student table)
- [ ] Create section-wise comparison component
- [ ] Create fee defaulters table with CSV export
- [ ] Create scholarship impact summary component
- [ ] Create `/admin/fees/reports/page.tsx` (with drill-down navigation)

### Phase 8: Student & Family UI (2-3 days)

- [ ] Create shared fee summary card component
- [ ] Create shared fee dues list component
- [ ] Create shared payment history component (shows both RCP- and FRCP- receipts)
- [ ] Create shared fee breakdown table component
- [ ] Create `/student/fees/page.tsx`
- [ ] Create family fee overview component (all children cards + per-child selector)
- [ ] Create family payment history component (shows FamilyPayment records)
- [ ] Create `/family/fees/page.tsx` (with child selector + family receipt links)
- [ ] Add fee widget to family dashboard overview

### Phase 9: Principal UI (1 day)

- [ ] Create `/principal/fees/page.tsx` (read-only reports dashboard with class drill-down)
- [ ] Reuse all admin report components with principal-appropriate permissions (no action buttons)

### Phase 10: Integration & Polish (1-2 days)

- [ ] Scholarship-fee auto-discount integration
- [ ] Fee reminder notification cron/trigger
- [ ] Overdue status auto-update logic
- [ ] Add fee nav items to all role shells
- [ ] Add fee data to relevant dashboard overview pages
- [ ] Empty states for all fee views
- [ ] Loading skeletons for all fee pages
- [ ] Error boundaries for all fee routes
- [ ] Mobile responsive testing for all fee pages

---

## Summary Timeline

```
Phase 1:  Database & Foundation           ~2-3 days
Phase 2:  Query & Action Layer            ~3-4 days
Phase 3:  React Hooks Layer               ~1-2 days
Phase 4:  Admin UI — Configuration        ~2-3 days
Phase 5:  Admin UI — Collection (Dual)    ~3-4 days
Phase 6:  Receipt System (Both types)     ~1-2 days
Phase 7:  Admin UI — Reports (Drill-down) ~2-3 days
Phase 8:  Student & Family UI             ~2-3 days
Phase 9:  Principal UI                    ~1 day
Phase 10: Integration & Polish            ~1-2 days
──────────────────────────────────────────────────────
Total:    ~19-26 working days (~4-5.5 weeks)
```

---

## Definition of Done (Fee Module)

For every feature in this module:
- [ ] Functional implementation complete
- [ ] Edit/update flow exists (not just create)
- [ ] Loading state handled (loading.tsx or skeleton)
- [ ] Error state handled (error.tsx or try-catch with toast)
- [ ] Empty state handled (EmptyState component with action)
- [ ] Notification triggered where applicable
- [ ] Audit log written for EVERY financial mutation
- [ ] Mobile responsive
- [ ] No file exceeds 300 lines
- [ ] TypeScript strict — zero errors
- [ ] Toast feedback on all mutations
- [ ] Decimal precision verified (no floating-point)
- [ ] Transactional writes for all financial operations
- [ ] Receipt generated for every payment (individual + family)
- [ ] Family portal shows aggregated data across children
- [ ] Family receipts show per-child breakdown
- [ ] Dual-mode collection UI works correctly
- [ ] Allocation engine tested with all 4 strategies
- [ ] Class drill-down reports work end-to-end
- [ ] Concurrency handling (optimistic locking or transaction isolation)
