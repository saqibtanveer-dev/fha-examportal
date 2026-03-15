'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from './fee-status-badge';
import { fetchFeeCategoriesAction } from '@/modules/fees/fee-client-core-fetch-actions';
import { fetchStudentDiscountsAction, fetchStudentFeeAmountsAction } from '@/modules/fees/fee-client-finance-fetch-actions';
import {
  createStudentFeeDiscountAction,
  updateStudentFeeDiscountAction,
  deleteStudentFeeDiscountAction,
} from '@/modules/fees/student-discount-actions';

type DiscountRecord = {
  id: string;
  discountType: string;
  value: number;
  reason: string;
  isActive: boolean;
  feeCategoryId: string | null;
  feeCategory: { id: string; name: string } | null;
  approvedBy: { firstName: string; lastName: string };
  validUntil: string | null;
  createdAt: string;
};

type Category = { id: string; name: string };
type FeeAmounts = { total: number; categories: { id: string; name: string; amount: number }[] };

type Props = {
  open: boolean;
  onClose: () => void;
  studentProfileId: string;
  studentName: string;
};

export function StudentDiscountDialog({ open, onClose, studentProfileId, studentName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [discounts, setDiscounts] = useState<DiscountRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feeAmounts, setFeeAmounts] = useState<FeeAmounts>({ total: 0, categories: [] });
  const [showForm, setShowForm] = useState(false);

  // New discount form
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (open && studentProfileId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentProfileId]);

  function loadData() {
    startTransition(async () => {
      const [discountData, categoryData, feeData] = await Promise.all([
        fetchStudentDiscountsAction(studentProfileId),
        fetchFeeCategoriesAction(true),
        fetchStudentFeeAmountsAction(studentProfileId),
      ]);
      setDiscounts((discountData ?? []) as DiscountRecord[]);
      setCategories((categoryData ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      if (feeData) setFeeAmounts(feeData as FeeAmounts);
    });
  }

  function resetForm() {
    setShowForm(false);
    setDiscountType('FLAT');
    setValue('');
    setReason('');
    setCategoryId('all');
    setValidUntil('');
  }

  function handleCreate() {
    const numValue = Number(value);
    if (numValue <= 0) { toast.error('Enter a positive discount value'); return; }
    if (!reason || reason.length < 3) { toast.error('Reason required (min 3 chars)'); return; }
    if (discountType === 'PERCENTAGE' && numValue > 100) { toast.error('Percentage cannot exceed 100'); return; }

    // Validate FLAT discount against actual fee
    if (discountType === 'FLAT') {
      const maxFee = categoryId !== 'all'
        ? (feeAmounts.categories.find((c) => c.id === categoryId)?.amount ?? 0)
        : feeAmounts.total;
      if (maxFee > 0 && numValue > maxFee) {
        toast.error(`Discount Rs. ${numValue} exceeds the fee of Rs. ${maxFee}`);
        return;
      }
    }

    startTransition(async () => {
      const result = await createStudentFeeDiscountAction({
        studentProfileId,
        discountType,
        value: numValue,
        reason,
        feeCategoryId: categoryId !== 'all' ? categoryId : undefined,
        validUntil: validUntil || undefined,
      });
      if (result.success) {
        toast.success('Permanent discount created');
        resetForm();
        loadData();
      } else {
        toast.error(result.error ?? 'Failed to create discount');
      }
    });
  }

  function handleToggle(id: string, currentlyActive: boolean) {
    startTransition(async () => {
      const result = await updateStudentFeeDiscountAction({ id, isActive: !currentlyActive });
      if (result.success) {
        toast.success(currentlyActive ? 'Discount deactivated' : 'Discount activated');
        loadData();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteStudentFeeDiscountAction(id);
      if (result.success) {
        toast.success('Discount deleted');
        loadData();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permanent Discounts</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        {/* Existing discounts */}
        {discounts.length > 0 ? (
          <div className="space-y-2">
            {discounts.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {d.discountType === 'FLAT'
                        ? formatCurrency(d.value)
                        : `${d.value}%`}
                      {' off'}
                    </span>
                    {d.feeCategory ? (
                      <Badge variant="outline" className="text-xs">{d.feeCategory.name}</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">All Categories</Badge>
                    )}
                    <Badge variant={d.isActive ? 'default' : 'destructive'} className="text-xs">
                      {d.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    By {d.approvedBy.firstName} {d.approvedBy.lastName}
                    {d.validUntil && ` · Until ${new Date(d.validUntil).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => handleToggle(d.id, d.isActive)}
                    disabled={isPending}
                  >
                    {d.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(d.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No permanent discounts configured.</p>
        )}

        {/* Add new discount */}
        {!showForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} disabled={isPending}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Discount
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            {/* Fee context for the admin */}
            {feeAmounts.total > 0 && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
                <p className="font-medium mb-1">Monthly Fee: {formatCurrency(feeAmounts.total)}</p>
                {feeAmounts.categories.map((c) => (
                  <span key={c.id} className="mr-3">{c.name}: {formatCurrency(c.amount)}</span>
                ))}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'FLAT' | 'PERCENTAGE')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat Amount (Rs.)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{discountType === 'FLAT' ? 'Amount (Rs.)' : 'Percentage (%)'}</Label>
                <Input
                  type="number" min={0}
                  max={discountType === 'PERCENTAGE' ? 100 : (categoryId !== 'all'
                    ? (feeAmounts.categories.find((c) => c.id === categoryId)?.amount ?? undefined)
                    : (feeAmounts.total || undefined))}
                  value={value} onChange={(e) => setValue(e.target.value)}
                  placeholder={discountType === 'FLAT' ? 'e.g. 500' : 'e.g. 10'}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Parent negotiation at admission, Staff child"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Applies to</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fee Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Valid Until (optional)</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={isPending}>
                {isPending && <Spinner size="sm" className="mr-1" />}
                Save Discount
              </Button>
              <Button size="sm" variant="ghost" onClick={resetForm} disabled={isPending}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
