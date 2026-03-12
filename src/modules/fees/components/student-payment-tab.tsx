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
import { StudentDiscountDialog } from './student-discount-dialog';
import { AdvancePaymentDialog } from './advance-payment-dialog';
import { fetchPendingAssignmentsAction, fetchStudentCreditsAction } from '@/modules/fees/fee-fetch-actions';
import { collectStudentFeeAction } from '@/modules/fees/fee-collection-actions';
import { toast } from 'sonner';
import { Receipt, Tag, Wallet } from 'lucide-react';
import type { SerializedFeeAssignment } from '@/modules/fees/fee.types';

const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE'] as const;
const METHOD_LABELS: Record<string, string> = { CASH: 'Cash', BANK_TRANSFER: 'Bank Transfer', ONLINE: 'Online', CHEQUE: 'Cheque' };

export function StudentPaymentTab() {
  const [isPending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState('');
  const [studentLabel, setStudentLabel] = useState('');
  const [assignments, setAssignments] = useState<SerializedFeeAssignment[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [method, setMethod] = useState('CASH');  const [reference, setReference] = useState('');
  const [historyAssignmentId, setHistoryAssignmentId] = useState<string | null>(null);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const invalidate = useInvalidateCache();

  function loadAssignments(profileId: string) {
    startTransition(async () => {
      try {
        const [assignmentResult, creditResult] = await Promise.all([
          fetchPendingAssignmentsAction(profileId),
          fetchStudentCreditsAction(profileId),
        ]);
        setAssignments(assignmentResult ?? []);
        const totalCredit = (creditResult ?? []).reduce(
          (sum: number, c: { remainingAmount: number }) => sum + Number(c.remainingAmount), 0,
        );
        setCreditBalance(totalCredit);
        if (!assignmentResult || assignmentResult.length === 0) toast.info('No pending fees found');
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
            onClear={() => { setStudentId(''); setStudentLabel(''); setAssignments([]); resetForm(); setCreditBalance(0); }}
          />

          {/* ── Student Actions: Discounts & Advance Payment ── */}
          {studentId && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDiscountDialogOpen(true)} disabled={isPending}>
                  <Tag className="mr-1 h-3.5 w-3.5" /> Manage Discounts
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAdvanceDialogOpen(true)} disabled={isPending}>
                  <Wallet className="mr-1 h-3.5 w-3.5" /> Record Advance Payment
                </Button>
              </div>
              {creditBalance > 0 && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-900 dark:bg-green-950">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 dark:text-green-400">
                    Available Credit: <span className="font-mono font-semibold">{formatCurrency(creditBalance)}</span>
                    {' '}(auto-applies to new fees)
                  </span>
                </div>
              )}
            </div>
          )}

          {assignments.length > 0 && (
            <>
              {/* ── Mobile Card View ── */}
              <div className="space-y-2 md:hidden">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-lg border p-3 space-y-1 cursor-pointer ${selectedId === a.id ? 'bg-muted ring-2 ring-primary' : 'bg-card'}`}
                    onClick={() => setSelectedId(a.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{formatMonth(a.generatedForMonth)}</p>
                      <FeeStatusBadge status={a.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono">{formatCurrency(a.balanceAmount)}</span>
                      <Button size="sm" variant="ghost" className="h-6 px-2" onClick={(e) => { e.stopPropagation(); setHistoryAssignmentId(a.id); }}>
                        <Receipt className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop Table View ── */}
              <div className="hidden md:block overflow-x-auto rounded-md border">
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
            </>
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
                    <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>)}</SelectContent>
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

      {studentId && (
        <>
          <StudentDiscountDialog
            open={discountDialogOpen}
            onClose={() => setDiscountDialogOpen(false)}
            studentProfileId={studentId}
            studentName={studentLabel}
          />
          <AdvancePaymentDialog
            open={advanceDialogOpen}
            onClose={() => setAdvanceDialogOpen(false)}
            studentProfileId={studentId}
            studentName={studentLabel}
            onSuccess={() => loadAssignments(studentId)}
          />
        </>
      )}
    </div>
  );
}