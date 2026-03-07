# Fee Management — Principles & Requirements

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 2. Why Fee Management Is Different

### Financial Domain ≠ Academic Domain

| Dimension | Academic Modules (Exams, Attendance) | Fee Management |
|-----------|--------------------------------------|----------------|
| **Data sensitivity** | Medium — grades matter but aren't money | HIGH — actual money, legal implications |
| **Precision** | Percentages (2 decimal places OK) | Currency (exact to paisa/cent, no rounding errors) |
| **Concurrency risk** | Low — one teacher marks at a time | HIGH — multiple admins collecting simultaneously |
| **Audit requirements** | Nice-to-have | LEGALLY REQUIRED — complete paper trail |
| **Error impact** | Wrong grade = correction | Wrong payment = lost money, angry parents |
| **Immutability** | Grades can be updated | Payments should NEVER be silently modified — only reversed/refunded |
| **Reporting** | Academic analytics | Financial reports (tax, compliance, revenue tracking) |
| **User sensitivity** | Students view own grades | Parents EXTREMELY sensitive about money — any discrepancy = escalation |

### Design Principles for Financial Module

1. **APPEND-ONLY for payments** — Never UPDATE a payment record. If wrong, create a reversal/refund record. Original stays intact.
2. **Decimal precision** — Use Prisma `Decimal` with `@db.Decimal(12,2)` everywhere. Never use `Float`.
3. **Transactional writes** — Every payment recording must be wrapped in a `prisma.$transaction()`.
4. **Optimistic locking** — Use version fields or `updatedAt` checks to prevent concurrent overwrites on balances.
5. **Idempotency** — Payment actions must be idempotent (submitting same payment twice = one record, not two).
6. **Audit-everything** — Every mutation creates an audit log entry with full context.
7. **Receipt as proof** — A payment doesn't "exist" until it has a receipt number. Receipt generation is atomic with payment recording.

---

## 3. System Requirements — No Bullshit

### Admin Requirements

| # | Requirement | Priority |
|---|------------|----------|
| A1 | Admin can define fee types (Tuition, Lab Fee, Sports Fee, etc.) | P0 |
| A2 | Admin can create fee structures per class per academic session (Class 5 Tuition = Rs. 5,000/month) | P0 |
| A3 | Admin can define fee frequency: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL, ONE_TIME | P0 |
| A4 | Admin can generate fee assignments for all students in a class (bulk assign) | P0 |
| A5 | Admin can generate fee assignments for a specific student (individual assign) | P0 |
| A6 | Admin can record a payment against a student's fee — **STUDENT MODE** (cash, bank transfer, cheque, online) | P0 |
| A6b | Admin can record a payment against a family — **FAMILY MODE** (one payment, multiple children, auto-allocation) | P0 |
| A7 | Admin can generate a receipt for every payment (auto-sequential numbering) — individual OR family master receipt | P0 |
| A8 | Admin can view fee ledger (all payments) with filters: class, section, student, date range, status | P0 |
| A9 | Admin can view outstanding/overdue fees report | P0 |
| A10 | Admin can apply a discount/waiver to a student's fee (with reason) | P0 |
| A11 | Admin can apply late fee penalty (manual or auto-calculated) | P1 |
| A12 | Admin can reverse/refund a payment (with audit trail) — individual OR family-level reversal | P1 |
| A13 | Admin can view fee collection summary (total collected, outstanding, overdue — per class, per month) | P0 |
| A14 | Admin can print/export fee defaulters list | P1 |
| A15 | Admin can configure fee settings: receipt prefix, late fee %, grace period, installment rules | P1 |
| A16 | Admin can carry forward unpaid balance from previous session | P1 |
| A17 | Admin can partially pay (e.g., student owes Rs. 10,000 but pays Rs. 6,000) — balance tracked per installment | P0 |
| A18 | Admin can send fee reminder notifications to students/families with overdue fees | P1 |
| A19 | Admin can clone fee structure from previous academic session to current session | P1 |
| A20 | Admin can reallocate a family payment (change per-child distribution after the fact) | P1 |
| A21 | Admin can view class-wise fee report with drill-down to student level | P0 |

### Student Requirements

| # | Requirement | Priority |
|---|------------|----------|
| S1 | Student can view own fee summary: total payable, total paid, balance | P0 |
| S2 | Student can view payment history with receipt details | P0 |
| S3 | Student can view upcoming fee due dates | P0 |
| S4 | Student receives notification for: fee due reminder, overdue alert, payment confirmation | P0 |
| S5 | Student can download/print receipt (if admin has generated one) | P1 |

### Family Requirements

| # | Requirement | Priority |
|---|------------|----------|
| F1 | Family user sees aggregated fee summary across all linked children | P0 |
| F2 | Family user can see per-child fee breakdown | P0 |
| F3 | Family user can view payment history per child + family-level payments | P0 |
| F4 | Family user can view/download receipts per child + family master receipts | P1 |
| F5 | Family user receives notification for fee due dates, overdue alerts | P0 |
| F6 | Family user sees total outstanding amount across all children (overview widget) | P0 |

### Principal Requirements

| # | Requirement | Priority |
|---|------------|----------|
| P1 | Principal can view school-wide fee collection dashboard (total, collected, outstanding, overdue) | P0 |
| P2 | Principal can view class-wise fee collection comparison — "kis class ki kitni fee baki hai" | P0 |
| P3 | Principal can view monthly/quarterly collection trends | P0 |
| P4 | Principal can view fee defaulters list (students with overdue > N days) | P0 |
| P5 | Principal can view scholarship impact on fee collection (total discounts given) | P1 |
| P6 | Principal can drill-down into class report → see per-student fee status | P0 |
| P7 | Principal can view section-wise breakdown within a class | P1 |

### NON-Requirements (Out of Scope — V1)

| What | Why |
|------|-----|
| Online payment gateway (Stripe, JazzCash, EasyPaisa) | V2 feature — requires payment provider integration, webhook handling, 3D-Secure compliance |
| Fee installment auto-scheduling (EMI calculator) | V2 — keep it simple, admin defines structure, manual installment configuration |
| Tax (GST/VAT) calculation | Schools in Pakistan are typically tax-exempt on tuition. Add later if needed |
| Transport fee route management | Transport is a separate module — too complex for V1 |
| Fee-based SMS notifications | Email + in-app only for V1 |
| Sibling discount auto-calculation | V2 — admin can manually add discount for siblings |
| Fine/penalty for other reasons (library, discipline) | V2 — keep fee module focused on academic fees |
| Multi-currency support | Single school = single currency (PKR). Not SaaS |
| Bank reconciliation | V2 — requires bank statement parsing |
| Line-item level partial payment tracking | V1 uses assignment-level tracking — sufficient for Pakistan school context |
