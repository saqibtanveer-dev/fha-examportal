'use client';

import { useState, useTransition, useMemo } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/shared';
import { formatCurrency } from './fee-status-badge';
import { FamilySearchCombobox } from './family-search-combobox';
import { AllocationPreview } from './allocation-preview';
import { FamilyChildrenSummary } from './family-children-summary';
import { fetchFamilyChildrenWithFeesAction } from '@/modules/fees/fee-self-service-actions';
import { recordFamilyPaymentAction } from '@/modules/fees/family-payment-actions';
import { applyFamilyDiscountAction } from '@/modules/fees/family-discount-actions';
import { computeAllocation } from '@/modules/fees/allocation-engine';
import { toast } from 'sonner';
import { Users, CreditCard, Percent } from 'lucide-react';
import type { ChildWithAssignments, PendingAssignment, AllocationResult } from '@/modules/fees/fee.types';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' }, { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' },
];
const STRATEGIES = [
  { value: 'OLDEST_FIRST', label: 'Oldest First' }, { value: 'CHILD_PRIORITY', label: 'Child Priority' },
  { value: 'EQUAL_SPLIT', label: 'Equal Split' }, { value: 'CUSTOM', label: 'Custom Split' },
];

type FamilyChild = {
  child: { id: string; rollNumber: string; user: { firstName: string; lastName: string }; class: { name: string } | null };
  assignments: { id: string; generatedForMonth: string; balanceAmount: number; dueDate: string; lineItems: { categoryName: string; amount: number }[]; status: string }[];
};

export function FamilyPaymentTab() {
  const [isPending, startTransition] = useTransition();
  const [familyId, setFamilyId] = useState('');
  const [familyLabel, setFamilyLabel] = useState('');
  const [childrenData, setChildrenData] = useState<FamilyChild[]>([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [strategy, setStrategy] = useState<'OLDEST_FIRST' | 'CHILD_PRIORITY' | 'EQUAL_SPLIT' | 'CUSTOM'>('OLDEST_FIRST');
  const [preview, setPreview] = useState<AllocationResult | null>(null);
  const [mode, setMode] = useState<'pay' | 'discount'>('pay');
  const [discountReason, setDiscountReason] = useState('');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const invalidate = useInvalidateCache();

  function loadFamilyFees(profileId: string) {
    startTransition(async () => {
      try {
        const result = await fetchFamilyChildrenWithFeesAction(profileId);
        setChildrenData((result as FamilyChild[]) ?? []);
        setPreview(null);
        if (!result || result.length === 0) {
          toast.info('No pending fees found for this family');
        }
      } catch {
        toast.error('Family not found or no access');
      }
    });
  }

  const children: ChildWithAssignments[] = useMemo(() => {
    return childrenData
      .filter((c) => c.assignments.some((a) => a.balanceAmount > 0 && a.status !== 'CANCELLED' && a.status !== 'PAID'))
      .map((c) => ({
        childId: c.child.id,
        childName: `${c.child.user.firstName} ${c.child.user.lastName}`,
        className: c.child.class?.name ?? '',
        assignments: c.assignments
          .filter((a) => a.balanceAmount > 0 && a.status !== 'CANCELLED' && a.status !== 'PAID')
          .map((a): PendingAssignment => ({
            assignmentId: a.id,
            periodLabel: a.generatedForMonth,
            categoryName: a.lineItems.map((li) => li.categoryName).join(', '),
            dueDate: a.dueDate,
            balanceAmount: a.balanceAmount,
          })),
      }));
  }, [childrenData]);

  const totalPending = useMemo(() =>
    children.reduce((sum, c) =>
      sum + c.assignments.reduce((s, a) => s + a.balanceAmount, 0), 0),
    [children],
  );

  function buildCustomAllocations() {
    return Object.entries(customAmounts).filter(([, v]) => Number(v) > 0).map(([id, v]) => ({ feeAssignmentId: id, amount: Number(v) }));
  }

  function handlePreview() {
    if (strategy === 'CUSTOM') {
      const customAllocations = buildCustomAllocations();
      const total = customAllocations.reduce((s, a) => s + a.amount, 0);
      if (total <= 0) { toast.error('Enter amounts for at least one assignment'); return; }
      setTotalAmount(String(total));
      setPreview(computeAllocation({ totalAmount: total, strategy: 'CUSTOM', children, customAllocations }));
    } else {
      if (!totalAmount || Number(totalAmount) <= 0) { toast.error('Enter a valid amount'); return; }
      setPreview(computeAllocation({ totalAmount: Number(totalAmount), strategy, children }));
    }
  }

  function handleConfirm() {
    if (!preview) return;
    startTransition(async () => {
      const customAllocations = strategy === 'CUSTOM' ? buildCustomAllocations() : undefined;

      const result = await recordFamilyPaymentAction({
        familyProfileId: familyId,
        totalAmount: Number(totalAmount),
        paymentMethod: method as 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE',
        referenceNumber: reference || undefined,
        allocationStrategy: strategy,
        customAllocations,
      });

      if (result.success) {
        const msg = result.data?.unallocated && result.data.unallocated > 0.01
          ? `Payment recorded (${formatCurrency(result.data.totalAllocated)}). ${formatCurrency(result.data.unallocated)} was not allocated. Receipt: ${result.data.masterReceiptNumber}`
          : `Family payment recorded. Receipt: ${result.data?.masterReceiptNumber}`;
        toast.success(msg);
        setPreview(null);
        setTotalAmount('');
        setReference('');
        setCustomAmounts({});
        await invalidate.afterFeePayment();
        loadFamilyFees(familyId);
      } else {
        toast.error(result.error ?? 'Payment failed');
      }
    });
  }

  function handleDiscount() {
    if (!discountReason) { toast.error('Enter a reason for the discount'); return; }
    const discounts = buildCustomAllocations();
    if (discounts.length === 0) { toast.error('Enter discount amounts'); return; }

    startTransition(async () => {
      const result = await applyFamilyDiscountAction({
        familyProfileId: familyId,
        discounts,
        reason: discountReason,
      });
      if (result.success) {
        toast.success(`Discount applied: ${formatCurrency(result.data?.totalDiscount ?? 0)} across ${result.data?.appliedCount} assignment(s)`);
        setCustomAmounts({});
        setDiscountReason('');
        await invalidate.afterFeePayment();
        loadFamilyFees(familyId);
      } else {
        toast.error(result.error ?? 'Discount failed');
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />Family Bulk Payment
          </CardTitle>
          <CardDescription>
            Record a single payment that covers fees for multiple children in a family.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FamilySearchCombobox
            value={familyId}
            selectedLabel={familyLabel}
            disabled={isPending}
            onSelect={(family) => {
              setFamilyId(family.familyProfileId);
              setFamilyLabel(`${family.parentName} (${family.relationship}) — ${family.childrenCount} child(ren)`);
              setChildrenData([]);
              setPreview(null);
              loadFamilyFees(family.familyProfileId);
            }}
            onClear={() => {
              setFamilyId('');
              setFamilyLabel('');
              setChildrenData([]);
              setPreview(null);
            }}
          />

          {children.length > 0 && (
            <>
              <div className="text-sm text-muted-foreground">
                {children.length} child(ren) with pending fees.
                Total outstanding: <span className="font-semibold">{formatCurrency(totalPending)}</span>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button size="sm" variant={mode === 'pay' ? 'default' : 'outline'} onClick={() => { setMode('pay'); setPreview(null); }}>
                  <CreditCard className="mr-1 h-3 w-3" />Payment
                </Button>
                <Button size="sm" variant={mode === 'discount' ? 'default' : 'outline'} onClick={() => { setMode('discount'); setPreview(null); }}>
                  <Percent className="mr-1 h-3 w-3" />Discount
                </Button>
              </div>

              <FamilyChildrenSummary
                children={children}
                showAmountInputs={strategy === 'CUSTOM' || mode === 'discount'}
                customAmounts={customAmounts}
                onCustomAmountChange={(id, val) => setCustomAmounts((prev) => ({ ...prev, [id]: val }))}
                disabled={isPending}
              />

              {mode === 'pay' ? (
                <>
                  {/* Payment form */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {strategy !== 'CUSTOM' && (
                      <div className="space-y-1">
                        <Label>Total Amount</Label>
                        <Input
                          type="number" min={1} value={totalAmount}
                          onChange={(e) => { setTotalAmount(e.target.value); setPreview(null); }}
                          disabled={isPending} className="font-mono"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Strategy</Label>
                      <Select value={strategy} onValueChange={(v) => { setStrategy(v as typeof strategy); setPreview(null); }} disabled={isPending}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STRATEGIES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Method</Label>
                      <Select value={method} onValueChange={setMethod} disabled={isPending}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Reference # (optional)</Label>
                      <Input value={reference} onChange={(e) => setReference(e.target.value)} disabled={isPending} />
                    </div>
                  </div>
                  <Button onClick={handlePreview} disabled={isPending || (strategy !== 'CUSTOM' && !totalAmount)} className="w-full" variant="outline">
                    Preview Allocation
                  </Button>
                </>
              ) : (
                <>
                  {/* Discount form */}
                  <div className="space-y-1">
                    <Label>Reason for Discount</Label>
                    <Input
                      placeholder="e.g. Scholarship, Staff child, Sibling discount"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter discount amounts for each assignment above, then apply.
                  </p>
                  <Button onClick={handleDiscount} disabled={isPending || !discountReason} className="w-full">
                    {isPending && <Spinner size="sm" className="mr-2" />}
                    Apply Family Discount
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Allocation Preview */}
      {preview && mode === 'pay' && (
        <AllocationPreview preview={preview} isPending={isPending} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
