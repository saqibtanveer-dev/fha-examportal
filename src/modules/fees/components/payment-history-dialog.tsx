'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth, PaymentStatusBadge } from './fee-status-badge';
import { fetchAssignmentDetailAction } from '@/modules/fees/fee-client-core-fetch-actions';

type Payment = {
  id: string; amount: number; paymentMethod: string;
  referenceNumber: string | null; receiptNumber: string;
  status: string; paidAt: string;
  recordedBy: { firstName: string; lastName: string } | null;
};

type Discount = {
  id: string; amount: number; source: 'RECURRING_STUDENT' | 'ON_SPOT_ADMIN' | 'FAMILY_ADJUSTMENT'; reason: string; createdAt: string;
  appliedBy: { firstName: string; lastName: string } | null;
};

function getDiscountSourceLabel(source: Discount['source']): string {
  if (source === 'RECURRING_STUDENT') return 'Recurring';
  if (source === 'FAMILY_ADJUSTMENT') return 'Family adjustment';
  return 'On-spot';
}

type LineItem = { id: string; categoryName: string; amount: number };

type AssignmentDetail = {
  id: string; generatedForMonth: string; totalAmount: number;
  paidAmount: number; discountAmount: number; balanceAmount: number;
  status: string; dueDate: string;
  studentProfile: {
    rollNumber: string;
    user: { firstName: string; lastName: string };
    class: { name: string } | null;
  } | null;
  lineItems: LineItem[];
  payments: Payment[];
  discounts: Discount[];
};

type Props = {
  assignmentId: string | null;
  onClose: () => void;
};

export function PaymentHistoryDialog({ assignmentId, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [detail, setDetail] = useState<AssignmentDetail | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    startTransition(async () => {
      try {
        const result = await fetchAssignmentDetailAction(assignmentId);
        setDetail(result as AssignmentDetail | null);
      } catch {
        setDetail(null);
      }
    });
  }, [assignmentId]);

  const student = detail?.studentProfile;
  const studentName = student ? `${student.user.firstName} ${student.user.lastName}` : '';

  return (
    <Dialog open={!!assignmentId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Assignment Detail</DialogTitle>
          <DialogDescription>
            {detail ? `${studentName} — ${formatMonth(detail.generatedForMonth)}` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {isPending && <div className="flex justify-center py-8"><Spinner /></div>}

        {!isPending && !detail && (
          <p className="text-sm text-muted-foreground py-4">Assignment not found.</p>
        )}

        {!isPending && detail && (
          <div className="space-y-4 text-sm">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 rounded border p-3">
              <SummaryRow label="Total" value={formatCurrency(detail.totalAmount)} />
              <SummaryRow label="Paid" value={formatCurrency(detail.paidAmount)} className="text-blue-600" />
              <SummaryRow label="Discount" value={formatCurrency(detail.discountAmount)} className="text-green-600" />
              <SummaryRow label="Balance" value={formatCurrency(detail.balanceAmount)} className="font-semibold" />
              <div className="col-span-2 flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={detail.status === 'PAID' ? 'default' : detail.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                  {detail.status}
                </Badge>
              </div>
            </div>

            {/* Line Items */}
            <Section title="Fee Breakdown">
              {detail.lineItems.map((li) => (
                <div key={li.id} className="flex justify-between">
                  <span>{li.categoryName}</span>
                  <span className="font-mono">{formatCurrency(li.amount)}</span>
                </div>
              ))}
            </Section>

            {/* Payments */}
            {detail.payments.length > 0 && (
              <Section title={`Payments (${detail.payments.length})`}>
                {detail.payments.map((p) => (
                  <div key={p.id} className="rounded border p-2 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="font-mono text-blue-600">{formatCurrency(p.amount)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{p.paymentMethod}</Badge>
                        <PaymentStatusBadge status={p.status === 'REVERSED' ? 'REVERSED' : 'COMPLETED'} />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Receipt: {p.receiptNumber}</span>
                      <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                    </div>
                    {p.referenceNumber && (
                      <div className="text-xs text-muted-foreground">Ref: {p.referenceNumber}</div>
                    )}
                    {p.recordedBy && (
                      <div className="text-xs text-muted-foreground">
                        By: {p.recordedBy.firstName} {p.recordedBy.lastName}
                      </div>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {/* Discounts */}
            {detail.discounts.length > 0 && (
              <Section title={`Discounts (${detail.discounts.length})`}>
                {detail.discounts.map((d) => (
                  <div key={d.id} className="rounded border border-green-200 bg-green-50 dark:bg-green-950/20 p-2 space-y-1">
                    <div className="flex justify-between font-medium text-green-700">
                      <span>
                        {d.reason}
                        <span className="ml-1 text-xs text-muted-foreground">({getDiscountSourceLabel(d.source)})</span>
                      </span>
                      <span className="font-mono">-{formatCurrency(d.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{d.appliedBy ? `${d.appliedBy.firstName} ${d.appliedBy.lastName}` : ''}</span>
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {detail.payments.length === 0 && detail.discounts.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No payment or discount history yet.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${className ?? ''}`}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}
