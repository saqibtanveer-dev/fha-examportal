# Fee Management — Patterns, Migration & Scholarship Integration

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 23. Design Patterns Applied

| Pattern | Where | Why |
|---------|-------|-----|
| **Event Sourcing (Simplified)** | `FeeTransaction` table | Every balance change is an event. Can reconstruct any state by replaying transactions |
| **CQRS (Light)** | Separate queries vs. actions files | Read path (queries) optimized differently from write path (actions with transactions) |
| **Repository Pattern** | `*-queries.ts` files | Pure data access, no business logic, reusable across actions |
| **Service Layer** | `fee-receipt-service.ts` | Receipt generation logic separated from action handlers |
| **Command Pattern** | Server actions | Each action is a self-contained command with validation + auth + execution |
| **Strategy Pattern** | Late fee calculation + Allocation Engine | Percentage OR fixed amount — selected at runtime. OLDEST_FIRST / CHILD_PRIORITY / EQUAL / MANUAL — selected by admin |
| **Observer Pattern** | Notifications | Payment events trigger notifications to student + family |
| **Decorator Pattern** | `safeAction()` wrapper | Cross-cutting concerns (error handling, logging) applied to all actions |
| **Null Object Pattern** | Empty states | When student has no fees → show `<EmptyState>`, not error |
| **Immutability** | `FeePayment`, `FeeTransaction` | Append-only records, no UPDATE — ensures audit integrity |
| **Wrapper Pattern** | `FamilyPayment` | Wraps multiple `FeePayment` records into one logical unit |

---

## 24. Migration Strategy

### Phase 1: Schema Migration

```bash
# Migration name: add_fee_management_system
prisma migrate dev --name add_fee_management_system

# Changes:
# 1. Add new enums: FeeType, FeeFrequency, PaymentStatus, PaymentMethod, 
#    FeeDiscountType, FeeTransactionType, AllocationStrategy
# 2. Add new models: FeeCategory, FeeStructure, FeeAssignment, FeeLineItem, 
#    FeeDiscount, FeePayment, FeeTransaction, FamilyPayment, FeeSettings
# 3. Add relations to existing models: StudentProfile, Class, AcademicSession, FamilyProfile
# 4. Add new NotificationType values: FEE_DUE_REMINDER, FEE_OVERDUE_ALERT, 
#    FEE_PAYMENT_RECEIVED, FEE_DISCOUNT_APPLIED, FEE_FAMILY_PAYMENT_RECEIVED
```

### Phase 2: Seed Data

```typescript
// prisma/seed.ts — add fee seed data
// 1. Create default FeeSettings (with both receiptPrefix and familyReceiptPrefix)
// 2. Create standard FeeCategories:
//    - TUI: Tuition Fee (MONTHLY)
//    - ADM: Admission Fee (ONE_TIME)
//    - LAB: Lab Fee (QUARTERLY)
//    - SPT: Sports Fee (ANNUAL)
//    - LIB: Library Fee (ANNUAL)
//    - DEV: Development Fund (ANNUAL)
//    - SEC: Security Deposit (ONE_TIME, refundable)
```

### Phase 3: Route & Module Setup

```
1. Create src/modules/fees/ directory with all files
2. Create src/validations/fee-schemas.ts
3. Add fee query keys to src/lib/query-keys.ts
4. Add fee routes to src/lib/constants.ts
5. Create app routes: /admin/fees/*, /student/fees, /family/fees, /principal/fees
6. Add fee nav items to role navigation configs
```

### Backward Compatibility

- **ZERO breaking changes to existing modules.** Fee management is entirely additive.
- Existing tables only get new relations added (optional, nullable references).
- No existing API contracts change.
- Existing seed data continues to work.

---

## 25. Scholarship-Fee Integration

### How Scholarships Connect to Fees

```
Admission System                              Fee System
─────────────────                             ──────────
ApplicantScholarship                          FeeAssignment
  - tier: HALF_50                               - Generate for student
  - percentageAwarded: 50                       - Auto-detect scholarship
  - isAccepted: true                            - Apply FeeDiscount:
  - validFrom: 2026-04-01                         - type: SCHOLARSHIP
  - validUntil: 2027-03-31                         - percentage: 50%
  - isRenewable: true                              - scholarshipId: FK
  - renewalCriteria: {                             - calculatedAmount: auto
      minAttendance: 90%                    
    }                                         On next period generation:
                                                - Check scholarship validity
                                                - Check renewal criteria
                                                - Auto-apply or flag for review
```

### Integration Logic

```typescript
// During fee generation (inside generateFeeAssignmentsAction):

for (const student of students) {
  // 1. Create base FeeAssignment
  
  // 2. Check for active scholarship
  const scholarship = await findActiveScholarship(student.id, academicSessionId);
  
  if (scholarship && scholarship.isAccepted && isWithinValidityPeriod(scholarship)) {
    // 3. Check renewal criteria if applicable
    if (scholarship.isRenewable && scholarship.renewalCriteria) {
      const criteria = scholarship.renewalCriteria;
      
      if (criteria.minAttendance) {
        const attendancePercent = await getStudentAttendancePercent(student.id, academicSessionId);
        if (attendancePercent < criteria.minAttendance) {
          // Scholarship paused — flag for admin review, don't auto-apply
          createNotification(adminId, "Scholarship review needed for student X — attendance below threshold");
          continue; // Skip auto-apply
        }
      }
    }
    
    // 4. Apply scholarship discount
    const discountAmount = calculateScholarshipDiscount(
      baseAmount, 
      scholarship.percentageAwarded,
      appliesTo: ['TUITION'] // Scholarship may only apply to tuition, not all categories
    );
    
    await createFeeDiscount({
      feeAssignmentId: assignment.id,
      discountType: 'SCHOLARSHIP',
      percentage: scholarship.percentageAwarded,
      calculatedAmount: discountAmount,
      scholarshipId: scholarship.id,
      approvedById: systemUserId, // Auto-applied by system
      reason: `${scholarship.tier} scholarship — ${scholarship.percentageAwarded}%`,
    });
    
    // 5. Recalculate assignment totals
    await recalculateFeeAssignment(assignment.id);
  }
}
```

### Scholarship Scope Configuration

Not all scholarships apply to all fee types. A 50% scholarship might cover:
- ✅ Tuition Fee (50% off)
- ✅ Lab Fee (50% off)
- ❌ Transport Fee (no discount)
- ❌ Security Deposit (no discount)
- ❌ Uniform Fee (no discount)

This is configured via `ApplicantScholarship.renewalCriteria` JSON field or a new `scholarshipFeeExclusions` JSON field on `CampaignScholarshipTier`.
