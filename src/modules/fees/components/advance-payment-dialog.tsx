'use client';

import { useState, useTransition } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/shared';
import { toast } from 'sonner';
import { recordAdvancePaymentAction } from '@/modules/fees/advance-payment-actions';

type Props = {
  open: boolean;
  onClose: () => void;
  studentProfileId: string;
  studentName: string;
  familyProfileId?: string;
  onSuccess?: () => void;
};

export function AdvancePaymentDialog({
  open, onClose, studentProfileId, studentName, familyProfileId, onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');

  function reset() {
    setAmount('');
    setReason('');
    setReference('');
  }

  function handleSubmit() {
    const numAmount = Number(amount);
    if (numAmount <= 0) { toast.error('Amount must be positive'); return; }

    startTransition(async () => {
      const result = await recordAdvancePaymentAction({
        studentProfileId,
        familyProfileId: familyProfileId || undefined,
        amount: numAmount,
        reason: reason || undefined,
        referenceNumber: reference || undefined,
      });
      if (result.success) {
        toast.success(`Advance payment of Rs. ${numAmount.toLocaleString()} recorded as credit`);
        reset();
        onClose();
        onSuccess?.();
      } else {
        toast.error(result.error ?? 'Failed to record advance payment');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Advance Payment</DialogTitle>
          <DialogDescription>
            {studentName} — This payment will be saved as credit and can be applied to future fee assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Amount (Rs.)</Label>
            <Input
              type="number" min={1} value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="font-mono"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <Label>Reason (optional)</Label>
            <Input
              value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Advance for next 2 months"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <Label>Reference # (optional)</Label>
            <Input
              value={reference} onChange={(e) => setReference(e.target.value)}
              placeholder="Bank transfer ref, cheque #"
              disabled={isPending}
            />
          </div>

          <div className="rounded border bg-muted/50 p-3 text-sm">
            <p className="text-muted-foreground">
              This amount will be stored as credit. When new fees are generated, this credit will
              automatically reduce the student&apos;s balance.
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={isPending || Number(amount) <= 0} className="w-full">
            {isPending && <Spinner size="sm" className="mr-2" />}
            Record Advance Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
