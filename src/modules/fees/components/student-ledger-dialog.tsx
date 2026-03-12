'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth, FeeStatusBadge } from './fee-status-badge';
import { fetchStudentLedgerAction } from '@/modules/fees/fee-fetch-actions';
import type { FeeAssignmentStatus } from '@prisma/client';

type Payment = {
  id: string; amount: number; paymentMethod: string;
  referenceNumber: string | null; receiptNumber: string;
  paidAt: string;
  recordedBy: { firstName: string; lastName: string } | null;
};

type Discount = {
  id: string; amount: number; reason: string; createdAt: string;
  appliedBy: { firstName: string; lastName: string } | null;
};

type LineItem = { id: string; categoryName: string; amount: number };

type Assignment = {
  id: string; generatedForMonth: string; totalAmount: number;
  paidAmount: number; discountAmount: number; balanceAmount: number;
  lateFeesApplied: number; status: FeeAssignmentStatus; dueDate: string;
  lineItems: LineItem[]; payments: Payment[]; discounts: Discount[];
};

type Credit = {
  id: string; amount: number; remainingAmount: number;
  reason: string; status: string; referenceNumber: string | null;
  createdAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  studentProfileId: string;
  studentName: string;
};

export function StudentLedgerDialog({ open, onClose, studentProfileId, studentName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);

  useEffect(() => {
    if (!open || !studentProfileId) return;
    startTransition(async () => {
      try {
        const data = await fetchStudentLedgerAction(studentProfileId);
        if (data) {
          setAssignments((data.assignments ?? []) as Assignment[]);
          setCredits((data.credits ?? []) as Credit[]);
        }
      } catch { /* handled by safe-action */ }
    });
  }, [open, studentProfileId]);

  const totalDue = assignments.reduce((s, a) => s + a.totalAmount, 0);
  const totalPaid = assignments.reduce((s, a) => s + a.paidAmount, 0);
  const totalDiscount = assignments.reduce((s, a) => s + a.discountAmount, 0);
  const totalBalance = assignments.reduce((s, a) => s + a.balanceAmount, 0);
  const totalCredits = credits.reduce((s, c) => s + c.remainingAmount, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Ledger</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        {isPending && <div className="flex justify-center py-8"><Spinner /></div>}

        {!isPending && (
          <div className="space-y-4 text-sm">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SummaryCard label="Total Fees" value={formatCurrency(totalDue)} />
              <SummaryCard label="Total Paid" value={formatCurrency(totalPaid)} className="text-blue-600" />
              <SummaryCard label="Discounts" value={formatCurrency(totalDiscount)} className="text-green-600" />
              <SummaryCard label="Balance" value={formatCurrency(totalBalance)} className="text-amber-600" />
            </div>

            {totalCredits > 0 && (
              <div className="rounded-md border border-green-200 bg-green-50 dark:bg-green-950/30 px-3 py-2 text-xs text-green-700 dark:text-green-400">
                Available Credit: <span className="font-mono font-semibold">{formatCurrency(totalCredits)}</span> (auto-applies to next fee)
              </div>
            )}

            {/* Monthly breakdown */}
            {assignments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No fee assignments found.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <MonthCard key={a.id} assignment={a} />
                ))}
              </div>
            )}

            {/* Credit history */}
            {credits.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-muted-foreground">Credit History</h4>
                {credits.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded border px-3 py-2 text-xs">
                    <div>
                      <span className="font-medium">{c.reason}</span>
                      {c.referenceNumber && <span className="ml-2 text-muted-foreground">({c.referenceNumber})</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{formatCurrency(c.amount)}</span>
                      {c.remainingAmount < c.amount && (
                        <span className="ml-1 text-muted-foreground">
                          ({formatCurrency(c.amount - c.remainingAmount)} used)
                        </span>
                      )}
                      <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'} className="ml-2 text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-md border px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-mono font-semibold ${className ?? ''}`}>{value}</p>
    </div>
  );
}

function MonthCard({ assignment: a }: { assignment: Assignment }) {
  return (
    <div className="rounded-lg border">
      {/* Month header */}
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatMonth(a.generatedForMonth)}</span>
          <FeeStatusBadge status={a.status} />
        </div>
        <span className="font-mono text-xs">
          {formatCurrency(a.paidAmount)} / {formatCurrency(a.totalAmount)}
        </span>
      </div>

      <div className="px-3 py-2 space-y-2">
        {/* Line items */}
        <div className="space-y-0.5">
          {a.lineItems.map((li) => (
            <div key={li.id} className="flex justify-between text-xs">
              <span>{li.categoryName}</span>
              <span className="font-mono">{formatCurrency(li.amount)}</span>
            </div>
          ))}
          {a.lateFeesApplied > 0 && (
            <div className="flex justify-between text-xs text-orange-600">
              <span>Late Fee</span><span className="font-mono">{formatCurrency(a.lateFeesApplied)}</span>
            </div>
          )}
        </div>

        {/* Discounts applied */}
        {a.discounts.length > 0 && (
          <div className="space-y-0.5 border-t pt-1">
            {a.discounts.map((d) => (
              <div key={d.id} className="flex justify-between text-xs text-green-600">
                <span>{d.reason} {d.appliedBy && <span className="text-muted-foreground">({d.appliedBy.firstName})</span>}</span>
                <span className="font-mono">-{formatCurrency(d.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Payments */}
        {a.payments.length > 0 && (
          <div className="space-y-1 border-t pt-1">
            {a.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1">{p.paymentMethod}</Badge>
                  <span className="text-muted-foreground">{new Date(p.paidAt).toLocaleDateString('en-PK')}</span>
                  {p.recordedBy && (
                    <span className="text-muted-foreground">by {p.recordedBy.firstName}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-blue-600">{formatCurrency(p.amount)}</span>
                  <span className="ml-1 text-muted-foreground text-[10px]">{p.receiptNumber}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Balance */}
        {a.balanceAmount > 0 && (
          <div className="flex justify-between text-xs font-medium border-t pt-1 text-amber-600">
            <span>Remaining</span><span className="font-mono">{formatCurrency(a.balanceAmount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
