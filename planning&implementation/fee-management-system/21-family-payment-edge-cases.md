# Fee Management — Family Payment Edge Cases

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 30. Family Payment Edge Cases — Comprehensive Reference

### Why This Section Exists

Family payments introduce combinatorial complexity that doesn't exist in simple per-student payments. Every edge case below has been identified from real-world Pakistani school scenarios. Each case includes: scenario, expected system behavior, admin workflow, and technical handling.

---

### Category 1: Payment Amount Edge Cases

#### EC-1: Overpayment Attempt

**Scenario**: Parent wants to pay Rs. 50,000 but total family outstanding is Rs. 45,000.

**System Behavior**:
- Validation rejects BEFORE allocation engine runs.
- Error: "Payment amount (Rs. 50,000) exceeds total family outstanding (Rs. 45,000). Maximum payable: Rs. 45,000."
- The amount field highlights red with the max amount shown.

**Rationale**: No advance payments in the system. If a parent wants to pay ahead, the admin must first generate future months' fees, THEN accept payment.

**Admin Workflow**: Inform parent of the maximum. If parent insists on paying ahead, generate next month's fees first.

---

#### EC-2: Payment Exactly Equals Total Outstanding

**Scenario**: Parent pays Rs. 45,000 = exact total outstanding for all 3 children.

**System Behavior**:
- All strategies produce the same result: every assignment is CLEARED.
- All children show Rs. 0 outstanding.
- Allocation preview shows all green checkmarks.
- Receipt shows "ALL FEES CLEARED" badge.

---

#### EC-3: Very Small Payment (Token Payment)

**Scenario**: Parent pays Rs. 500 but family outstanding is Rs. 1,50,000.

**System Behavior**:
- Accepted — no minimum payment amount. Schools accept whatever the parent can pay.
- OLDEST_FIRST: Rs. 500 goes to the single oldest assignment, makes it PARTIAL.
- EQUAL_SPLIT: Rs. 167 per child (3 children) — each gets a tiny partial payment.
- Admin should probably suggest Student Mode for such small amounts (only one child's fee dented).

**Technical Note**: EQUAL_SPLIT with very small amounts and many children creates many tiny FeePayment records. System should handle but admin should be aware.

---

#### EC-4: Rounding Issue in EQUAL_SPLIT

**Scenario**: Parent pays Rs. 10,000 for 3 children. 10,000 / 3 = 3,333.33...

**System Behavior**:
- Allocation: Child 1 gets Rs. 3,334, Child 2 gets Rs. 3,333, Child 3 gets Rs. 3,333.
- Remainder (Rs. 1) goes to the first child in alphabetical order.
- Total allocated = Rs. 10,000 exactly.
- Validation: `allocations.sum() === totalAmount` MUST be true.

**Implementation**: Use integer arithmetic (paisa = Rs. × 100). Or use Prisma Decimal and handle remainder explicitly.

---

### Category 2: Family Structure Edge Cases

#### EC-5: Only One Child Has Outstanding Balance

**Scenario**: Family has 3 children but 2 have fully paid fees. Only Ahmed has Rs. 5,000 outstanding.

**System Behavior**:
- Family mode still works, but:
  - Only Ahmed appears in the allocation preview.
  - EQUAL_SPLIT = OLDEST_FIRST = CHILD_PRIORITY — all produce same result (only one child).
  - System should show info: "Note: Only 1 of 3 children has outstanding fees."
- Admin might as well use Student Mode — system can suggest this.

---

#### EC-6: Child Added to Family Mid-Session

**Scenario**: New child (4th) joins the school in October. Family already has 3 children with partial payments made.

**System Behavior**:
- New child's fees are generated from their enrollment month.
- Previous family payments are unaffected.
- Next family payment will include the 4th child in the allocation if they have outstanding fees.
- No retroactive changes needed.

---

#### EC-7: Child Leaves School Mid-Session (Transfer/Dropout)

**Scenario**: One of 3 children leaves. Their fee status at departure:
- Paid: Rs. 3,000 | Dues: Rs. 2,000

**System Behavior**:
- Departed child's assignments marked appropriately (not CANCELLED — they were enrolled, fee was valid).
- If family makes a payment after child leaves:
  - The departed child's outstanding assignments are still in the system.
  - Allocation engine still includes them UNLESS admin manually cancels or writes off remaining assignments.
  - Admin should write off or settle the departed child's remaining dues before/during the family's next payment.

**Admin Workflow**:
1. Mark departed child's remaining assignments as CANCELLED (with reason: "Student transferred").
2. Now family payment only allocates to remaining 2 children.

---

#### EC-8: Siblings in Different Fee Structures

**Scenario**: Ahmed is in Class 5 (Rs. 5,000/month), Sara is in Class 8 (Rs. 8,000/month), Fatima is in Class 10 (Rs. 10,000/month).

**System Behavior**: Completely normal — allocation engine works with assignment balances, not fee structures. Different per-student amounts are handled transparently. The EQUAL_SPLIT strategy still splits the payment amount equally, NOT the fee structure amount. Each child's share is applied oldest-first within their assignments.

---

### Category 3: Timing Edge Cases

#### EC-9: Two Admins Process Same Family Simultaneously

**Scenario**: Admin A starts collecting family payment at Window 1. Admin B starts collecting for the same family at Window 2.

**System Behavior**:
- Both see the current outstanding balance when they load the page.
- Whichever submits first succeeds.
- The second submission:
  1. Re-fetches balances inside `$transaction`.
  2. If balances changed (because first payment was recorded), the re-calculated allocation differs from preview.
  3. Server returns: "Family outstanding has changed since preview. Previous: Rs. 45,000. Current: Rs. 30,000. Please refresh and try again."
  4. Transaction is rolled back.
  5. Admin B refreshes, sees updated balances, creates new payment.

**Technical Handling**: Covered in `15-concurrency-performance.md` — server-side re-validation inside Prisma `$transaction` with SELECT ... FOR UPDATE on relevant FeeAssignment rows.

---

#### EC-10: Payment Made Between Fee Generation and Due Date

**Scenario**: Fees generated on 1st of month. Parent pays on 2nd. Due date is 10th.

**System Behavior**: Normal payment. Status moves from PENDING to PAID (if full) or PARTIAL. No late fees involved because payment is before due date.

---

#### EC-11: Family Payment Straddles Month Boundary

**Scenario**: Parent pays on Jan 31 for December's fees. New fees for January are generated on Feb 1.

**System Behavior**: 
- January 31 payment records against December assignments (which are OVERDUE by then).
- February 1 fee generation creates new January assignments.
- Next family payment on Feb 15 would show both December remaining (if any) AND January fees.
- OLDEST_FIRST would prioritize December assignments first.

---

### Category 4: Reversal Edge Cases

#### EC-12: Full Family Payment Reversal

**Scenario**: Payment of Rs. 15,000 recorded yesterday. Cheque bounced today. Admin reverses.

**System Behavior**:
- Admin clicks "Reverse" on the FamilyPayment record.
- System reverses ALL child FeePayments linked to this FamilyPayment.
- For each child payment:
  - FeePayment.status → REVERSED
  - FeeAssignment.paidAmount -= payment.amount
  - FeeAssignment.balanceAmount += payment.amount
  - FeeAssignment.status recalculated (might go back to PENDING/OVERDUE/PARTIAL)
- FamilyPayment.status → REVERSED
- Reversal receipt generated (negative amounts) with reference to original receipt.

**CRITICAL RULE**: Family payment reversal is ALL-or-NOTHING. Cannot reverse one child's payment while keeping others. If admin needs partial reversal, they must reverse the full family payment and re-record a new one with adjusted amounts.

---

#### EC-13: Reversal After Subsequent Payment

**Scenario**: 
- Day 1: Family pays Rs. 15,000 (allocated: Ahmed 7K, Sara 8K)
- Day 3: Sara's individual payment of Rs. 5,000 (Student Mode)
- Day 5: Day 1's cheque bounces. Admin needs to reverse the family payment.

**System Behavior**:
- Reverse the family payment: Ahmed's Rs. 7,000 reversed, Sara's Rs. 8,000 reversed.
- Sara's Day 3 individual payment is NOT affected — it's a separate FeePayment record.
- Sara's final state: assignments updated with Day 3 payment still applied.
- Ahmed's final state: back to what it was before Day 1's payment.

**The system handles this correctly because**:
- Each FeePayment is independent.
- FeeAssignment.paidAmount is an aggregate that's recalculated during reversal.
- No coupling between separate payments on the same assignment.

---

#### EC-14: Reversal When Assignment Was Fully Paid

**Scenario**: Assignment had Rs. 5,000 due. Family payment covered Rs. 3,000. Then student payment covered Rs. 2,000 (PAID status). Now family payment is reversed.

**After reversal**:
- FeeAssignment.paidAmount: 5,000 - 3,000 = 2,000
- FeeAssignment.balanceAmount: 0 + 3,000 = 3,000
- FeeAssignment.status: PAID → PARTIAL (because 2,000 < 5,000)

---

### Category 5: Reallocation Edge Cases

#### EC-15: Parent Wants to Change Allocation After Payment

**Scenario**: Family payment of Rs. 15,000 was made with OLDEST_FIRST. Parent later says "Ahmed ki fees pehle clear honi chahiye thi."

**System Behavior**:
- Admin uses "Reallocate" action on the FamilyPayment.
- System reverses all child payments (internally, same as EC-12).
- Admin selects CHILD_PRIORITY with Ahmed first.
- System re-runs allocation engine with the new strategy.
- New child payments are created.
- FamilyPayment record updated with new allocationDetails.
- Master receipt number remains the same (same logical payment).

**Important**: Reallocation is a reversal + re-recording in a single transaction. The FamilyPayment wrapper record persists — only its children change.

---

#### EC-16: Reallocation When Balances Changed

**Scenario**: Family payment of Rs. 15,000 made on Monday. On Tuesday, admin applies Rs. 2,000 discount to one of Sara's assignments. On Wednesday, parent asks for reallocation.

**System Behavior**:
- When reallocation starts, the system fetches CURRENT assignment balances (which reflect the discount).
- The reallocation may produce different results than the original (because Sara's total outstanding changed).
- System informs admin: "Note: Current outstanding amounts differ from original payment time. Reallocating with current balances."
- Admin reviews and confirms.

---

### Category 6: Special Situations

#### EC-17: Family Payment for Scholarship Student

**Scenario**: One of 3 children has a 50% scholarship. Parent pays for all 3.

**System Behavior**:
- The scholarship child's FeeAssignments already have reduced `totalAmount` (scholarship discount applied at generation time).
- Allocation engine works on `balanceAmount` which already reflects the discount.
- No special handling needed — the engine sees a lower balance for the scholarship child and allocates accordingly.

---

#### EC-18: Mixed Payment Methods in One Family Payment

**Scenario**: Parent pays Rs. 30,000 — Rs. 20,000 cash + Rs. 10,000 bank transfer.

**System Behavior for V1**: NOT SUPPORTED. One family payment = one payment method. If parent pays with mixed methods:
- Admin records two separate family payments: Rs. 20,000 cash and Rs. 10,000 bank.
- OR admin records one as family (larger) and one as student-mode for specific child (smaller).

**Future consideration**: Allow multiple payment methods per family payment. But this adds significant complexity to the receipt system and is deferred.

---

#### EC-19: Family Payment When One Child is Suspended/Inactive

**Scenario**: Ahmed is temporarily suspended but still has outstanding fees.

**System Behavior**:
- Suspended students' assignments are NOT automatically cancelled. They still exist.
- If admin includes Ahmed in the family payment, his assignments get paid normally.
- If admin wants to exclude Ahmed, they should cancel his assignments first.
- The allocation engine doesn't filter by student status — it works on whatever assignments are provided to it.

**Admin Workflow**: Before family payment, if a child should be excluded, admin should handle their assignments separately (cancel, defer, etc).

---

#### EC-20: Bulk Family Payment Processing

**Scenario**: Multiple families made bank transfers. Admin needs to process 50 family payments in one sitting.

**System Behavior**: No bulk family payment feature in V1. Each family payment is processed individually. 

**Rationale**: Family payments have variable allocation strategies, require per-family review, and each parent may have different instructions. Bulk processing would require assumptions that may be wrong.

**Future**: A "Bank Reconciliation" feature that matches bank statement entries to families and suggests payments for admin approval.

---

### Edge Case Quick Reference Table

| # | Edge Case | Resolution | Mode |
|---|-----------|-----------|------|
| 1 | Overpayment | Reject, show max | Both |
| 2 | Exact match | All clear, green | Family |
| 3 | Token payment | Accept, oldest first | Family |
| 4 | Rounding (split) | Remainder to first child | Family |
| 5 | One child has balance | Works, suggest student mode | Family |
| 6 | New child mid-session | Included in next payment | Family |
| 7 | Child leaves | Admin cancels remaining | Both |
| 8 | Different fee structures | Transparent, no issue | Family |
| 9 | Concurrent admins | Second fails, refresh | Family |
| 10 | Before due date | Normal, no late fee | Both |
| 11 | Month boundary | OLDEST_FIRST handles it | Family |
| 12 | Full reversal | ALL-or-NOTHING | Family |
| 13 | Reversal after other payment | Independent, no coupling | Family |
| 14 | Reversal when fully paid | Status recalculated | Family |
| 15 | Reallocation request | Reverse + re-record | Family |
| 16 | Reallocation with balance change | Warn, use current balances | Family |
| 17 | Scholarship child | Already reflected in balance | Family |
| 18 | Mixed payment methods | Two separate payments V1 | Both |
| 19 | Suspended child | Admin must handle separately | Family |
| 20 | Bulk processing | Not in V1, one-by-one | Family |
