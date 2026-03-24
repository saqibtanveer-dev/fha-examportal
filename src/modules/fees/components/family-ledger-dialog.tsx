'use client';

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth } from './fee-status-badge';
import { PaymentStatusBadge } from './fee-status-badge';
import { fetchFamilyFullLedgerAction } from '@/modules/fees/fee-fetch-actions';
import { ChevronDown, ChevronRight, User2, Wallet, CreditCard, Receipt } from 'lucide-react';

type ChildPaymentEntry = {
  id: string; amount: number; receiptNumber: string; status: 'COMPLETED' | 'REVERSED';
  feeAssignment: { generatedForMonth: string; studentProfile: { rollNumber: string; user: { firstName: string; lastName: string } } | null } | null;
};
type FamilyPaymentEntry = {
  id: string; masterReceiptNumber: string; totalAmount: number; paymentMethod: string;
  referenceNumber: string | null; paidAt: string; recordedBy: { firstName: string; lastName: string } | null;
  childPayments: ChildPaymentEntry[];
};
type DirectPaymentEntry = {
  id: string; amount: number; receiptNumber: string; paymentMethod: string;
  referenceNumber: string | null; status: 'COMPLETED' | 'REVERSED'; paidAt: string;
  recordedBy: { firstName: string; lastName: string } | null;
  feeAssignment: { generatedForMonth: string; studentProfile: { rollNumber: string; user: { firstName: string; lastName: string } } | null } | null;
};
type FamilyAssignmentEntry = {
  id: string;
  generatedForMonth: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED' | 'CANCELLED';
  studentProfile: { rollNumber: string; user: { firstName: string; lastName: string } } | null;
};
type LedgerData = { familyPayments: FamilyPaymentEntry[]; directPayments: DirectPaymentEntry[]; assignments: FamilyAssignmentEntry[] };

type Props = { familyProfileId: string | null; familyName: string; onClose: () => void };

const METHOD: Record<string, string> = { CASH: 'Cash', BANK_TRANSFER: 'Bank Transfer', ONLINE: 'Online', CHEQUE: 'Cheque' };
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export function FamilyLedgerDialog({ familyProfileId, familyName, onClose }: Props) {
  const [data, setData] = useState<LedgerData>({ familyPayments: [], directPayments: [], assignments: [] });
  const [isLoading, startTransition] = useTransition();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!familyProfileId) return;
    startTransition(async () => {
      const result = await fetchFamilyFullLedgerAction(familyProfileId);
      setData((result as LedgerData) ?? { familyPayments: [], directPayments: [], assignments: [] });
    });
  }, [familyProfileId]);

  const toggle = (id: string) => setExpandedIds((prev) => {
    const n = new Set(prev);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    return n;
  });
  const totalCollected = data.familyPayments.reduce((s, p) => s + Number(p.totalAmount), 0) + data.directPayments.reduce((s, p) => s + Number(p.amount), 0);
  const openAssignments = data.assignments.filter((a) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(a.status));
  const outstandingAmount = openAssignments.reduce((sum, item) => sum + Number(item.balanceAmount), 0);
  const hasAny = data.familyPayments.length > 0 || data.directPayments.length > 0 || data.assignments.length > 0;

  return (
    <Dialog open={!!familyProfileId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-5 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" />Family Ledger</DialogTitle>
          <DialogDescription>{familyName}</DialogDescription>
          {!isLoading && hasAny && (
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t text-sm">
              <div><p className="text-xs text-muted-foreground mb-0.5">Total Collected</p><p className="font-mono font-bold text-green-600 dark:text-green-400 text-base">{formatCurrency(totalCollected)}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Family Payments</p><p className="font-bold text-base">{data.familyPayments.length}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Individual Payments</p><p className="font-bold text-base">{data.directPayments.length}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Open Months</p><p className="font-bold text-base">{openAssignments.length}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Outstanding</p><p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">{formatCurrency(outstandingAmount)}</p></div>
            </div>
          )}
        </DialogHeader>

        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : !hasAny ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Receipt className="h-8 w-8 opacity-40" /><p className="text-sm">No payments recorded for this family.</p>
            </div>
          ) : (
            <>
              {data.assignments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    Assignment Ledger ({data.assignments.length})
                  </p>
                  <div className="rounded-lg border divide-y overflow-hidden">
                    {data.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/20 transition-colors">
                        <User2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {assignment.studentProfile
                                  ? `${assignment.studentProfile.user.firstName} ${assignment.studentProfile.user.lastName}`
                                  : 'Unknown Student'}
                              </p>
                              <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2 mt-0.5">
                                <span>{formatMonth(assignment.generatedForMonth)}</span>
                                <span>Due: {fmtDate(assignment.dueDate)}</span>
                              </p>
                              <div className="mt-1">
                                <Badge variant={assignment.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                                  {assignment.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] text-muted-foreground">Balance</p>
                              <p className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                {formatCurrency(Number(assignment.balanceAmount))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Family-wise bulk payments ── */}
              {data.familyPayments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Family Payments ({data.familyPayments.length})</p>
                  {data.familyPayments.map((p) => {
                    const isExpanded = expandedIds.has(p.id);
                    return (
                      <div key={p.id} className="rounded-lg border overflow-hidden">
                        <button className="w-full flex items-start gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors" onClick={() => toggle(p.id)} aria-expanded={isExpanded}>
                          <span className="mt-0.5 text-muted-foreground shrink-0">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="font-mono text-xs text-muted-foreground">{p.masterReceiptNumber}</span>
                                <p className="font-bold font-mono text-lg leading-tight mt-0.5">{formatCurrency(Number(p.totalAmount))}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                                  <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{METHOD[p.paymentMethod] ?? p.paymentMethod}</span>
                                  <span>{fmtDate(p.paidAt)}</span>
                                  {p.referenceNumber && <span>Ref: {p.referenceNumber}</span>}
                                </p>
                              </div>
                              <Badge variant="outline" className="shrink-0 text-[10px]">{p.childPayments.length} student{p.childPayments.length !== 1 ? 's' : ''}</Badge>
                            </div>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t bg-muted/20">
                            <div className="sm:hidden divide-y">
                              {p.childPayments.map((cp) => (
                                <div key={cp.id} className="flex items-center gap-3 px-4 py-2.5">
                                  <User2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0 text-sm"><p className="font-medium">{cp.feeAssignment?.studentProfile ? `${cp.feeAssignment.studentProfile.user.firstName} ${cp.feeAssignment.studentProfile.user.lastName}` : 'Unknown'}</p><p className="text-xs text-muted-foreground">{cp.feeAssignment ? formatMonth(cp.feeAssignment.generatedForMonth) : '—'} · <span className="font-mono">{cp.receiptNumber}</span></p></div>
                                  <PaymentStatusBadge status={cp.status} />
                                  <span className="font-mono font-semibold text-sm text-green-700 dark:text-green-400">{formatCurrency(Number(cp.amount))}</span>
                                </div>
                              ))}
                            </div>
                            <table className="hidden sm:table w-full text-xs">
                              <thead><tr className="border-b text-muted-foreground"><th className="px-4 py-2 text-left font-medium">Student</th><th className="px-4 py-2 text-left font-medium">Month</th><th className="px-4 py-2 text-left font-medium">Receipt #</th><th className="px-4 py-2 text-left font-medium">Status</th><th className="px-4 py-2 text-right font-medium">Amount</th></tr></thead>
                              <tbody className="divide-y">
                                {p.childPayments.map((cp) => (
                                  <tr key={cp.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-2">{cp.feeAssignment?.studentProfile ? `${cp.feeAssignment.studentProfile.user.firstName} ${cp.feeAssignment.studentProfile.user.lastName}` : 'Unknown'}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{cp.feeAssignment ? formatMonth(cp.feeAssignment.generatedForMonth) : '—'}</td>
                                    <td className="px-4 py-2 font-mono text-muted-foreground">{cp.receiptNumber}</td>
                                    <td className="px-4 py-2"><PaymentStatusBadge status={cp.status} /></td>
                                    <td className="px-4 py-2 text-right font-mono font-semibold text-green-700 dark:text-green-400">{formatCurrency(Number(cp.amount))}</td>
                                  </tr>
                                ))}
                                <tr className="bg-muted/40 font-semibold"><td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">Total</td><td className="px-4 py-2 text-right font-mono text-green-700 dark:text-green-400">{formatCurrency(p.childPayments.reduce((s, cp) => s + Number(cp.amount), 0))}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Direct student-wise payments ── */}
              {data.directPayments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Individual Student Payments ({data.directPayments.length})</p>
                  <div className="rounded-lg border divide-y overflow-hidden">
                    {data.directPayments.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/20 transition-colors">
                        <User2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{p.feeAssignment?.studentProfile ? `${p.feeAssignment.studentProfile.user.firstName} ${p.feeAssignment.studentProfile.user.lastName}` : 'Unknown Student'}</p>
                              <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2 mt-0.5">
                                <span>{p.feeAssignment ? formatMonth(p.feeAssignment.generatedForMonth) : '—'}</span>
                                <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{METHOD[p.paymentMethod] ?? p.paymentMethod}</span>
                                <span>{fmtDate(p.paidAt)}</span>
                                <span className="font-mono">{p.receiptNumber}</span>
                                {p.referenceNumber && <span>Ref: {p.referenceNumber}</span>}
                              </p>
                              <div className="mt-1"><PaymentStatusBadge status={p.status} /></div>
                            </div>
                            <span className="font-mono font-bold text-green-700 dark:text-green-400 shrink-0">{formatCurrency(Number(p.amount))}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
