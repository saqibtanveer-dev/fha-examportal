# Fee Management System Design — Overview & Analysis

> **Date:** 2026-03-06 (Updated)  
> **Status:** PLANNING  
> **Depends on:** Users Module (done), Classes/Sections (done), AcademicSession (done), StudentProfile (done), FamilyProfile (done), FamilyStudentLink (done), Notification System (done), Audit Log (done), Settings (done)  
> **Complexity:** VERY HIGH — new financial domain, touches ALL roles, 11+ new DB models, ledger-grade accuracy, receipt generation, concurrency-safe payments, dual-mode collection (student + family), payment allocation engine, family portal integration  
> **Last Updated:** 2026-03-06 — Added FamilyPayment wrapper, dual-mode collection, allocation engine, class-level reporting  

---

## Master Table of Contents (All Files)

| # | File | Sections |
|---|------|----------|
| 00 | `00-overview-and-analysis.md` | Overview, TOC, Brutal Analysis |
| 01 | `01-principles-and-requirements.md` | Why Fee Management Is Different, System Requirements |
| 02 | `02-database-schema.md` | Enums, Models, Relations, ER Diagram |
| 03 | `03-data-flow-architecture.md` | Setup Flow, Collection Flow (Dual-Mode), Viewing Flow |
| 04 | `04-module-structure.md` | File-Level Breakdown |
| 05 | `05-server-actions.md` | Category, Structure, Assignment, Payment, Family, Report Actions |
| 06 | `06-query-layer.md` | All Prisma Query Functions |
| 07 | `07-validation-schemas.md` | All Zod Schemas |
| 08 | `08-react-hooks.md` | Query Keys, All React Query Hooks |
| 09 | `09-admin-ui-configuration.md` | Fee Hub, Categories, Structures, Generation Pages |
| 10 | `10-admin-ui-collection.md` | Dual-Mode Collection (Student + Family) |
| 11 | `11-admin-ui-reports.md` | Reports Dashboard, Class Reports, Analytics |
| 12 | `12-student-family-principal-ui.md` | Student, Family, Principal UIs |
| 13 | `13-receipt-system.md` | Receipt Format, Implementation, Reusable Components |
| 14 | `14-rbac-business-rules.md` | Authorization Matrix, Business Rules, Edge Cases |
| 15 | `15-concurrency-performance.md` | Transactions, Locking, Caching, Indexing |
| 16 | `16-patterns-migration-scholarship.md` | Design Patterns, Migration, Scholarship Integration |
| 17 | `17-implementation-roadmap.md` | 10-Phase Roadmap, Timeline, Definition of Done |
| 18 | `18-dual-mode-payment-architecture.md` | Student vs Family Payment Deep Dive |
| 19 | `19-payment-allocation-engine.md` | Allocation Strategies, Algorithm, Preview |
| 20 | `20-class-level-reporting.md` | Class Reports, Section Reports, Drill-Down |
| 21 | `21-family-payment-edge-cases.md` | Edge Cases, Scenarios, Solutions |

---

## 1. Brutal Analysis — What Exists, What's Missing

### What We HAVE (Foundation Already Built)

| Asset | Status | Relevance to Fee Management |
|-------|--------|----------------------------|
| `StudentProfile` model | ✅ Done | Every student has a profile — fee is assigned per student. `classId`, `sectionId` available for class-based fee structures |
| `FamilyProfile` + `FamilyStudentLink` | ✅ Done | Parents need to see fees. One family ↔ multiple children. Family portal must aggregate fees across children |
| `Class` / `Section` models | ✅ Done | Fee structures are typically class-based (Class 1 = Rs. X, Class 10 = Rs. Y) |
| `AcademicSession` model | ✅ Done | All fee records MUST be scoped to academic session. Fee structures change year-over-year |
| `SchoolSettings` model | ✅ Done | Needs extension for fee-specific config: currency, tax, penalty rules, receipt prefix |
| `UserRole` enum (ADMIN, PRINCIPAL, TEACHER, STUDENT, FAMILY) | ✅ Done | Admin manages fee setup + collection. Student/Family view fees. Principal monitors. Teacher has NO access |
| `Notification` model | ✅ Done | Fee due reminders, payment confirmations, overdue alerts |
| `AuditLog` model | ✅ Done | CRITICAL for financial module — every payment, refund, waiver MUST be audit-logged |
| `ApplicantScholarship` model | ✅ Done | Scholarship students get fee discounts — needs direct integration |
| `safeAction` wrapper | ✅ Done | Error handling for financial mutations |
| `actionSuccess` / `actionError` | ✅ Done | Standardized return types |
| `requireRole()` auth | ✅ Done | Role-based access control |
| `serialize()` utility | ✅ Done | Decimal serialization — CRITICAL for currency amounts |
| `queryKeys` factory | ✅ Done | Add `fees.*` namespace |
| `useReferenceStore` | ✅ Done | Cached classes, sessions — fee filters need these |
| `ClassSectionSelector` component | ✅ Done | Reusable for fee assignment filtering |
| `PageHeader`, `EmptyState`, `Spinner` | ✅ Done | Shared UI primitives |
| Zod v4 validation patterns | ✅ Done | Schema-first validation for financial data |
| Recharts | ✅ Done | Fee collection analytics charts |
| `@tanstack/react-table` | ✅ Done | Fee ledger tables with sorting/filtering |
| Prisma `Decimal` type | ✅ Done | Already used for exam marks — same pattern for currency |

### What's MISSING (Must Build)

| Gap | Severity | Notes |
|-----|----------|-------|
| **No FeeStructure model** | 🔴 CRITICAL | No way to define fee types, amounts, or schedules |
| **No FeeAssignment model** | 🔴 CRITICAL | No way to assign fees to individual students |
| **No Payment model** | 🔴 CRITICAL | No way to record payments |
| **No FamilyPayment model** | 🔴 CRITICAL | No way to record family-level (multi-child) payments |
| **No Receipt concept** | 🔴 CRITICAL | No way to generate or track receipts |
| **No FeeDiscount / FeeWaiver model** | 🟡 HIGH | Scholarship students need automatic discounts |
| **No LateFee / Penalty rules** | 🟡 HIGH | Schools charge late payment penalties |
| **No fee-related enums** | 🔴 CRITICAL | PaymentMethod, PaymentStatus, FeeType, FeeFrequency, AllocationStrategy |
| **No `/admin/fees` routes** | 🔴 CRITICAL | No admin fee management pages |
| **No `/student/fees` route** | 🔴 CRITICAL | Students can't see their fee status |
| **No `/family/fees` route** | 🔴 CRITICAL | Parents can't see children's fee status |
| **No `src/modules/fees/` module** | 🔴 CRITICAL | No module directory |
| **No fee query keys** | 🟡 MEDIUM | Need `queryKeys.fees.*` |
| **No fee validation schemas** | 🟡 MEDIUM | New Zod schemas for financial data |
| **No receipt generation** | 🟡 HIGH | Schools need printable receipts |
| **No `ROUTES.ADMIN.FEES`** | 🟡 MEDIUM | Route constants missing |
| **No `ROUTES.STUDENT.FEES`** | 🟡 MEDIUM | Route constants missing |
| **No `ROUTES.FAMILY.FEES`** | 🟡 MEDIUM | Route constants missing |
| **No currency constants** | 🟡 MEDIUM | PKR formatting, decimal precision |
| **SchoolSettings missing fee config** | 🟡 MEDIUM | Need: currency, tax %, receipt prefix, penalty rules |
| **No Allocation Engine** | 🟡 HIGH | No way to distribute family payments across children |
| **No Dual-Mode Collection UI** | 🟡 HIGH | Admin needs Student mode AND Family mode for fee collection |

### Brutal Truths

1. **Fee management is a FINANCIAL module.** Unlike attendance or diary, financial data requires absolute accuracy. A single rounding error in fee calculation multiplied across 500 students = real money discrepancy. Every Decimal operation must be precise.

2. **Concurrency is a REAL problem.** Two admins collecting payment from the same student simultaneously. Two families paying online for the same invoice. Race conditions = double payments or lost payments. Every write operation must be transactional with proper locking.

3. **Audit trail is NON-NEGOTIABLE.** Unlike other modules where audit is "nice-to-have," fee management requires COMPLETE audit trail. Every payment, every refund, every waiver, every discount modification must be traceable to who did it, when, and why. This isn't optional — it's legally required for schools.

4. **Fee structure is deceptively complex.** It looks simple (Class 5 = Rs. 5,000/month) but in reality: tuition fee + lab fee + exam fee + sports fee + transport fee + library fee + development fund — all with different frequencies (monthly, quarterly, annual, one-time), different amounts per class, and different due dates.

5. **Scholarship integration is THE hardest part.** A student might have a 50% scholarship on tuition but NOT on lab fees. A scholarship might expire mid-year. A scholarship might be conditional on attendance > 90%. The fee assignment system must dynamically calculate net payable considering all discounts.

6. **The family portal adds a multiplier.** One parent with 3 children = 3 separate fee streams. The family dashboard must aggregate total fees, show per-child breakdown, and handle the case where one child has a scholarship and another doesn't.

7. **Receipt generation is a first-class feature.** Schools MUST give receipts. Parents DEMAND receipts. Receipts need: school logo, sequential numbering, breakdown of fees paid, payment method, date, signature space. This isn't a "nice to have" — it's a core requirement.

8. **This is NOT a payment gateway integration.** For a single school deployment, fee collection is MANUAL — a parent comes to the admin office, pays cash/bank transfer, admin records the payment. Online payment integration (Stripe, JazzCash, EasyPaisa) is V2 scope. V1 = manual recording with full tracking.

9. **Dual-mode collection is essential.** Admin MUST be able to record payment by searching for a STUDENT (direct) OR by searching for a FAMILY (multi-child). A parent walks in and says "ye lo fees" — admin doesn't know which child it's for until checking. The system must handle both flows with ONE unified payment infrastructure.

10. **Class-level reporting is a day-one requirement.** "Class 5 ki kitni fee baki hai" is the most frequently asked question by a principal. The system must provide class-wise, section-wise, and student-wise drill-down reports — all working identically regardless of whether the payment came through student mode or family mode.
