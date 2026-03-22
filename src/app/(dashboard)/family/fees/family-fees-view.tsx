'use client';

import { useState } from 'react';
import { PageHeader, EmptyState } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FeeStatusBadge, PaymentStatusBadge, formatCurrency, formatMonth,
} from '@/modules/fees/components/fee-status-badge';
import { StudentLedgerDialog } from '@/modules/fees/components/student-ledger-dialog';
import { DollarSign, TrendingDown, BookOpen, History, ChevronRight, ChevronDown, AlertCircle, User2 } from 'lucide-react';
import type { fetchFamilyFeesOverviewAction } from '@/modules/fees/fee-self-service-actions';

type DirectPaymentEntry = {
  id: string; amount: number; receiptNumber: string; paymentMethod: string;
  referenceNumber: string | null; status: 'COMPLETED' | 'REVERSED'; paidAt: string;
  feeAssignment: { generatedForMonth: string; studentProfile: { user: { firstName: string; lastName: string } } | null } | null;
};

type AssignmentDiscount = {
  amount: number;
  source: 'RECURRING_STUDENT' | 'ON_SPOT_ADMIN' | 'FAMILY_ADJUSTMENT';
};

function getDiscountBreakdown(discounts?: AssignmentDiscount[]) {
  if (!discounts || discounts.length === 0) {
    return { recurringDiscount: 0, onSpotDiscount: 0 };
  }

  let recurringDiscount = 0;
  let onSpotDiscount = 0;

  for (const discount of discounts) {
    const amount = Number(discount.amount);
    if (discount.source === 'RECURRING_STUDENT') {
      recurringDiscount += amount;
    } else {
      onSpotDiscount += amount;
    }
  }

  return { recurringDiscount, onSpotDiscount };
}

type Props = {
  data: Awaited<ReturnType<typeof fetchFamilyFeesOverviewAction>>;
};

export function FamilyFeesView({ data }: Props) {
  const { children, familyPayments } = data;
  const directPayments: DirectPaymentEntry[] = ((data as unknown as { directPayments?: DirectPaymentEntry[] }).directPayments) ?? [];
  const [ledgerChild, setLedgerChild] = useState<{ id: string; name: string } | null>(null);
  const [expandedPaymentIds, setExpandedPaymentIds] = useState<Set<string>>(new Set());

  function togglePayment(id: string) {
    setExpandedPaymentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const totalDue = children.reduce((s, c) => s + c.assignments.reduce((a, f) => a + f.totalAmount, 0), 0);
  const totalPaid = children.reduce((s, c) => s + c.assignments.reduce((a, f) => a + f.paidAmount, 0), 0);
  const totalBalance = children.reduce((s, c) => s + c.assignments.reduce((a, f) => a + f.balanceAmount, 0), 0);
  const overdueCount = children.reduce(
    (s, c) => s + c.assignments.filter((a) => a.status === 'OVERDUE').length, 0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Fees"
        description="View fee assignments and full payment history for all your children."
        breadcrumbs={[{ label: 'Family', href: '/family' }, { label: 'Fees' }]}
      />

      {children.length === 0 ? (
        <EmptyState
          title="No children linked"
          description="No children with fee data found. Please contact the school to link your children."
        />
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <SummaryCard
              label="Total Fees"
              value={formatCurrency(totalDue)}
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
            />
            <SummaryCard
              label="Total Paid"
              value={formatCurrency(totalPaid)}
              valueClass="text-green-600 dark:text-green-400"
              icon={<BookOpen className="h-5 w-5 text-green-500" />}
            />
            <SummaryCard
              label="Remaining"
              value={formatCurrency(totalBalance)}
              valueClass={totalBalance > 0 ? 'text-amber-600 dark:text-amber-400' : undefined}
              icon={<TrendingDown className="h-5 w-5 text-amber-500" />}
            />
            <SummaryCard
              label="Overdue"
              value={overdueCount > 0 ? `${overdueCount} month${overdueCount > 1 ? 's' : ''}` : 'None'}
              valueClass={overdueCount > 0 ? 'text-destructive' : undefined}
              icon={<AlertCircle className={`h-5 w-5 ${overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />}
            />
          </div>

          {/* ── Overdue alert banner ── */}
          {overdueCount > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-destructive">
                <span className="font-medium">{overdueCount} overdue fee{overdueCount > 1 ? 's' : ''}</span>
                {' '}— please contact the school accounts office to settle the outstanding balance.
              </p>
            </div>
          )}

          {/* ── Tabs: per child + family ledger ── */}
          <Tabs defaultValue={children[0]?.child.id ?? 'payments'}>
            <TabsList className="flex flex-wrap h-auto gap-1 p-1">
              {children.map((c) => {
                const childBalance = c.assignments.reduce((s, a) => s + a.balanceAmount, 0);
                const hasOverdue = c.assignments.some((a) => a.status === 'OVERDUE');
                return (
                  <TabsTrigger key={c.child.id} value={c.child.id} className="flex items-center gap-1.5">
                    {c.child.user.firstName}
                    {hasOverdue && <span className="h-1.5 w-1.5 rounded-full bg-destructive" />}
                    {childBalance > 0 && !hasOverdue && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                  </TabsTrigger>
                );
              })}
              <TabsTrigger value="payments" className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                Ledger
                {(familyPayments.length + directPayments.length) > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {familyPayments.length + directPayments.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Per-child fee assignments ── */}
            {children.map((c) => {
              const childName = `${c.child.user.firstName} ${c.child.user.lastName}`;
              const childDue = c.assignments.reduce((s, a) => s + a.totalAmount, 0);
              const childPaid = c.assignments.reduce((s, a) => s + a.paidAmount, 0);
              const childBalance = c.assignments.reduce((s, a) => s + a.balanceAmount, 0);
              return (
                <TabsContent key={c.child.id} value={c.child.id} className="mt-4 space-y-4">
                  {/* Child header */}
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-base truncate">{childName}</p>
                            <Badge variant="secondary">{c.child.class?.name ?? 'N/A'}</Badge>
                            <span className="text-xs text-muted-foreground">Roll: {c.child.rollNumber}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>Due: <span className="font-mono text-foreground font-medium">{formatCurrency(childDue)}</span></span>
                            <span>Paid: <span className="font-mono text-green-600 font-medium">{formatCurrency(childPaid)}</span></span>
                            <span>Balance: <span className={`font-mono font-medium ${childBalance > 0 ? 'text-amber-600' : 'text-foreground'}`}>{formatCurrency(childBalance)}</span></span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => setLedgerChild({ id: c.child.id, name: childName })}
                        >
                          <History className="h-3.5 w-3.5 mr-1.5" />
                          Full Ledger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assignment list */}
                  {c.assignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No fees assigned yet.</p>
                  ) : (
                    <>
                      {/* Mobile: card view */}
                      <div className="space-y-2 sm:hidden">
                        {c.assignments.map((a) => (
                          <div key={a.id} className="rounded-lg border bg-card p-3 space-y-2">
                            {(() => {
                              const assignmentDiscounts = (a as typeof a & { discounts?: AssignmentDiscount[] }).discounts;
                              const { recurringDiscount, onSpotDiscount } = getDiscountBreakdown(assignmentDiscounts);
                              return (
                                <>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm">{formatMonth(a.generatedForMonth)}</p>
                              <FeeStatusBadge status={a.status} />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Total</p>
                                <p className="font-mono font-medium">{formatCurrency(a.totalAmount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Paid</p>
                                <p className="font-mono font-medium text-green-600">{formatCurrency(a.paidAmount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Balance</p>
                                <p className={`font-mono font-medium ${a.balanceAmount > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                                  {formatCurrency(a.balanceAmount)}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(a.dueDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {a.discountAmount > 0 && (
                              <div className="space-y-0.5 text-xs">
                                <p className="text-green-700 dark:text-green-400">Recurring discount: {formatCurrency(recurringDiscount)}</p>
                                <p className="text-emerald-700 dark:text-emerald-400">On-spot discount: {formatCurrency(onSpotDiscount)}</p>
                                <p className="text-muted-foreground">Total discount: {formatCurrency(a.discountAmount)}</p>
                              </div>
                            )}
                                </>
                              );
                            })()}
                          </div>
                        ))}
                      </div>

                      {/* Desktop: table view */}
                      <div className="hidden sm:block overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Month</th>
                              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total</th>
                              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Paid</th>
                              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Balance</th>
                              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Due Date</th>
                              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {c.assignments.map((a) => (
                              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                                {(() => {
                                  const assignmentDiscounts = (a as typeof a & { discounts?: AssignmentDiscount[] }).discounts;
                                  const { recurringDiscount, onSpotDiscount } = getDiscountBreakdown(assignmentDiscounts);
                                  return (
                                    <>
                                <td className="px-4 py-2.5 font-medium">{formatMonth(a.generatedForMonth)}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(a.totalAmount)}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-green-600">{formatCurrency(a.paidAmount)}</td>
                                <td className={`px-4 py-2.5 text-right font-mono font-medium ${a.balanceAmount > 0 ? 'text-amber-600' : ''}`}>
                                  {formatCurrency(a.balanceAmount)}
                                  {a.discountAmount > 0 && (
                                    <div className="mt-1 text-[10px] leading-tight text-muted-foreground">
                                      <div>R: {formatCurrency(recurringDiscount)}</div>
                                      <div>O: {formatCurrency(onSpotDiscount)}</div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-muted-foreground">
                                  {new Date(a.dueDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-2.5"><FeeStatusBadge status={a.status} /></td>
                                    </>
                                  );
                                })()}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </TabsContent>
              );
            })}

            {/* ── Family Ledger tab ── */}
            <TabsContent value="payments" className="mt-4 space-y-3">
              {familyPayments.length === 0 && directPayments.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Collected</p>
                      <p className="font-mono font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(
                          familyPayments.reduce((s: number, p) => s + p.totalAmount, 0) +
                          directPayments.reduce((s: number, p) => s + Number(p.amount), 0)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Family Payments</p>
                      <p className="font-bold">{familyPayments.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Individual Payments</p>
                      <p className="font-bold">{directPayments.length}</p>
                    </div>
                  </div>

                  {/* Payment rows — inline expandable */}
                  <div className="space-y-2">
                    {familyPayments.map((p) => {
                      const isExpanded = expandedPaymentIds.has(p.id);
                      type CP = {
                        id: string; amount: number; receiptNumber: string; status: 'COMPLETED' | 'REVERSED';
                        feeAssignment: {
                          generatedForMonth: string;
                          studentProfile: { rollNumber: string; user: { firstName: string; lastName: string } } | null;
                        } | null;
                      };
                      const childPayments: CP[] = (p as typeof p & { childPayments?: CP[] }).childPayments ?? [];

                      return (
                        <div key={p.id} className="rounded-lg border overflow-hidden">
                          {/* Header */}
                          <button
                            className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                            onClick={() => togglePayment(p.id)}
                            aria-expanded={isExpanded}
                          >
                            <span className="mt-0.5 text-muted-foreground shrink-0">
                              {isExpanded
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                              }
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs text-muted-foreground">{p.masterReceiptNumber}</span>
                                    <PaymentStatusBadge status={p.status} />
                                  </div>
                                  <p className="font-bold font-mono text-base mt-0.5">{formatCurrency(p.totalAmount)}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {p.paymentMethod.replace('_', ' ')}
                                    {' · '}
                                    {new Date(p.paidAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                {childPayments.length > 0 && (
                                  <Badge variant="outline" className="shrink-0 text-[10px]">
                                    {childPayments.length} student{childPayments.length !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Expanded per-student breakdown */}
                          {isExpanded && childPayments.length > 0 && (
                            <div className="border-t bg-muted/20">
                              {/* Mobile */}
                              <div className="sm:hidden divide-y">
                                {childPayments.map((cp) => {
                                  const student = cp.feeAssignment?.studentProfile;
                                  return (
                                    <div key={cp.id} className="flex items-start gap-3 px-4 py-2.5">
                                      <User2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                          {student ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {cp.feeAssignment ? formatMonth(cp.feeAssignment.generatedForMonth) : '—'}
                                          {' · '}<span className="font-mono">{cp.receiptNumber}</span>
                                        </p>
                                        <div className="mt-1"><PaymentStatusBadge status={cp.status} /></div>
                                      </div>
                                      <span className="font-mono font-semibold text-sm text-green-700 dark:text-green-400 shrink-0">
                                        {formatCurrency(Number(cp.amount))}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Desktop */}
                              <table className="hidden sm:table w-full text-xs">
                                <thead>
                                  <tr className="border-b text-muted-foreground">
                                    <th className="px-4 py-2 text-left font-medium">Student</th>
                                    <th className="px-4 py-2 text-left font-medium">Month</th>
                                    <th className="px-4 py-2 text-left font-medium">Receipt #</th>
                                    <th className="px-4 py-2 text-right font-medium">Allocated</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {childPayments.map((cp) => {
                                    const student = cp.feeAssignment?.studentProfile;
                                    return (
                                      <tr key={cp.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-2">
                                          {student ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown'}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                          {cp.feeAssignment ? formatMonth(cp.feeAssignment.generatedForMonth) : '—'}
                                        </td>
                                        <td className="px-4 py-2 font-mono text-muted-foreground">
                                          <div>{cp.receiptNumber}</div>
                                          <div className="mt-1"><PaymentStatusBadge status={cp.status} /></div>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono font-semibold text-green-700 dark:text-green-400">
                                          {formatCurrency(Number(cp.amount))}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  <tr className="bg-muted/40 font-semibold">
                                    <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Total allocated</td>
                                    <td className="px-4 py-2 text-right font-mono text-green-700 dark:text-green-400">
                                      {formatCurrency(childPayments.reduce((s, cp) => s + Number(cp.amount), 0))}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Tap any family payment to see the per-student allocation
                  </p>

                  {/* ── Individual student-wise payments ── */}
                  {directPayments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Individual Student Payments ({directPayments.length})</p>
                      <div className="rounded-lg border divide-y overflow-hidden">
                        {directPayments.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                            <User2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{p.feeAssignment?.studentProfile ? `${p.feeAssignment.studentProfile.user.firstName} ${p.feeAssignment.studentProfile.user.lastName}` : 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2 mt-0.5">
                                <span>{p.feeAssignment ? formatMonth(p.feeAssignment.generatedForMonth) : '—'}</span>
                                <span>{p.paymentMethod.replace('_', ' ')}</span>
                                <span>{new Date(p.paidAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="font-mono">{p.receiptNumber}</span>
                              </p>
                              <div className="mt-1"><PaymentStatusBadge status={p.status} /></div>
                            </div>
                            <span className="font-mono font-bold text-green-700 dark:text-green-400 shrink-0">{formatCurrency(Number(p.amount))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialogs */}
      {ledgerChild && (
        <StudentLedgerDialog
          open
          onClose={() => setLedgerChild(null)}
          studentProfileId={ledgerChild.id}
          studentName={ledgerChild.name}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClass,
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-muted-foreground leading-tight">{label}</p>
          {icon}
        </div>
        <p className={`text-lg font-bold font-mono truncate ${valueClass ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
