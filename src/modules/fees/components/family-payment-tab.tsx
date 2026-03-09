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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth } from './fee-status-badge';
import { FamilySearchCombobox } from './family-search-combobox';
import { fetchFamilyChildrenWithFeesAction } from '@/modules/fees/fee-self-service-actions';
import { recordFamilyPaymentAction } from '@/modules/fees/family-payment-actions';
import { computeAllocation } from '@/modules/fees/allocation-engine';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import type { ChildWithAssignments, PendingAssignment, AllocationResult } from '@/modules/fees/fee.types';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHEQUE', label: 'Cheque' },
];

const STRATEGIES = [
  { value: 'OLDEST_FIRST', label: 'Oldest First' },
  { value: 'CHILD_PRIORITY', label: 'Child Priority' },
  { value: 'EQUAL_SPLIT', label: 'Equal Split' },
];

type FamilyChild = {
  child: {
    id: string;
    rollNumber: string;
    user: { firstName: string; lastName: string };
    class: { name: string } | null;
  };
  assignments: {
    id: string;
    generatedForMonth: string;
    balanceAmount: number;
    dueDate: string;
    lineItems: { categoryName: string; amount: number }[];
    status: string;
  }[];
};

export function FamilyPaymentTab() {
  const [isPending, startTransition] = useTransition();
  const [familyId, setFamilyId] = useState('');
  const [familyLabel, setFamilyLabel] = useState('');
  const [childrenData, setChildrenData] = useState<FamilyChild[]>([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [strategy, setStrategy] = useState<'OLDEST_FIRST' | 'CHILD_PRIORITY' | 'EQUAL_SPLIT'>('OLDEST_FIRST');
  const [preview, setPreview] = useState<AllocationResult | null>(null);
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

  function handlePreview() {
    if (!totalAmount || Number(totalAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const result = computeAllocation({
      totalAmount: Number(totalAmount),
      strategy,
      children,
    });
    setPreview(result);
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
      });

      if (result.success) {
        toast.success(`Family payment recorded. Receipt: ${result.data?.masterReceiptNumber}`);
        setPreview(null);
        setTotalAmount('');
        setReference('');
        await invalidate.afterFeePayment();
        loadFamilyFees(familyId);
      } else {
        toast.error(result.error ?? 'Payment failed');
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

              {/* Per-child summary */}
              {children.map((child) => (
                <div key={child.childId} className="rounded border p-3 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{child.childName} ({child.className})</span>
                    <span className="font-mono">
                      {formatCurrency(child.assignments.reduce((s, a) => s + a.balanceAmount, 0))}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {child.assignments.map((a) => (
                      <div key={a.assignmentId} className="flex justify-between">
                        <span>{formatMonth(a.periodLabel)}</span>
                        <span className="font-mono">{formatCurrency(a.balanceAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Payment form */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    min={1}
                    value={totalAmount}
                    onChange={(e) => { setTotalAmount(e.target.value); setPreview(null); }}
                    disabled={isPending}
                    className="font-mono"
                  />
                </div>
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

              <Button onClick={handlePreview} disabled={isPending || !totalAmount} className="w-full" variant="outline">
                Preview Allocation
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Allocation Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allocation Preview</CardTitle>
            <CardDescription>
              Allocated: {formatCurrency(preview.totalAllocated)} |
              Unallocated: {formatCurrency(preview.unallocated)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview.allocations.map((child) => (
              <div key={child.childId}>
                <h4 className="mb-2 text-sm font-semibold">
                  {child.childName} ({child.className}) — {formatCurrency(child.allocatedAmount)}
                </h4>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Previous</TableHead>
                        <TableHead className="text-right">Allocated</TableHead>
                        <TableHead className="text-right">New Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {child.assignmentAllocations.map((aa) => (
                        <TableRow key={aa.assignmentId}>
                          <TableCell>{formatMonth(aa.periodLabel)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(aa.previousBalance)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(aa.allocatedAmount)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(aa.newBalance)}</TableCell>
                          <TableCell>
                            <Badge variant={aa.status === 'CLEARED' ? 'default' : aa.status === 'PARTIAL' ? 'secondary' : 'outline'}>
                              {aa.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}

            <Button onClick={handleConfirm} disabled={isPending} className="w-full">
              {isPending && <Spinner size="sm" className="mr-2" />}
              Confirm & Record Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
