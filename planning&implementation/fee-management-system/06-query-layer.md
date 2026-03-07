# Fee Management — Query Layer Design

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 8. Query Layer Design

### Fee Category Queries (`fee-category-queries.ts`)

```typescript
findAllFeeCategories(options?: { isActive?: boolean }): Promise<FeeCategory[]>
findFeeCategoryById(id: string): Promise<FeeCategory | null>
findFeeCategoryByCode(code: string): Promise<FeeCategory | null>
```

### Fee Structure Queries (`fee-structure-queries.ts`)

```typescript
findFeeStructures(filters: {
  academicSessionId: string;
  classId?: string;
  feeCategoryId?: string;
  isActive?: boolean;
}): Promise<FeeStructureWithCategory[]>

findFeeStructureById(id: string): Promise<FeeStructureWithCategory | null>

findFeeStructuresByClassAndSession(
  classId: string, 
  academicSessionId: string
): Promise<FeeStructureWithCategory[]>
```

### Fee Assignment Queries (`fee-assignment-queries.ts`)

```typescript
findFeeAssignments(filters: {
  academicSessionId: string;
  studentProfileId?: string;
  classId?: string;
  sectionId?: string;
  status?: PaymentStatus;
  periodLabel?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}, pagination: { page: number; pageSize: number }): Promise<PaginatedResult<FeeAssignmentWithDetails>>

findStudentFeeAssignments(
  studentProfileId: string, 
  academicSessionId: string
): Promise<FeeAssignmentWithDetails[]>

findOverdueFeeAssignments(
  academicSessionId: string, 
  asOfDate: Date
): Promise<FeeAssignmentWithStudent[]>

calculateStudentFeeSummary(
  studentProfileId: string, 
  academicSessionId: string
): Promise<{ totalPayable: Decimal; totalPaid: Decimal; totalBalance: Decimal; totalDiscount: Decimal }>
```

### Fee Payment Queries (`fee-payment-queries.ts`)

```typescript
findPaymentsByAssignment(feeAssignmentId: string): Promise<FeePayment[]>

findPaymentsByStudent(
  studentProfileId: string, 
  academicSessionId: string
): Promise<FeePaymentWithAssignment[]>

findPaymentByReceipt(receiptNumber: string): Promise<FeePaymentWithFullDetails | null>

findRecentPayments(filters: {
  academicSessionId: string;
  dateFrom?: Date;
  dateTo?: Date;
  paymentMethod?: PaymentMethod;
  receivedById?: string;
}, pagination: { page: number; pageSize: number }): Promise<PaginatedResult<FeePaymentWithStudentDetails>>
```

### Fee Report Queries (`fee-reports-queries.ts`)

```typescript
aggregateFeeCollection(
  academicSessionId: string, 
  filters?: { classId?: string; periodLabel?: string }
): Promise<FeeCollectionAggregation>

aggregateClassWiseCollection(
  academicSessionId: string
): Promise<ClassWiseAggregation[]>
// Returns: [{ classId, className, totalStudents, totalAssigned, totalCollected, 
//            totalOutstanding, totalOverdue, collectionRate }]
// NOTE: This is THE class report query. It reads FeeAssignment.paidAmount and 
// FeeAssignment.balanceAmount which are updated by BOTH direct and family payments.
// No need to care about payment origin — the denormalized fields handle it.

aggregateClassFeeDetail(
  classId: string,
  academicSessionId: string,
  filters?: { sectionId?: string; periodLabel?: string }
): Promise<ClassFeeDetailAggregation>
// Returns: { 
//   className, totalStudents, totalAssigned, totalCollected, totalOutstanding,
//   categoryBreakdown: [{ categoryName, code, assigned, collected, outstanding }],
//   students: [{ id, name, rollNo, payable, paid, balance, status, lastPayment }]
// }
// NOTE: Drill-down query. Admin clicks "Class 5" → sees every student + per-category status.
// Answers: "Class 5 mein konse student ne fee nhi di, aur konse category ki fee baki hai"

aggregateSectionWiseCollection(
  classId: string,
  academicSessionId: string
): Promise<SectionWiseAggregation[]>
// Returns: [{ sectionId, sectionName, totalStudents, assigned, collected, outstanding, rate }]
// For classes with multiple sections (5-A, 5-B, 5-C)

aggregateMonthlyCollection(
  academicSessionId: string
): Promise<MonthlyAggregation[]>

findFeeDefaulters(
  academicSessionId: string, 
  overdueForDays: number, 
  filters?: { classId?: string; sectionId?: string }
): Promise<FeeDefaulterRecord[]>

calculateScholarshipImpact(
  academicSessionId: string
): Promise<{ totalDiscounts: Decimal; studentCount: number; byTier: ScholarshipTierImpact[] }>
```

### Family Payment Queries (`family-payment-queries.ts`)

```typescript
findFamilyPayments(
  familyProfileId: string,
  academicSessionId: string
): Promise<FamilyPaymentWithChildren[]>
// Returns: FamilyPayment records with linked FeePayment[] for each child

findFamilyPaymentById(
  id: string
): Promise<FamilyPaymentWithFullDetails | null>
// Includes: FamilyPayment + all linked FeePayments + FeeAssignments + StudentProfiles

findFamilyPaymentByReceipt(
  masterReceiptNumber: string
): Promise<FamilyPaymentWithFullDetails | null>
// Receipt lookup for family receipts

findFamilyOutstandingFees(
  familyProfileId: string,
  academicSessionId: string
): Promise<FamilyOutstandingFees>
// Returns: {
//   totalOutstanding: Decimal,
//   children: [{
//     studentProfileId, studentName, className, sectionName,
//     assignments: FeeAssignmentWithDetails[] (only PENDING/PARTIAL/OVERDUE)
//   }]
// }
// THIS powers the family collection UI — admin sees all children's pending dues in one call

calculateFamilyFeeSummary(
  familyProfileId: string,
  academicSessionId: string
): Promise<{
  totalPayable: Decimal; totalPaid: Decimal; totalBalance: Decimal;
  childrenSummaries: {
    childId: string; childName: string; className: string;
    payable: Decimal; paid: Decimal; balance: Decimal;
  }[]
}>
// Aggregate summary across all children — used on family dashboard
```
