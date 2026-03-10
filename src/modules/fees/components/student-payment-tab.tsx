'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/shared';
import { FeeStatusBadge, formatCurrency, formatMonth } from './fee-status-badge';
import { StudentSearchCombobox } from './student-search-combobox';
import { PaymentHistoryDialog } from './payment-history-dialog';
import { fetchPendingAssignmentsAction } from '@/modules/fees/fee-fetch-actions';
import { collectStudentFeeAction } from '@/modules/fees/fee-collection-actions';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';
import type { SerializedFeeAssignment } from '@/modules/fees/fee.types';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' }, { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' },
];

export function StudentPaymentTab() {
  const [isPending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState('');
  const [studentLabel, setStudentLabel] = useState('');
  const [assignments, setAssignments] = useState<SerializedFeeAssignment[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [historyAssignmentId, setHistoryAssignmentId] = useState<string | null>(null);
  const invalidate = useInvalidateCache();

  function loadAssignments(profileId: string) {
    startTransition(async () => {
      try {
        const result = await fetchPendingAssignmentsAction(profileId);
        setAssignments(result ?? []);
        if (!result || result.length === 0) toast.info('No pending fees found');
      } catch { toast.error('Student not found or no access'); }
    });
  }

  function handleCollect() {
    if (!selectedId) return;
    const pay = Number(paymentAmount) || 0;
    const disc = Number(discountAmount) || 0;
    if (pay <= 0 && disc <= 0) { toast.error('Enter a payment or discount amount'); return; }
    if (disc > 0 && (!discountReason || discountReason.length < 3)) {
      toast.error('Discount reason required (min 3 characters)'); return;
    }

    startTransition(async () => {
      const result = await collectStudentFeeAction({
        feeAssignmentId: selectedId,
        paymentAmount: pay,
        discountAmount: disc,
        paymentMethod: method as 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE',
        referenceNumber: reference || undefined,
        discountReason: disc > 0 ? discountReason : undefined,
      });

      if (result.success) {
        const parts = [];
        if (pay > 0) parts.push(`Payment: ${formatCurrency(pay)}`);
        if (disc > 0) parts.push(`Discount: ${formatCurrency(disc)}`);
        if (result.data?.receiptNumber) parts.push(`Receipt: ${result.data.receiptNumber}`);
        toast.success(parts.join(' | '));
        resetForm();
        await invalidate.afterFeePayment();
        loadAssignments(studentId);
      } else {
        toast.error(result.error ?? 'Fee collection failed');
      }
    });
  }

  function resetForm() {
    setSelectedId('');
    setPaymentAmount('');
    setDiscountAmount('');
    setDiscountReason('');
    setReference('');
  }

  const selected = assignments.find((a) => a.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Find Student</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <StudentSearchCombobox
            value={studentId} selectedLabel={studentLabel} disabled={isPending}
            onSelect={(s) => {
              setStudentId(s.studentProfileId);
              setStudentLabel(`${s.studentName} — ${s.className} (${s.rollNumber})`);
              setAssignments([]); resetForm();
              loadAssignments(s.studentProfileId);
            }}
            onClear={() => { setStudentId(''); setStudentLabel(''); setAssignments([]); resetForm(); }}
          />
          {assignments.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id} className={selectedId === a.id ? 'bg-muted' : 'cursor-pointer'} onClick={() => setSelectedId(a.id)}>
                      <TableCell>{formatMonth(a.generatedForMonth)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(a.balanceAmount)}</TableCell>
                      <TableCell><FeeStatusBadge status={a.status} /></TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant={selectedId === a.id ? 'default' : 'ghost'} onClick={() => setSelectedId(a.id)}>Select</Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setHistoryAssignmentId(a.id); }}>
                          <Receipt className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selected ? `${formatMonth(selected.generatedForMonth)} — Balance: ${formatCurrency(selected.balanceAmount)}` : 'Select a fee assignment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Search for a student and select a pending fee to collect.</p>
          ) : (
            <>
              <div className="rounded border p-3 space-y-1 text-sm">
                {selected.lineItems.map((li) => (
                  <div key={li.id} className="flex justify-between">
                    <span>{li.categoryName}</span><span className="font-mono">{formatCurrency(li.amount)}</span>
                  </div>
                ))}
                {selected.lateFeesApplied > 0 && (
                  <div className="flex justify-between text-orange-600"><span>Late Fee</span><span className="font-mono">{formatCurrency(selected.lateFeesApplied)}</span></div>
                )}
                {selected.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount Applied</span><span className="font-mono">-{formatCurrency(selected.discountAmount)}</span></div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Payment Amount</Label>
                  <Input type="number" min={0} max={selected.balanceAmount} value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)} disabled={isPending} className="font-mono" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label>Discount Amount</Label>
                  <Input type="number" min={0} max={selected.balanceAmount} value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)} disabled={isPending} className="font-mono text-green-700" placeholder="0" />
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

              {Number(discountAmount) > 0 && (
                <div className="space-y-1">
                  <Label>Discount Reason</Label>
                  <Input placeholder="e.g. Scholarship, Staff child" value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} disabled={isPending} />
                </div>
              )}

              {(Number(paymentAmount) > 0 || Number(discountAmount) > 0) && (
                <div className="rounded border bg-muted/50 p-3 text-sm space-y-1">
                  {Number(paymentAmount) > 0 && <div className="flex justify-between"><span>Payment</span><span className="font-mono">{formatCurrency(Number(paymentAmount))}</span></div>}
                  {Number(discountAmount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-mono">-{formatCurrency(Number(discountAmount))}</span></div>}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Remaining Balance</span>
                    <span className="font-mono">{formatCurrency(Math.max(0, selected.balanceAmount - (Number(paymentAmount) || 0) - (Number(discountAmount) || 0)))}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCollect} disabled={isPending || (Number(paymentAmount) <= 0 && Number(discountAmount) <= 0)} className="w-full">
                {isPending && <Spinner size="sm" className="mr-2" />}
                Collect Fee
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentHistoryDialog assignmentId={historyAssignmentId} onClose={() => setHistoryAssignmentId(null)} />
    </div>
  );
}