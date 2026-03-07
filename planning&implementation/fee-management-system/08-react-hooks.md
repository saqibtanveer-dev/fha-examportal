# Fee Management — React Hooks Design

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 10. React Hooks Design

### Query Key Configuration (add to `src/lib/query-keys.ts`)

```typescript
fees: {
  all: ['fees'] as const,
  categories: {
    all: ['fees', 'categories'] as const,
    list: (filters?: { isActive?: boolean }) => ['fees', 'categories', 'list', filters] as const,
    detail: (id: string) => ['fees', 'categories', 'detail', id] as const,
  },
  structures: {
    all: ['fees', 'structures'] as const,
    list: (filters: { sessionId: string; classId?: string }) => ['fees', 'structures', 'list', filters] as const,
    detail: (id: string) => ['fees', 'structures', 'detail', id] as const,
  },
  assignments: {
    all: ['fees', 'assignments'] as const,
    list: (filters: Record<string, unknown>) => ['fees', 'assignments', 'list', filters] as const,
    student: (studentId: string, sessionId: string) => ['fees', 'assignments', 'student', studentId, sessionId] as const,
    detail: (id: string) => ['fees', 'assignments', 'detail', id] as const,
  },
  payments: {
    all: ['fees', 'payments'] as const,
    list: (filters: Record<string, unknown>) => ['fees', 'payments', 'list', filters] as const,
    student: (studentId: string, sessionId: string) => ['fees', 'payments', 'student', studentId, sessionId] as const,
    receipt: (receiptNumber: string) => ['fees', 'payments', 'receipt', receiptNumber] as const,
  },
  reports: {
    all: ['fees', 'reports'] as const,
    summary: (filters: Record<string, unknown>) => ['fees', 'reports', 'summary', filters] as const,
    defaulters: (filters: Record<string, unknown>) => ['fees', 'reports', 'defaulters', filters] as const,
    classWise: (sessionId: string) => ['fees', 'reports', 'classWise', sessionId] as const,
    classDetail: (classId: string, sessionId: string) => ['fees', 'reports', 'classDetail', classId, sessionId] as const,
    sectionWise: (classId: string, sessionId: string) => ['fees', 'reports', 'sectionWise', classId, sessionId] as const,
    monthlyTrend: (sessionId: string) => ['fees', 'reports', 'monthlyTrend', sessionId] as const,
    scholarshipImpact: (sessionId: string) => ['fees', 'reports', 'scholarshipImpact', sessionId] as const,
    paymentModeBreakdown: (sessionId: string) => ['fees', 'reports', 'paymentModeBreakdown', sessionId] as const,
  },
  familyPayments: {
    all: ['fees', 'familyPayments'] as const,
    list: (familyId: string, sessionId: string) => ['fees', 'familyPayments', 'list', familyId, sessionId] as const,
    detail: (id: string) => ['fees', 'familyPayments', 'detail', id] as const,
    receipt: (masterReceiptNumber: string) => ['fees', 'familyPayments', 'receipt', masterReceiptNumber] as const,
    outstanding: (familyId: string, sessionId: string) => ['fees', 'familyPayments', 'outstanding', familyId, sessionId] as const,
    summary: (familyId: string, sessionId: string) => ['fees', 'familyPayments', 'summary', familyId, sessionId] as const,
  },
  settings: ['fees', 'settings'] as const,
},
```

### Hook Files

#### `hooks/use-fee-categories.ts`

```typescript
useFeeCategories(options?: { isActive?: boolean }): UseQueryResult<FeeCategory[]>
  - queryKey: queryKeys.fees.categories.list(options)
  - queryFn: fetchFeeCategoriesAction(options)
  - staleTime: 10 minutes (rarely changes)
```

#### `hooks/use-fee-structures.ts`

```typescript
useFeeStructures(sessionId: string, classId?: string): UseQueryResult<FeeStructureWithCategory[]>
  - queryKey: queryKeys.fees.structures.list({ sessionId, classId })
  - queryFn: fetchFeeStructuresAction({ academicSessionId, classId })
  - enabled: !!sessionId

useFeeStructureDetail(id: string): UseQueryResult<FeeStructureWithCategory>
  - queryKey: queryKeys.fees.structures.detail(id)
  - queryFn: fetchFeeStructureByIdAction(id)
  - enabled: !!id
```

#### `hooks/use-fee-assignments.ts`

```typescript
useFeeAssignments(filters: FeeAssignmentFilters): UseQueryResult<PaginatedResult<FeeAssignmentWithDetails>>
  - queryKey: queryKeys.fees.assignments.list(filters)
  - queryFn: fetchFeeAssignmentsAction(filters)
  - enabled: !!filters.academicSessionId

useStudentFeeOverview(studentProfileId: string, sessionId: string): UseQueryResult<StudentFeeOverview>
  - queryKey: queryKeys.fees.assignments.student(studentProfileId, sessionId)
  - queryFn: fetchStudentFeeOverviewAction({ studentProfileId })
  - enabled: !!studentProfileId && !!sessionId
```

#### `hooks/use-fee-payments.ts`

```typescript
useStudentPayments(studentProfileId: string, sessionId: string): UseQueryResult<FeePaymentWithAssignment[]>
  - queryKey: queryKeys.fees.payments.student(studentProfileId, sessionId)
  - queryFn: fetchStudentPaymentsAction({ studentProfileId, academicSessionId: sessionId })
  - enabled: !!studentProfileId && !!sessionId

useReceiptData(receiptNumber: string): UseQueryResult<ReceiptData>
  - queryKey: queryKeys.fees.payments.receipt(receiptNumber)
  - queryFn: fetchReceiptDataAction(receiptNumber)
  - enabled: !!receiptNumber
```

#### `hooks/use-fee-reports.ts`

```typescript
useFeeCollectionSummary(filters: CollectionSummaryFilters): UseQueryResult<FeeCollectionSummary>
  - queryKey: queryKeys.fees.reports.summary(filters)
  - queryFn: fetchFeeCollectionSummaryAction(filters)
  - refetchInterval: 5 minutes (for live dashboard feel)

useFeeDefaulters(filters: DefaulterFilters): UseQueryResult<FeeDefaulter[]>
  - queryKey: queryKeys.fees.reports.defaulters(filters)
  - queryFn: fetchFeeDefaultersAction(filters)

useClassWiseFeeReport(sessionId: string): UseQueryResult<ClassFeeReport[]>
  - queryKey: queryKeys.fees.reports.classWise(sessionId)
  - queryFn: fetchClassWiseFeeReportAction({ academicSessionId: sessionId })
  - enabled: !!sessionId
  - NOTE: THE class report — shows "kis class ki kitni fee baki hai"

useClassFeeDetail(classId: string, sessionId: string): UseQueryResult<ClassFeeDetail>
  - queryKey: queryKeys.fees.reports.classDetail(classId, sessionId)
  - queryFn: fetchClassFeeDetailAction({ classId, academicSessionId: sessionId })
  - enabled: !!classId && !!sessionId
  - NOTE: DRILL-DOWN — click any class → see every student + per-category status

useSectionWiseFeeReport(classId: string, sessionId: string): UseQueryResult<SectionFeeReport[]>
  - queryKey: queryKeys.fees.reports.sectionWise(classId, sessionId)
  - queryFn: fetchSectionWiseFeeReportAction({ classId, academicSessionId: sessionId })
  - enabled: !!classId && !!sessionId

useMonthlyCollectionTrend(sessionId: string): UseQueryResult<MonthlyTrend[]>
  - queryKey: queryKeys.fees.reports.monthlyTrend(sessionId)
  - queryFn: fetchMonthlyCollectionTrendAction({ academicSessionId: sessionId })
  - enabled: !!sessionId
```

#### `hooks/use-fee-mutations.ts`

```typescript
useCreateFeeCategory(): mutation wrapper → createFeeCategoryAction
  - invalidates: queryKeys.fees.categories.all

useCreateFeeStructure(): mutation wrapper → createFeeStructureAction
  - invalidates: queryKeys.fees.structures.all

useGenerateFeeAssignments(): mutation wrapper → generateFeeAssignmentsAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.reports.all

useRecordFeePayment(): mutation wrapper → recordFeePaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, queryKeys.fees.reports.all
  - onSuccess: opens receipt print dialog

useApplyFeeDiscount(): mutation wrapper → applyFeeDiscountAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.reports.all

useReverseFeePayment(): mutation wrapper → reverseFeePaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, queryKeys.fees.reports.all

// ─── Family Payment Mutations ───

useRecordFamilyPayment(): mutation wrapper → recordFamilyPaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, 
                 queryKeys.fees.familyPayments.all, queryKeys.fees.reports.all
  - onSuccess: opens family master receipt print dialog

useReverseFamilyPayment(): mutation wrapper → reverseFamilyPaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, 
                 queryKeys.fees.familyPayments.all, queryKeys.fees.reports.all

useReallocateFamilyPayment(): mutation wrapper → reallocateFamilyPaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, 
                 queryKeys.fees.familyPayments.all, queryKeys.fees.reports.all
```

#### `hooks/use-family-payments.ts`

```typescript
useFamilyPaymentHistory(familyId: string, sessionId: string): UseQueryResult<FamilyPaymentWithChildren[]>
  - queryKey: queryKeys.fees.familyPayments.list(familyId, sessionId)
  - queryFn: fetchFamilyPaymentHistoryAction({ familyProfileId: familyId, academicSessionId: sessionId })
  - enabled: !!familyId && !!sessionId

useFamilyOutstandingFees(familyId: string, sessionId: string): UseQueryResult<FamilyOutstandingFees>
  - queryKey: queryKeys.fees.familyPayments.outstanding(familyId, sessionId)
  - queryFn: fetchFamilyFeeOverviewAction({ familyProfileId: familyId, academicSessionId: sessionId })
  - enabled: !!familyId && !!sessionId
  - NOTE: This powers the admin's family collection UI — shows all children's pending dues

useFamilyFeeSummary(familyId: string, sessionId: string): UseQueryResult<FamilyFeeSummary>
  - queryKey: queryKeys.fees.familyPayments.summary(familyId, sessionId)
  - queryFn: calculateFamilyFeeSummary({ familyProfileId: familyId, academicSessionId: sessionId })
  - enabled: !!familyId && !!sessionId
  - NOTE: Powers the family dashboard — total across all children

useFamilyMasterReceipt(receiptNumber: string): UseQueryResult<FamilyReceiptData>
  - queryKey: queryKeys.fees.familyPayments.receipt(receiptNumber)
  - queryFn: fetchFamilyMasterReceiptAction({ masterReceiptNumber: receiptNumber })
  - enabled: !!receiptNumber
  - staleTime: Infinity (immutable — receipt data never changes)
```
