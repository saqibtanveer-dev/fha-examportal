'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth, PaymentStatusBadge } from './fee-status-badge';
import { fetchFamilyPaymentDetailAction } from '@/modules/fees/fee-fetch-actions';

type Props = {
  paymentId: string | null;
  onClose: () => void;
};

type PaymentDetail = NonNullable<Awaited<ReturnType<typeof fetchFamilyPaymentDetailAction>>>;

export function FamilyPaymentDetailDialog({ paymentId, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setPayment(null);
      return;
    }
    startTransition(async () => {
      try {
        const data = await fetchFamilyPaymentDetailAction(paymentId);
        setPayment(data ?? null);
      } catch { /* handled by safe-action */ }
    });
  }, [paymentId]);

  const totalAllocated = payment?.childPayments.reduce((s, cp) => s + Number(cp.amount), 0) ?? 0;

  return (
    <Dialog open={!!paymentId} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Breakdown</DialogTitle>
          {payment && (
            <DialogDescription>
              {payment.masterReceiptNumber} &middot;{' '}
              {new Date(payment.paidAt).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </DialogDescription>
          )}
        </DialogHeader>

        {isPending && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isPending && payment && (
          <div className="space-y-4 text-sm">
            {/* Summary block */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-mono font-bold text-base">{formatCurrency(payment.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <Badge variant="outline">{payment.paymentMethod}</Badge>
              </div>
              {payment.referenceNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reference #</span>
                  <span className="font-mono text-xs">{payment.referenceNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recorded by</span>
                <span>
                  {payment.recordedBy
                    ? `${payment.recordedBy.firstName} ${payment.recordedBy.lastName}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>

            <Separator />

            {/* Per-child fee breakdown */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Fee Allocation ({payment.childPayments.length} item{payment.childPayments.length !== 1 ? 's' : ''})
              </h4>

              {payment.childPayments.length === 0 ? (
                <p className="text-center text-muted-foreground text-xs py-3">No breakdown available.</p>
              ) : (
                <div className="space-y-2">
                  {payment.childPayments.map((cp) => {
                    const studentName = cp.feeAssignment?.studentProfile?.user
                      ? `${cp.feeAssignment.studentProfile.user.firstName} ${cp.feeAssignment.studentProfile.user.lastName}`
                      : '—';
                    const month = cp.feeAssignment?.generatedForMonth
                      ? formatMonth(cp.feeAssignment.generatedForMonth)
                      : '—';
                    return (
                      <div key={cp.id} className="flex items-center justify-between rounded-md border px-3 py-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{studentName}</p>
                          <p className="text-xs text-muted-foreground">{month}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cp.receiptNumber}</p>
                        </div>
                        <span className="font-mono font-semibold text-sm shrink-0">
                          {formatCurrency(Number(cp.amount))}
                        </span>
                      </div>
                    );
                  })}

                  {/* Total line */}
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 font-medium">
                    <span>Total Allocated</span>
                    <span className="font-mono">{formatCurrency(totalAllocated)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isPending && !payment && paymentId && (
          <p className="text-center text-muted-foreground text-sm py-4">
            Payment details not found.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
