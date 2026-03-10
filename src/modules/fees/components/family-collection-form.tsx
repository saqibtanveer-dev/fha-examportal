'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import { formatCurrency } from './fee-status-badge';
import { FamilyChildrenSummary } from './family-children-summary';
import { collectFamilyFeeAction } from '@/modules/fees/fee-collection-actions';
import { toast } from 'sonner';
import type { ChildWithAssignments } from '@/modules/fees/fee.types';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' }, { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' },
];

type Props = {
  familyId: string;
  children: ChildWithAssignments[];
  disabled: boolean;
  onSuccess: () => void;
};

export function FamilyCollectionForm({ familyId, children, disabled, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [discountAmounts, setDiscountAmounts] = useState<Record<string, string>>({});
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const invalidate = useInvalidateCache();

  const totalPayment = Object.values(paymentAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
  const totalDiscount = Object.values(discountAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
  const hasDiscounts = totalDiscount > 0;
  const hasAny = totalPayment > 0 || totalDiscount > 0;

  function handleSubmit() {
    if (!hasAny) { toast.error('Enter payment or discount amounts'); return; }
    if (hasDiscounts && (!discountReason || discountReason.length < 3)) {
      toast.error('Discount reason required (min 3 characters)'); return;
    }

    const allAssignments = children.flatMap((c) => c.assignments);
    const items = allAssignments
      .map((a) => ({
        feeAssignmentId: a.assignmentId,
        paymentAmount: Number(paymentAmounts[a.assignmentId]) || 0,
        discountAmount: Number(discountAmounts[a.assignmentId]) || 0,
      }))
      .filter((i) => i.paymentAmount > 0 || i.discountAmount > 0);

    if (items.length === 0) { toast.error('Enter amounts for at least one assignment'); return; }

    // Check per-assignment amounts don't exceed balance
    for (const item of items) {
      const a = allAssignments.find((x) => x.assignmentId === item.feeAssignmentId);
      if (a && item.paymentAmount + item.discountAmount > a.balanceAmount + 0.01) {
        toast.error(`Payment + discount exceeds balance for ${a.periodLabel}`);
        return;
      }
    }

    startTransition(async () => {
      const result = await collectFamilyFeeAction({
        familyProfileId: familyId,
        items,
        paymentMethod: method as 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE',
        referenceNumber: reference || undefined,
        discountReason: hasDiscounts ? discountReason : undefined,
      });

      if (result.success) {
        const parts = [];
        if (result.data!.totalPayment > 0) parts.push(`Paid: ${formatCurrency(result.data!.totalPayment)}`);
        if (result.data!.totalDiscount > 0) parts.push(`Discount: ${formatCurrency(result.data!.totalDiscount)}`);
        if (result.data!.masterReceiptNumber) parts.push(`Receipt: ${result.data!.masterReceiptNumber}`);
        toast.success(parts.join(' | '));
        setPaymentAmounts({});
        setDiscountAmounts({});
        setReference('');
        setDiscountReason('');
        await invalidate.afterFeePayment();
        onSuccess();
      } else {
        toast.error(result.error ?? 'Fee collection failed');
      }
    });
  }

  const isDisabled = disabled || isPending;

  return (
    <div className="space-y-4">
      <FamilyChildrenSummary
        mode="dual"
        children={children}
        paymentAmounts={paymentAmounts}
        discountAmounts={discountAmounts}
        onPaymentChange={(id, val) => setPaymentAmounts((p) => ({ ...p, [id]: val }))}
        onDiscountChange={(id, val) => setDiscountAmounts((p) => ({ ...p, [id]: val }))}
        disabled={isDisabled}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Method</Label>
          <Select value={method} onValueChange={setMethod} disabled={isDisabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Reference # (optional)</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} disabled={isDisabled} />
        </div>
      </div>

      {hasDiscounts && (
        <div className="space-y-1">
          <Label>Discount Reason</Label>
          <Input placeholder="e.g. Scholarship, Staff child, Sibling discount"
            value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} disabled={isDisabled} />
        </div>
      )}

      {hasAny && (
        <div className="rounded border bg-muted/50 p-3 text-sm space-y-1">
          {totalPayment > 0 && <div className="flex justify-between"><span>Total Payment</span><span className="font-mono">{formatCurrency(totalPayment)}</span></div>}
          {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Total Discount</span><span className="font-mono">-{formatCurrency(totalDiscount)}</span></div>}
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Total Applied</span>
            <span className="font-mono">{formatCurrency(totalPayment + totalDiscount)}</span>
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={isDisabled || !hasAny} className="w-full">
        {isPending && <Spinner size="sm" className="mr-2" />}
        Collect Family Fees
      </Button>
    </div>
  );
}
