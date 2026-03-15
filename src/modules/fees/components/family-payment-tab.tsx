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
import { SkeletonCardGrid } from '@/components/shared/skeletons';
import { formatCurrency } from './fee-status-badge';
import { FamilySearchCombobox } from './family-search-combobox';
import { AllocationPreview } from './allocation-preview';
import { FamilyChildrenSummary } from './family-children-summary';
import { FamilyCollectionForm } from './family-collection-form';
import { PaymentHistoryDialog } from './payment-history-dialog';
import { StudentLedgerDialog } from './student-ledger-dialog';
import { StudentDiscountDialog } from './student-discount-dialog';
import { FamilyLedgerDialog } from './family-ledger-dialog';
import { fetchFamilyChildrenWithFeesAction } from '@/modules/fees/fee-self-service-actions';
import { recordFamilyPaymentAction } from '@/modules/fees/family-payment-actions';
import { computeAllocation } from '@/modules/fees/allocation-engine';
import { toast } from 'sonner';
import { Users, Zap, ClipboardList, Tag, History, Receipt, Loader2, Banknote, BookOpen } from 'lucide-react';
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
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [familyId, setFamilyId] = useState('');
  const [familyLabel, setFamilyLabel] = useState('');
  const [childrenData, setChildrenData] = useState<FamilyChild[]>([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [strategy, setStrategy] = useState<'OLDEST_FIRST' | 'CHILD_PRIORITY' | 'EQUAL_SPLIT' | 'CUSTOM'>('OLDEST_FIRST');
  const [preview, setPreview] = useState<AllocationResult | null>(null);
  const [view, setView] = useState<'quick' | 'detailed'>('detailed');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [historyAssignmentId, setHistoryAssignmentId] = useState<string | null>(null);
  const [ledgerChild, setLedgerChild] = useState<{ id: string; name: string } | null>(null);
  const [discountChild, setDiscountChild] = useState<{ id: string; name: string } | null>(null);
  const [familyLedgerOpen, setFamilyLedgerOpen] = useState(false);
  const invalidate = useInvalidateCache();

  function loadFamilyFees(profileId: string) {
    setIsLoadingFees(true);
    startTransition(async () => {
      try {
        const result = await fetchFamilyChildrenWithFeesAction(profileId);
        setChildrenData((result as FamilyChild[]) ?? []);
        setPreview(null);
        if (!result || result.length === 0) toast.info('No pending fees found for this family');
      } catch { toast.error('Family not found or no access'); }
      setIsLoadingFees(false);
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
    children.reduce((sum, c) => sum + c.assignments.reduce((s, a) => s + a.balanceAmount, 0), 0),
  [children]);

  // ── Quick Pay helpers ──

  function buildCustomAllocations() {
    return Object.entries(customAmounts).filter(([, v]) => Number(v) > 0).map(([id, v]) => ({ feeAssignmentId: id, amount: Number(v) }));
  }

  function handlePreview() {
    if (strategy === 'CUSTOM') {
      const allocs = buildCustomAllocations();
      const total = allocs.reduce((s, a) => s + a.amount, 0);
      if (total <= 0) { toast.error('Enter amounts for at least one assignment'); return; }
      setTotalAmount(String(total));
      setPreview(computeAllocation({ totalAmount: total, strategy: 'CUSTOM', children, customAllocations: allocs }));
    } else {
      if (!totalAmount || Number(totalAmount) <= 0) { toast.error('Enter a valid amount'); return; }
      setPreview(computeAllocation({ totalAmount: Number(totalAmount), strategy, children }));
    }
  }

  function handleConfirm() {
    if (!preview) return;
    startTransition(async () => {
      const result = await recordFamilyPaymentAction({
        familyProfileId: familyId,
        totalAmount: Number(totalAmount),
        paymentMethod: method as 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE',
        referenceNumber: reference || undefined,
        allocationStrategy: strategy,
        customAllocations: strategy === 'CUSTOM' ? buildCustomAllocations() : undefined,
      });
      if (result.success) {
        const msg = result.data?.unallocated && result.data.unallocated > 0.01
          ? `Payment: ${formatCurrency(result.data.totalAllocated)}. Unallocated: ${formatCurrency(result.data.unallocated)}. Receipt: ${result.data.masterReceiptNumber}`
          : `Family payment recorded. Receipt: ${result.data?.masterReceiptNumber}`;
        toast.success(msg);
        setPreview(null); setTotalAmount(''); setReference(''); setCustomAmounts({});
        await invalidate.afterFeePayment();
        loadFamilyFees(familyId);
      } else { toast.error(result.error ?? 'Payment failed'); }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />Family Fee Collection
          </CardTitle>
          <CardDescription>Collect payments and apply discounts for all children in a family.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FamilySearchCombobox value={familyId} selectedLabel={familyLabel} disabled={isPending}
            onSelect={(f) => {
              setFamilyId(f.familyProfileId);
              setFamilyLabel(`${f.parentName} (${f.relationship}) — ${f.childrenCount} child(ren)`);
              setChildrenData([]); setPreview(null);
              loadFamilyFees(f.familyProfileId);
            }}
            onClear={() => { setFamilyId(''); setFamilyLabel(''); setChildrenData([]); setPreview(null); }}
          />

          {/* Family Ledger button — visible once a family is selected */}
          {familyId && (
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                onClick={() => setFamilyLedgerOpen(true)}
                disabled={isPending}
              >
                <BookOpen className="h-3.5 w-3.5" />
                View Family Ledger
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoadingFees && familyId && children.length === 0 && (
            <div className="space-y-3">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          )}

          {children.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-sm text-muted-foreground">
                  {children.length} child(ren) with pending fees.
                  Total outstanding: <span className="font-semibold text-foreground">{formatCurrency(totalPending)}</span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setTotalAmount(String(totalPending));
                    setStrategy('OLDEST_FIRST');
                    setView('quick');
                    setPreview(computeAllocation({ totalAmount: totalPending, strategy: 'OLDEST_FIRST', children }));
                  }}
                  disabled={isPending || totalPending <= 0}
                >
                  <Banknote className="mr-1 h-3.5 w-3.5" /> Pay All ({formatCurrency(totalPending)})
                </Button>
              </div>

              {/* Per-child action buttons */}
              <div className="space-y-2">
                {childrenData.map((c) => {
                  const childName = `${c.child.user.firstName} ${c.child.user.lastName}`;
                  const childTotal = c.assignments.reduce((s, a) => s + a.balanceAmount, 0);
                  return (
                    <div key={c.child.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{childName}</p>
                        <p className="text-xs text-muted-foreground">{c.child.class?.name} · Roll: {c.child.rollNumber} · Balance: <span className="font-mono">{formatCurrency(childTotal)}</span></p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setDiscountChild({ id: c.child.id, name: childName })} disabled={isPending} title="Manage Discounts">
                          <Tag className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setLedgerChild({ id: c.child.id, name: childName })} disabled={isPending} title="Payment Ledger">
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View Toggle: Detailed (per-assignment) vs Quick Pay (allocation strategy) */}
              <div className="flex gap-2">
                <Button size="sm" variant={view === 'detailed' ? 'default' : 'outline'} onClick={() => { setView('detailed'); setPreview(null); }}>
                  <ClipboardList className="mr-1 h-3 w-3" />Detailed Collection
                </Button>
                <Button size="sm" variant={view === 'quick' ? 'default' : 'outline'} onClick={() => { setView('quick'); setPreview(null); }}>
                  <Zap className="mr-1 h-3 w-3" />Quick Pay
                </Button>
              </div>

              {view === 'detailed' ? (
                <FamilyCollectionForm familyId={familyId} children={children} disabled={isPending} onSuccess={() => loadFamilyFees(familyId)} />
              ) : (
                <>
                  {strategy === 'CUSTOM' ? (
                    <FamilyChildrenSummary mode="single" children={children}
                      customAmounts={customAmounts}
                      onCustomAmountChange={(id, val) => setCustomAmounts((p) => ({ ...p, [id]: val }))}
                      disabled={isPending} />
                  ) : (
                    <FamilyChildrenSummary mode="readonly" children={children} />
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {strategy !== 'CUSTOM' && (
                      <div className="space-y-1">
                        <Label>Total Amount</Label>
                        <Input type="number" min={1} value={totalAmount}
                          onChange={(e) => { setTotalAmount(e.target.value); setPreview(null); }}
                          disabled={isPending} className="font-mono" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Strategy</Label>
                      <Select value={strategy} onValueChange={(v) => { setStrategy(v as typeof strategy); setPreview(null); }} disabled={isPending}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{STRATEGIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Method</Label>
                      <Select value={method} onValueChange={setMethod} disabled={isPending}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
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
              )}
            </>
          )}
        </CardContent>
      </Card>

      {preview && view === 'quick' && (
        <AllocationPreview preview={preview} isPending={isPending} onConfirm={handleConfirm} />
      )}

      <PaymentHistoryDialog assignmentId={historyAssignmentId} onClose={() => setHistoryAssignmentId(null)} />

      <FamilyLedgerDialog
        familyProfileId={familyLedgerOpen ? familyId : null}
        familyName={familyLabel}
        onClose={() => setFamilyLedgerOpen(false)}
      />

      {ledgerChild && (
        <StudentLedgerDialog
          open
          onClose={() => setLedgerChild(null)}
          studentProfileId={ledgerChild.id}
          studentName={ledgerChild.name}
        />
      )}

      {discountChild && (
        <StudentDiscountDialog
          open
          onClose={() => setDiscountChild(null)}
          studentProfileId={discountChild.id}
          studentName={discountChild.name}
        />
      )}
    </div>
  );
}
