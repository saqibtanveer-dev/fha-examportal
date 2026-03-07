# Fee Management — Server Actions Design

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 7. Server Actions Design

### Fee Category Actions (`fee-category-actions.ts`)

```typescript
// All wrapped in safeAction()

createFeeCategoryAction(input: CreateFeeCategoryInput): ActionResult<FeeCategory>
  - requireRole('ADMIN')
  - Validate via feeCategorySchema
  - Check unique code
  - Create FeeCategory
  - Audit log: "FEE_CATEGORY_CREATED"
  - revalidatePath('/admin/fees')

updateFeeCategoryAction(input: UpdateFeeCategoryInput): ActionResult<FeeCategory>
  - requireRole('ADMIN')
  - Validate via feeCategorySchema
  - Check unique code (exclude self)
  - Update FeeCategory
  - Audit log: "FEE_CATEGORY_UPDATED"
  - revalidatePath('/admin/fees')

toggleFeeCategoryActiveAction(id: string): ActionResult<void>
  - requireRole('ADMIN')
  - Toggle isActive
  - If deactivating: check no active structures reference it
  - Audit log: "FEE_CATEGORY_TOGGLED"
  - revalidatePath('/admin/fees')
```

### Fee Structure Actions (`fee-structure-actions.ts`)

```typescript
createFeeStructureAction(input: CreateFeeStructureInput): ActionResult<FeeStructure>
  - requireRole('ADMIN')
  - Validate via feeStructureSchema
  - Check unique constraint (category + class + session)
  - Create FeeStructure
  - Audit log: "FEE_STRUCTURE_CREATED"
  - revalidatePath('/admin/fees/structures')

updateFeeStructureAction(input: UpdateFeeStructureInput): ActionResult<FeeStructure>
  - requireRole('ADMIN')
  - Validate via feeStructureSchema
  - Check: if assignments exist that reference this structure, warn (not block — amounts may need correction)
  - Update FeeStructure
  - Audit log: "FEE_STRUCTURE_UPDATED"
  - revalidatePath('/admin/fees/structures')

cloneFeeStructuresAction(input: CloneFeeStructuresInput): ActionResult<{ count: number }>
  - requireRole('ADMIN')
  - Input: sourceSessionId, targetSessionId, amountAdjustmentPercent (optional, e.g., +10% increase)
  - $transaction:
    - Fetch all structures from source session
    - Clone each to target session (with optional % adjustment)
    - Skip if already exists in target
  - Audit log: "FEE_STRUCTURES_CLONED"
  - Return count of cloned structures

deleteFeeStructureAction(id: string): ActionResult<void>
  - requireRole('ADMIN')
  - Check: no FeeAssignments reference this structure
  - If assignments exist → actionError("Cannot delete — fee assignments depend on this structure")
  - Delete FeeStructure
  - Audit log: "FEE_STRUCTURE_DELETED"
```

### Fee Assignment Actions (`fee-assignment-actions.ts`)

```typescript
generateFeeAssignmentsAction(input: GenerateFeeAssignmentsInput): ActionResult<{ count: number }>
  - requireRole('ADMIN')
  - Input: classId, sectionId?, academicSessionId, periodLabel, periodStartDate, periodEndDate
  - $transaction:
    - Fetch all active FeeStructures for class + session
    - Fetch all active students in class (+ section if provided)
    - For each student, for each structure:
      - Check if assignment already exists (skip if duplicate)
      - Create FeeAssignment with status PENDING
      - Create FeeLineItems per category
      - Auto-apply scholarship discount if student has active scholarship
      - Create FeeTransaction (type: CARRY_FORWARD if applicable)
    - Return count of assignments created
  - Audit log: "FEE_ASSIGNMENTS_GENERATED"
  - Create notifications for students + families: "Fee for {period} has been generated"

applyFeeDiscountAction(input: ApplyFeeDiscountInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: feeAssignmentId, discountType, percentage?, fixedAmount?, reason
  - $transaction:
    - Calculate discount amount
    - Create FeeDiscount record
    - Recalculate FeeAssignment: discountAmount, netAmount, balanceAmount
    - Create FeeTransaction (type: WAIVER, amount: -discountAmount)
    - If netAmount <= paidAmount → update status to PAID
  - Audit log: "FEE_DISCOUNT_APPLIED"
  - Notification to student + family

applyLateFeeAction(input: ApplyLateFeeInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: feeAssignmentId, amount, reason?
  - $transaction:
    - Add penalty to FeeAssignment.penaltyAmount
    - Recalculate netAmount, balanceAmount
    - Create FeeTransaction (type: PENALTY, amount: +penaltyAmount)
    - Update status if needed
  - Audit log: "LATE_FEE_APPLIED"
  - Notification to student + family

bulkApplyLateFeeAction(input: BulkLateFeeInput): ActionResult<{ count: number }>
  - requireRole('ADMIN')
  - Input: academicSessionId, periodLabel, overdueDate (calculate from due + grace)
  - Finds all overdue assignments past grace period WITHOUT existing penalty for that period
  - Applies late fee per structure's lateFeePercentage or global default
  - Returns count of penalties applied
```

### Fee Payment Actions — STUDENT MODE (`fee-payment-actions.ts`)

These actions handle **direct student payments** where admin searches by student and pays specific assignments. `FeePayment.familyPaymentId = null` for all records created here.

```typescript
recordFeePaymentAction(input: RecordFeePaymentInput): ActionResult<{ receiptNumber: string }>
  - requireRole('ADMIN')
  - Input: feeAssignmentIds[], amount, paymentMethod, referenceNumber?, bankName?, remarks?
  - NOTE: This is STUDENT MODE — creates FeePayment with familyPaymentId = null
  - CRITICAL BUSINESS LOGIC — entire operation in $transaction:
    - Fetch FeeSettings for receipt sequence
    - Lock receipt sequence with SELECT ... FOR UPDATE (or atomic increment)
    - Generate receiptNumber: "{prefix}-{year}-{paddedSequence}"
    - Increment FeeSettings.receiptNextSequence
    - Validate: amount <= sum of selected assignments' balanceAmount
    - Distribute payment across selected assignments (oldest first):
      For each assignment (ordered by dueDate ASC):
        - paymentForThis = min(remainingAmount, assignment.balanceAmount)
        - Create FeePayment record
        - Create FeeTransaction (type: PAYMENT, amount: -paymentForThis)
        - Update assignment: paidAmount += paymentForThis, balanceAmount -= paymentForThis
        - Update assignment status: PARTIAL or PAID
        - remainingAmount -= paymentForThis
    - Create AuditLog with full payment details
    - Create Notification: "Payment of Rs. {amount} received"
    - Return receiptNumber
  
  - ERROR CASES:
    - Amount = 0 or negative → reject
    - Amount > total balance → reject (no overpayment allowed)
    - Assignment already PAID → skip
    - Assignment WAIVED → skip

reverseFeePaymentAction(input: ReverseFeePaymentInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: paymentId, reason
  - $transaction:
    - Fetch original FeePayment
    - Verify not already reversed
    - Mark payment as reversed (isReversed, reversedAt, reversedBy, reason)
    - Create FeeTransaction (type: REVERSAL, amount: +originalAmount)
    - Update FeeAssignment: paidAmount -= amount, balanceAmount += amount
    - Recalculate status
    - Create AuditLog with reversal reason
    - Create Notification: "Payment reversal"
  - NOTE: Does NOT delete the original payment — preserves audit trail
```

### Family Payment Actions — FAMILY MODE (`family-payment-actions.ts`)

These actions handle **family-level payments** where admin searches by guardian/family and pays across multiple children. Creates a `FamilyPayment` wrapper + per-child `FeePayment` records with `familyPaymentId` set.

```typescript
recordFamilyPaymentAction(input: RecordFamilyPaymentInput): ActionResult<{ masterReceiptNumber: string; allocations: ChildAllocation[] }>
  - requireRole('ADMIN')
  - Input: familyProfileId, academicSessionId, totalAmount, paymentMethod, 
           allocationStrategy, manualAllocations?, referenceNumber?, bankName?, remarks?
  - CRITICAL BUSINESS LOGIC — entire operation in $transaction:
    - Fetch FeeSettings for receipt sequence
    - Lock receipt sequence with SELECT ... FOR UPDATE
    - Generate masterReceiptNumber: "FRCP-{year}-{paddedSequence}"
    - Increment FeeSettings.receiptNextSequence
    - Fetch ALL active FamilyStudentLinks for this family
    - Fetch ALL pending/partial FeeAssignments across all linked children + session
    - Validate: totalAmount <= sum of all children's balanceAmount (no overpayment)
    - RUN ALLOCATION ENGINE (see 19-payment-allocation-engine.md):
      Based on allocationStrategy:
        OLDEST_FIRST → sort all assignments by dueDate ASC, allocate oldest-first across children
        CHILD_PRIORITY → admin-specified child order, fill each child fully before next
        EQUAL_SPLIT → totalAmount / childCount, then oldest-first per child
        MANUAL → use manualAllocations[] as-is (validate sum = totalAmount)
    - Create FamilyPayment wrapper record
    - FOR EACH child allocation:
        - Create FeePayment (familyPaymentId = wrapper.id, receiptNumber = "RCP-{year}-{seq}")
        - Create FeeTransaction (type: PAYMENT, amount: -paymentForThis)
        - Update FeeAssignment(s): paidAmount += X, balanceAmount -= X
        - Update FeeAssignment status: PARTIAL or PAID
    - Store allocationDetails JSON on FamilyPayment
    - Create AuditLog: "FAMILY_PAYMENT_RECORDED" with full breakdown
    - Create Notification for family user: "Payment of Rs. {total} received"
    - Create Notification per child: "Rs. {amount} applied to your fees"
    - Return { masterReceiptNumber, allocations: [{ childName, amount, assignments }] }

  - ERROR CASES:
    - totalAmount = 0 or negative → reject
    - totalAmount > total family balance → reject (no overpayment)
    - No linked children → reject
    - All assignments already PAID → reject
    - MANUAL strategy but sum of allocations ≠ totalAmount → reject
    - MANUAL strategy but allocation exceeds child's balance → reject

reverseFamilyPaymentAction(input: ReverseFamilyPaymentInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: familyPaymentId, reason
  - $transaction:
    - Fetch FamilyPayment with all linked FeePayments
    - Verify not already reversed
    - Mark FamilyPayment as reversed (isReversed, reversedAt, reversedBy, reason)
    - FOR EACH linked FeePayment:
      - Mark as reversed
      - Create FeeTransaction (type: REVERSAL, amount: +originalAmount)
      - Update FeeAssignment: paidAmount -= amount, balanceAmount += amount
      - Recalculate assignment status
    - Create AuditLog: "FAMILY_PAYMENT_REVERSED" with reason + full breakdown
    - Create Notification for family: "Payment of Rs. {total} reversed"
    - Create Notification per child: "Rs. {amount} reversal on your fees"
  - NOTE: ALL child payments reversed atomically. Cannot reverse individual child 
    payments within a family payment — reverse entire family payment only.

reallocateFamilyPaymentAction(input: ReallocateFamilyPaymentInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: familyPaymentId, newAllocations: { childId: string; amount: Decimal }[]
  - Purpose: Parent says "wo jo kal paisa diye the, sab Ahmed ki thi Sara ki nahi"
  - $transaction:
    - Fetch FamilyPayment with all linked FeePayments
    - Verify not reversed
    - Validate: sum of newAllocations = familyPayment.totalAmount
    - REVERSE all existing child FeePayments (mark reversed, restore balances)
    - CREATE new child FeePayments per newAllocations
    - Update FeeAssignments accordingly
    - Update allocationDetails JSON on FamilyPayment
    - Create AuditLog: "FAMILY_PAYMENT_REALLOCATED"
    - Create Notifications for affected children
  - NOTE: FamilyPayment itself stays intact (same masterReceiptNumber, same total)
    Only the per-child distribution changes.
```

### Family Payment Fetch Actions (`family-payment-fetch-actions.ts`)

```typescript
fetchFamilyPaymentHistoryAction(input: FamilyPaymentHistoryInput): Promise<FamilyPaymentWithDetails[]>
  - requireRole('ADMIN', 'FAMILY')
  - Input: familyProfileId, academicSessionId
  - Authorization: FAMILY can only see own; ADMIN can see any
  - Returns: FamilyPayment records with per-child breakdown

fetchFamilyFeeOverviewAction(input: FamilyFeeOverviewInput): Promise<FamilyFeeOverview>
  - requireRole('ADMIN', 'FAMILY')
  - Input: familyProfileId, academicSessionId
  - Returns: {
      familyName, guardianName,
      totalPayableAllChildren, totalPaidAllChildren, totalBalanceAllChildren,
      children: [{
        childName, className, sectionName,
        totalPayable, totalPaid, totalBalance,
        pendingAssignments: FeeAssignmentWithDetails[]
      }]
    }
  - NOTE: This is THE query that powers the family collection UI —
    admin sees everything in one view to decide allocation

fetchFamilyMasterReceiptAction(input: { masterReceiptNumber: string }): Promise<FamilyReceiptData>
  - requireRole('ADMIN', 'FAMILY')
  - Returns: Full receipt data with school info + family info + per-child payment breakdown
  - Used by family-receipt-view.tsx for printing
```

### Fee Report Actions (`fee-reports-fetch-actions.ts`)

```typescript
fetchFeeCollectionSummaryAction(input: FeeCollectionSummaryInput): Promise<FeeCollectionSummary>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, periodLabel?, classId?, dateRange?
  - Returns: { totalAssigned, totalCollected, totalOutstanding, totalOverdue, totalWaived, collectionRate }

fetchFeeDefaultersAction(input: FeeDefaultersInput): Promise<FeeDefaulter[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, overdueForDays, classId?, sectionId?
  - Returns: students with overdue balance > 0, sorted by overdue amount DESC

fetchClassWiseFeeReportAction(input: ClassFeeReportInput): Promise<ClassFeeReport[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, periodLabel?
  - Returns: per-class aggregation { className, totalStudents, totalAssigned, totalCollected, collectionRate }
  - KEY QUERY: This is how admin/principal sees "kis class ki kitni fee baki hai"
  - Works regardless of payment mode (direct/family) because it reads FeeAssignment.balanceAmount

fetchClassFeeDetailAction(input: ClassFeeDetailInput): Promise<ClassFeeDetail>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: classId, academicSessionId, periodLabel?, sectionId?
  - Returns: DRILL-DOWN per class → {
      className, sectionName?,
      totalStudents, totalAssigned, totalCollected, totalOutstanding,
      collectionRate, overdueAmount, overdueStudentCount,
      categoryBreakdown: [{
        categoryName, categoryCode, totalAssigned, totalCollected, totalOutstanding
      }],
      students: [{
        studentName, rollNumber, totalPayable, totalPaid, balance, status,
        lastPaymentDate, lastPaymentReceiptNumber
      }]
    }
  - NOTE: Admin clicks "Class 5" in class-wise report → drills down to see
    every student in that class, their fee status, and which categories are paid/pending.
    This is THE class report that answers "Class 5 mein kisne fee nhi di"

fetchSectionWiseFeeReportAction(input: SectionFeeReportInput): Promise<SectionFeeReport[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: classId, academicSessionId, periodLabel?
  - Returns: per-section aggregation within a class { sectionName, totalStudents, assigned, collected, rate }
  - NOTE: When a class has multiple sections (5-A, 5-B), admin needs section-level breakdown

fetchMonthlyCollectionTrendAction(input: MonthlyTrendInput): Promise<MonthlyTrend[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId
  - Returns: monthly collection amounts for chart { month, assigned, collected, outstanding }

fetchStudentFeeOverviewAction(input: StudentFeeOverviewInput): Promise<StudentFeeOverview>
  - requireRole('ADMIN', 'STUDENT', 'FAMILY')
  - Input: studentProfileId (admin provides any; student provides own; family provides linked child)
  - Authorization: student can only see own; family can only see linked children
  - Returns: { totalPayable, totalPaid, totalBalance, assignments[], recentPayments[] }

fetchFamilyVsDirectPaymentBreakdownAction(input: CollectionBreakdownInput): Promise<PaymentModeBreakdown>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, periodLabel?
  - Returns: { 
      directPayments: { count, totalAmount },
      familyPayments: { count, totalAmount, familyCount },
      combinedTotal
    }
  - NOTE: Analytics to see how much collection came through family mode vs direct student mode
```
