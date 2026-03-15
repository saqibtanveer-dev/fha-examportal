'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import {
  formatCurrency,
  formatMonth,
  PaymentStatusBadge,
} from './fee-status-badge';
import type { PaymentStatus } from '@prisma/client';
import { fetchFamilyPaymentsAction } from '@/modules/fees/fee-fetch-actions';
import {
  ChevronDown,
  ChevronRight,
  User2,
  Wallet,
  CreditCard,
  Receipt,
} from 'lucide-react';

// ── Inferred types from the query result ──
type ChildPayment = {
  id: string;
  amount: number;
  receiptNumber: string;
  feeAssignment: {
    generatedForMonth: string;
    studentProfile: {
      rollNumber: string;
      user: { firstName: string; lastName: string };
    } | null;
  } | null;
};

type FamilyPayment = {
  id: string;
  masterReceiptNumber: string;
  totalAmount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  paidAt: string;
  status: string;
  recordedBy: { firstName: string; lastName: string } | null;
  childPayments: ChildPayment[];
};

type Props = {
  familyProfileId: string | null;
  familyName: string;
  onClose: () => void;
};

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  ONLINE: 'Online',
  CHEQUE: 'Cheque',
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function FamilyLedgerDialog({ familyProfileId, familyName, onClose }: Props) {
  const [payments, setPayments] = useState<FamilyPayment[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!familyProfileId) { setPayments([]); setExpandedIds(new Set()); return; }
    startTransition(async () => {
      const result = await fetchFamilyPaymentsAction(familyProfileId);
      setPayments((result as FamilyPayment[]) ?? []);
    });
  }, [familyProfileId]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const totalCollected = payments.reduce((s, p) => s + p.totalAmount, 0);
  const totalPayments  = payments.length;

  return (
    <Dialog open={!!familyProfileId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 gap-0">

        {/* ── Sticky Header ── */}
        <DialogHeader className="p-5 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Family Ledger
          </DialogTitle>
          <DialogDescription>{familyName}</DialogDescription>

          {!isLoading && totalPayments > 0 && (
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t">
              <div className="text-sm">
                <p className="text-xs text-muted-foreground mb-0.5">Total Collected</p>
                <p className="font-mono font-bold text-green-600 dark:text-green-400 text-base">
                  {formatCurrency(totalCollected)}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground mb-0.5">Payments Made</p>
                <p className="font-bold text-base">{totalPayments}</p>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* ── Body ── */}
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Receipt className="h-8 w-8 opacity-40" />
              <p className="text-sm">No payments recorded for this family.</p>
            </div>
          ) : (
            payments.map((p) => {
              const isExpanded = expandedIds.has(p.id);
              return (
                <div key={p.id} className="rounded-lg border overflow-hidden">

                  {/* ── Payment summary row (clickable) ── */}
                  <button
                    className="w-full flex items-start gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(p.id)}
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
                            <span className="font-mono text-xs text-muted-foreground">
                              {p.masterReceiptNumber}
                            </span>
                            <PaymentStatusBadge status={p.status as PaymentStatus} />
                          </div>
                          <p className="font-bold font-mono text-lg leading-tight mt-0.5">
                            {formatCurrency(p.totalAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                            </span>
                            <span>{fmt(p.paidAt)}</span>
                            {p.recordedBy && (
                              <span className="hidden sm:inline">
                                By: {p.recordedBy.firstName} {p.recordedBy.lastName}
                              </span>
                            )}
                            {p.referenceNumber && <span>Ref: {p.referenceNumber}</span>}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {p.childPayments.length}&nbsp;
                          student{p.childPayments.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </button>

                  {/* ── Per-student breakdown (expanded) ── */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20">

                      {/* Mobile: stacked cards */}
                      <div className="sm:hidden divide-y">
                        {p.childPayments.map((cp) => {
                          const student = cp.feeAssignment?.studentProfile;
                          return (
                            <div key={cp.id} className="flex items-start gap-3 px-4 py-2.5">
                              <User2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">
                                  {student
                                    ? `${student.user.firstName} ${student.user.lastName}`
                                    : 'Unknown Student'
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {cp.feeAssignment
                                    ? formatMonth(cp.feeAssignment.generatedForMonth)
                                    : '—'
                                  }
                                  {' · '}
                                  <span className="font-mono">{cp.receiptNumber}</span>
                                </p>
                              </div>
                              <span className="font-mono font-semibold text-sm shrink-0 text-green-700 dark:text-green-400">
                                {formatCurrency(Number(cp.amount))}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop: table */}
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
                          {p.childPayments.map((cp) => {
                            const student = cp.feeAssignment?.studentProfile;
                            return (
                              <tr key={cp.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-2">
                                  {student
                                    ? `${student.user.firstName} ${student.user.lastName}`
                                    : 'Unknown'
                                  }
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {cp.feeAssignment
                                    ? formatMonth(cp.feeAssignment.generatedForMonth)
                                    : '—'
                                  }
                                </td>
                                <td className="px-4 py-2 font-mono text-muted-foreground">
                                  {cp.receiptNumber}
                                </td>
                                <td className="px-4 py-2 text-right font-mono font-semibold text-green-700 dark:text-green-400">
                                  {formatCurrency(Number(cp.amount))}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Row total */}
                          <tr className="bg-muted/40 font-semibold">
                            <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">
                              Total allocated
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-green-700 dark:text-green-400">
                              {formatCurrency(p.childPayments.reduce((s, cp) => s + Number(cp.amount), 0))}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Mobile recorded-by note */}
                      {p.recordedBy && (
                        <p className="sm:hidden px-4 py-2 text-xs text-muted-foreground border-t">
                          Recorded by: {p.recordedBy.firstName} {p.recordedBy.lastName}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
