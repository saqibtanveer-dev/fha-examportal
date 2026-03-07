# Fee Management — Module Structure

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 6. Module Structure — File-Level Breakdown

```
src/modules/fees/
├── fees.types.ts                      # Domain types (FeeAssignmentWithDetails, PaymentSummary, FamilyFeeOverview, etc.)
├── fees.constants.ts                  # Module constants (status colors, frequency labels, allocation strategies, etc.)
├── fees.utils.ts                      # Pure utility functions (amount formatting, due date calculation, status resolution)
├── allocation-engine.ts               # Payment allocation logic: oldest-first, child-priority, equal-split, manual
│
├── fee-category-queries.ts            # Prisma queries for fee categories
├── fee-category-actions.ts            # 'use server' mutations for categories
├── fee-category-fetch-actions.ts      # 'use server' read-only for categories
│
├── fee-structure-queries.ts           # Prisma queries for fee structures
├── fee-structure-actions.ts           # 'use server' mutations for structures
├── fee-structure-fetch-actions.ts     # 'use server' read-only for structures
│
├── fee-assignment-queries.ts          # Prisma queries for assignments (student-level + class-level aggregations)
├── fee-assignment-actions.ts          # 'use server' mutations (generate, apply discount, penalty)
├── fee-assignment-fetch-actions.ts    # 'use server' read-only for assignments
│
├── fee-payment-queries.ts             # Prisma queries for individual student payments
├── fee-payment-actions.ts             # 'use server' mutations (record student payment, reverse payment)
├── fee-payment-fetch-actions.ts       # 'use server' read-only (payment history, receipt data)
│
├── family-payment-queries.ts          # Prisma queries for family-level payments (by family, by session)
├── family-payment-actions.ts          # 'use server' mutations (record family payment, reverse family payment, reallocate)
├── family-payment-fetch-actions.ts    # 'use server' read-only (family payment history, master receipt data)
│
├── fee-reports-queries.ts             # Complex aggregation queries (collection summary, defaulters, class-wise)
├── fee-reports-fetch-actions.ts       # 'use server' reporting actions
│
├── fee-receipt-service.ts             # Receipt number generation, receipt data assembly (individual + family)
│
├── hooks/
│   ├── index.ts                       # Barrel export
│   ├── use-fee-categories.ts          # React Query hooks for categories CRUD
│   ├── use-fee-structures.ts          # React Query hooks for structures
│   ├── use-fee-assignments.ts         # React Query hooks for assignments
│   ├── use-fee-payments.ts            # React Query hooks for payment recording + history
│   ├── use-family-payments.ts         # React Query hooks for family payment recording + history
│   ├── use-fee-reports.ts             # React Query hooks for reports/analytics (includes class reports)
│   └── use-fee-mutations.ts           # Mutation hooks (useServerAction wrappers for ALL fee mutations)
│
├── components/
│   ├── index.ts                       # Barrel export
│   │
│   │ # ─── Admin: Fee Category Management ───
│   ├── fee-category-list.tsx           # List/grid of fee categories
│   ├── fee-category-form.tsx           # Create/edit fee category dialog
│   │
│   │ # ─── Admin: Fee Structure Management ───
│   ├── fee-structure-table.tsx         # Table: class × category matrix with amounts
│   ├── fee-structure-form.tsx          # Create/edit fee structure dialog
│   ├── fee-structure-clone-dialog.tsx  # Clone structures from previous session
│   │
│   │ # ─── Admin: Fee Assignment & Generation ───
│   ├── fee-generation-form.tsx         # Bulk fee generation wizard
│   ├── fee-assignment-table.tsx        # Per-student fee assignment list with filters
│   ├── fee-discount-form.tsx           # Apply discount/waiver dialog
│   ├── fee-penalty-form.tsx            # Apply late fee dialog
│   │
│   │ # ─── Admin: Fee Collection (DUAL-MODE) ───
│   ├── fee-collection-mode-toggle.tsx  # [Student] [Family] mode toggle
│   ├── student-fee-search.tsx          # Search student for fee collection (student mode)
│   ├── family-fee-search.tsx           # Search family/guardian for fee collection (family mode)
│   ├── student-fee-summary.tsx         # Single student's fee overview when collecting
│   ├── family-fee-overview.tsx         # All children's fees consolidated when collecting (family mode)
│   ├── fee-collection-form.tsx         # Record payment form — adapts to student/family mode
│   ├── family-allocation-preview.tsx   # Shows per-child allocation preview before confirming family payment
│   ├── allocation-strategy-selector.tsx # Oldest-first / Child-priority / Equal / Manual selector
│   ├── payment-method-selector.tsx     # Cash/Bank/Cheque/Online selector
│   │
│   │ # ─── Admin: Reports & Analytics ───
│   ├── fee-collection-summary.tsx      # Collection dashboard (total/outstanding/overdue)
│   ├── fee-defaulters-table.tsx        # Defaulters list with export
│   ├── fee-class-comparison.tsx        # Class-wise collection comparison chart
│   ├── fee-class-detail-table.tsx      # Per-class detailed fee status table (drill-down)
│   ├── fee-section-comparison.tsx      # Section-wise breakdown within a class
│   ├── fee-monthly-trend-chart.tsx     # Monthly collection trend line chart
│   ├── fee-payment-mode-breakdown.tsx  # Direct vs Family payment analytics
│   │
│   │ # ─── Shared: Receipt ───
│   ├── fee-receipt-view.tsx            # Printable individual receipt component
│   ├── family-receipt-view.tsx         # Printable FAMILY master receipt (all children on one receipt)
│   ├── fee-receipt-print-button.tsx    # Print trigger
│   │
│   │ # ─── Shared: Student/Family Views ───
│   ├── fee-summary-card.tsx            # Overview card (total/paid/balance)
│   ├── fee-dues-list.tsx               # Upcoming/overdue dues list
│   ├── fee-payment-history.tsx         # Payment history table (shows receipt type: individual/family)
│   ├── fee-breakdown-table.tsx         # Category-wise breakdown
│   │
│   │ # ─── Shared: Reusable Primitives ───
│   ├── fee-status-badge.tsx            # PENDING/PARTIAL/PAID/OVERDUE badge
│   ├── fee-amount-display.tsx          # Formatted currency amount display
│   └── fee-filters.tsx                 # Date range, class, status filters
```
