# Fee Management — RBAC & Business Rules

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 19. RBAC & Authorization Matrix

| Resource | Action | Admin | Principal | Teacher | Student | Family |
|----------|--------|-------|-----------|---------|---------|--------|
| Fee Categories | CRUD | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Structures | CRUD | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Structures | View | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Assignments | Generate | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Assignments | View (all) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Assignments | View (own) | ❌ | ❌ | ❌ | ✅ | ❌ |
| Fee Assignments | View (child) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Fee Discounts | Apply | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Penalties | Apply | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Record (student mode) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Record (family mode) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Reverse (individual) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Reverse (family) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Reallocate (family) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | View (all) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Payments | View (own) | ❌ | ❌ | ❌ | ✅ | ❌ |
| Fee Payments | View (child) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Family Payments | View (own family) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Family Payments | View (all) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Receipts | Generate | ✅ | ❌ | ❌ | ❌ | ❌ |
| Receipts | View/Print (own) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Receipts | View/Print (any) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Full Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Class Report + Drill-Down | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Defaulters | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Payment Mode Analytics | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Settings | Configure | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Settings | View | ✅ | ✅ | ❌ | ❌ | ❌ |

### Teacher Explicitly Excluded

Teachers have ZERO access to fee data. This is intentional:
- Teachers should not know which students have fee issues — it can bias grading.
- Fee management is an administrative function, not academic.
- Schools handle fee inquiries through admin office, not classrooms.

### Family Authorization Rules

1. Family user can ONLY see fees for students linked via `FamilyStudentLink`.
2. Every fetch action for family must verify: `FamilyStudentLink.isActive = true && FamilyStudentLink.familyProfileId = currentUser.familyProfile.id`.
3. Family CANNOT see other students' fees — not even class averages.
4. Family data access is READ-ONLY — no payment recording, no discount requests.
5. Family CAN see their own FamilyPayment history and master receipts.

---

## 20. Business Rules & Edge Cases

### Fee Generation Rules

1. **No duplicate assignments.** If admin generates fees for "Class 5 - January 2026" twice, the second run skips students who already have an assignment for that period.
2. **Only ACTIVE students.** Fee assignments are generated only for `StudentProfile.status = ACTIVE`. Withdrawn/graduated students are excluded.
3. **Academic session scoping.** All fee operations are scoped to the current (or selected) academic session.
4. **Scholarship auto-apply.** If a student has an active `ApplicantScholarship` with `isAccepted = true`, the corresponding discount is auto-applied during generation.
5. **Structure required first.** Cannot generate assignments without at least one active `FeeStructure` for the selected class + session.

### Payment Recording Rules

1. **No overpayment.** Payment amount cannot exceed the sum of selected assignments' balance. If a parent overpays in real life, admin records exact balance and returns excess manually.
2. **Oldest-first allocation.** When paying for multiple periods, payment is allocated to the oldest (earliest due date) first. This ensures overdue fees are cleared first.
3. **Partial payments allowed (if enabled).** If `FeeSettings.enablePartialPayment = true`, admin can record Rs. 3,000 against a Rs. 5,000 fee.
4. **Receipt is non-negotiable.** Every payment MUST have a receipt number. Generated atomically.
5. **Payment date can be past.** Admin may need to enter yesterday's payment if they missed it. But NOT future dates.
6. **Cash needs no reference.** Bank transfer/cheque payments require reference number. Cash does not.

### Late Fee Rules

1. **Grace period first.** Late fee kicks in only after `gracePeriodDays` have passed since `dueDate`.
2. **Monthly late fee.** For ongoing overdue, late fee compounds monthly (not daily). Calculated as: `amount × lateFeePercentage × monthsOverdue` OR `lateFeeFixedAmount × monthsOverdue`.
3. **Admin override.** Admin can manually set or remove a late fee regardless of auto-calculation.
4. **No double penalty.** If late fee is already applied for a specific month, don't apply again.
5. **Global toggle.** If `FeeSettings.enableLateFee = false`, no late fees are ever applied.

### Discount & Waiver Rules

1. **Multiple discounts per assignment.** A student can have a scholarship discount + sibling discount on the same fee. They stack.
2. **Discount cannot exceed base amount.** Total `discountAmount` ≤ `baseAmount`. Prevents negative net amounts.
3. **Scholarship discounts are auto-applied.** Manual discounts are admin-applied.
4. **Waiver = 100% discount.** If admin waives a fee entirely, `status` becomes `WAIVED`.
5. **Revoking a discount.** Admin can deactivate (soft-delete) a discount. This triggers recalculation of `netAmount` and `balanceAmount`.

### Reversal Rules

1. **Reversals create COUNTER-entries.** Original payment stays. A new `FeeTransaction` with `type: REVERSAL` and positive amount is created.
2. **Must state reason.** Reversal reason is mandatory and stored in both the payment record and audit log.
3. **Cannot reverse a reversed payment.** Double-reversal is blocked.
4. **Recalculates assignment status.** After reversal, assignment goes back to PARTIAL or PENDING.

### Family Payment Specific Rules

1. **Family payment reversal is ALL-or-NOTHING.** Cannot reverse one child's portion of a family payment. Must reverse entire family payment. All linked FeePayments reversed atomically.
2. **Reallocation is allowed.** Admin CAN reallocate a family payment (change per-child distribution) without reversing the total. Same `masterReceiptNumber`, same total, different per-child split.
3. **No overpayment per family.** `totalAmount <= sum of all children's balanceAmount`. No family-level credit/wallet.
4. **Strategy is recorded.** The allocation strategy used is stored on FamilyPayment for audit/reference.
5. **Manual override always available.** Even after auto-allocation preview, admin can manually adjust any child's amount before confirming.

### General Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Student transfers mid-year | Remaining fee assignments stay (don't auto-delete). Admin manually waives or adjusts |
| Student admitted mid-term | Generate fees only from the month of admission — use `periodStartDate` |
| Scholarship revoked mid-year | Admin deactivates discount. Future assignments don't get scholarship. Past assignments stay |
| Fee structure amount changes after assignments generated | Existing assignments keep original amount. New assignments use new amount. Admin can manually adjust specific assignments |
| Two admins open same student's collection page | Optimistic locking on `FeeAssignment.updatedAt`. If concurrent write detected → reject with "Data changed, please refresh" |
| Parent claims "I already paid" but no record | Receipt number is proof. No receipt number = no payment record. Admin searches by reference/date to confirm |
| Decimal precision issues (Rs. 4,999.999) | All Decimal(12,2). Prisma handles precision. No floating-point arithmetic |
| Student has ZERO fees (all waived) | Valid state. Fee summary shows Rs. 0 payable, Rs. 0 balance |
| Multiple academic sessions active | UI enforces single-session context via session selector. All queries scoped |

### Family Payment Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Parent pays Rs. 15,000 but doesn't say for which child | Admin uses Family Mode → enters Rs. 15,000 → system auto-allocates with OLDEST_FIRST |
| Parent says "sab Ahmed ki fee hai, Sara ki nahi" | Admin uses Family Mode with MANUAL strategy → allocates all to Ahmed |
| Parent pays less than any single child's fee | System allocates partial to oldest child. E.g., Rs. 3,000 against Rs. 5,000 → PARTIAL for that child |
| Parent pays exact total of all children | All children go to PAID status. Clean allocation |
| Parent pays Rs. 1 (absurdly small amount) | Allowed (if partial payments enabled). Goes to oldest assignment as PARTIAL |
| Family has no outstanding fees | Reject: "No pending fees found for this family" |
| One child has all fees paid, others don't | System skips paid child, allocates only to children with pending fees |
| New child added to family mid-year | New child's fees are separate. Family payment sees new child's assignments going forward |
| Parent says "kal jo payment di thi wo sab galat thi" | Admin reverses entire family payment. All children's amounts restored |
| Parent says "wo jo kal paisa diye the, sab Ahmed ki thi Sara ki nahi" | Admin uses `reallocateFamilyPaymentAction` → reverses old split, creates new split, same receipt |
| Family has 5 children, parent pays for only 2 | Admin can use MANUAL strategy → allocate amounts only to 2 children (others get Rs. 0) |
| Parent comes multiple times in same day | Each visit is a separate FamilyPayment with separate master receipt. No merging |
| Family link deactivated after payment | Payment records stay intact. Historical data preserved. Family just can't make NEW payments |
