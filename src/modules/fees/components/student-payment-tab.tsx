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
import { fetchPendingAssignmentsAction } from '@/modules/fees/fee-fetch-actions';
import { recordPaymentAction, applyDiscountAction } from '@/modules/fees/fee-payment-actions';
import { toast } from 'sonner';
import { CreditCard, Percent } from 'lucide-react';
import type { SerializedFeeAssignment } from '@/modules/fees/fee.types';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export function StudentPaymentTab() {
  const [isPending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState('');
  const [studentLabel, setStudentLabel] = useState('');
  const [assignments, setAssignments] = useState<SerializedFeeAssignment[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [mode, setMode] = useState<'pay' | 'discount'>('pay');
  const invalidate = useInvalidateCache();

  function loadAssignments(profileId: string) {
    startTransition(async () => {
      try {
        const result = await fetchPendingAssignmentsAction(profileId);
        setAssignments(result ?? []);
        if (!result || result.length === 0) {
          toast.info('No pending fees found for this student');
        }
      } catch {
        toast.error('Student not found or no access');
      }
    });
  }

  function handlePayment() {
    if (!selectedId || !amount) return;
    startTransition(async () => {
      const result = await recordPaymentAction({
        feeAssignmentId: selectedId,
        amount: Number(amount),
        paymentMethod: method as 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE',
        referenceNumber: reference || undefined,
      });

      if (result.success) {
        toast.success(`Payment recorded. Receipt: ${result.data?.receiptNumber}`);
        setSelectedId('');
        setAmount('');
        setReference('');
        await invalidate.afterFeePayment();
        loadAssignments(studentId);
      } else {
        toast.error(result.error ?? 'Payment failed');
      }
    });
  }

  function handleDiscount() {
    if (!selectedId || !discountAmount || !discountReason) return;
    startTransition(async () => {
      const result = await applyDiscountAction({
        feeAssignmentId: selectedId,
        amount: Number(discountAmount),
        reason: discountReason,
      });

      if (result.success) {
        toast.success('Discount applied');
        setSelectedId('');
        setDiscountAmount('');
        setDiscountReason('');
        await invalidate.afterFeePayment();
        loadAssignments(studentId);
      } else {
        toast.error(result.error ?? 'Failed to apply discount');
      }
    });
  }

  const selectedAssignment = assignments.find((a) => a.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Search + Fee List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StudentSearchCombobox
            value={studentId}
            selectedLabel={studentLabel}
            disabled={isPending}
            onSelect={(student) => {
              setStudentId(student.studentProfileId);
              setStudentLabel(`${student.studentName} — ${student.className} (${student.rollNumber})`);
              setAssignments([]);
              setSelectedId('');
              loadAssignments(student.studentProfileId);
            }}
            onClear={() => {
              setStudentId('');
              setStudentLabel('');
              setAssignments([]);
              setSelectedId('');
            }}
          />

          {assignments.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow
                      key={a.id}
                      className={selectedId === a.id ? 'bg-muted' : 'cursor-pointer'}
                      onClick={() => setSelectedId(a.id)}
                    >
                      <TableCell>{formatMonth(a.generatedForMonth)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(a.balanceAmount)}
                      </TableCell>
                      <TableCell>
                        <FeeStatusBadge status={a.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={selectedId === a.id ? 'default' : 'ghost'}
                          onClick={() => setSelectedId(a.id)}
                        >
                          Select
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

      {/* Right: Payment/Discount Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedAssignment
              ? `${formatMonth(selectedAssignment.generatedForMonth)} — Balance: ${formatCurrency(selectedAssignment.balanceAmount)}`
              : 'Select a fee assignment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedAssignment ? (
            <p className="text-sm text-muted-foreground">
              Search for a student and select a pending fee to record payment or apply discount.
            </p>
          ) : (
            <>
              {/* Line items breakdown */}
              <div className="rounded border p-3 space-y-1 text-sm">
                {selectedAssignment.lineItems.map((li) => (
                  <div key={li.id} className="flex justify-between">
                    <span>{li.categoryName}</span>
                    <span className="font-mono">{formatCurrency(li.amount)}</span>
                  </div>
                ))}
                {selectedAssignment.lateFeesApplied > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Late Fee</span>
                    <span className="font-mono">{formatCurrency(selectedAssignment.lateFeesApplied)}</span>
                  </div>
                )}
                {selectedAssignment.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-mono">-{formatCurrency(selectedAssignment.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={mode === 'pay' ? 'default' : 'outline'}
                  onClick={() => setMode('pay')}
                >
                  <CreditCard className="mr-1 h-3 w-3" />Payment
                </Button>
                <Button
                  size="sm"
                  variant={mode === 'discount' ? 'default' : 'outline'}
                  onClick={() => setMode('discount')}
                >
                  <Percent className="mr-1 h-3 w-3" />Discount
                </Button>
              </div>

              {mode === 'pay' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min={1}
                      max={selectedAssignment.balanceAmount}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isPending}
                      className="font-mono"
                    />
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
                  <Button onClick={handlePayment} disabled={isPending || !amount} className="w-full">
                    {isPending && <Spinner size="sm" className="mr-2" />}
                    Record Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Discount Amount</Label>
                    <Input
                      type="number"
                      min={1}
                      max={selectedAssignment.balanceAmount}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      disabled={isPending}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Reason</Label>
                    <Input
                      placeholder="e.g. Scholarship, Staff child"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <Button onClick={handleDiscount} disabled={isPending || !discountAmount || !discountReason} className="w-full">
                    {isPending && <Spinner size="sm" className="mr-2" />}
                    Apply Discount
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
