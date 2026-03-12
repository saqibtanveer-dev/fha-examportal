'use client';

import { useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared';
import { Spinner } from '@/components/shared';
import { generateFeesAction } from '@/modules/fees/fee-generation-actions';
import { applyLateFeesAction } from '@/modules/fees/fee-management-actions';
import { toast } from 'sonner';
import { AlertTriangle, Zap } from 'lucide-react';

type ClassOption = { id: string; name: string; grade: number };

type Props = {
  classes: ClassOption[];
  dueDayOfMonth: number;
};

export function GenerateFeesView({ classes, dueDayOfMonth }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedClass, setSelectedClass] = useState('all');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date();
    const day = Math.min(dueDayOfMonth, 28);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
  const invalidate = useInvalidateCache();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateFeesAction({
        generatedForMonth: month,
        classId: selectedClass === 'all' ? undefined : selectedClass,
        dueDate,
      });

      if (result.success) {
        const { generated, skipped } = result.data!;
        toast.success(`Generated fees for ${generated} students (${skipped} skipped)`);
        await invalidate.afterFeeMutation();
      } else {
        toast.error(result.error ?? 'Failed to generate fees');
      }
    });
  }

  function handleApplyLateFees() {
    startTransition(async () => {
      const result = await applyLateFeesAction();
      if (result.success) {
        toast.success(`Late fees applied to ${result.data?.updated ?? 0} assignments`);
        await invalidate.afterFeeMutation();
      } else {
        toast.error(result.error ?? 'Failed to apply late fees');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Fees"
        description="Generate monthly fee assignments for students."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Fees', href: '/admin/fees' },
          { label: 'Generate' },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />Generate Monthly Fees
            </CardTitle>
            <CardDescription>
              Creates fee assignments for all active students based on configured fee structures.
              Students who already have fees for the selected month are automatically skipped.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label>Class Filter</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes
                    .sort((a, b) => a.grade - b.grade)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isPending} className="w-full">
                  {isPending && <Spinner size="sm" className="mr-2" />}
                  Generate Fees
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate fees for {month}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will create fee assignments for all active students
                    {selectedClass !== 'all' ? ' in the selected class' : ''}.
                    Students who already have fees for this month will be skipped.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerate}>Generate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />Apply Late Fees
            </CardTitle>
            <CardDescription>
              Calculates and applies late fees to all overdue assignments based on configured
              late fee per day, grace period, and maximum cap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will scan all pending/partial/overdue assignments past their due date
              and apply the appropriate late fee charges.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isPending}
                  variant="outline"
                  className="w-full"
                >
                  {isPending && <Spinner size="sm" className="mr-2" />}
                  Apply Late Fees Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apply late fees?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will calculate and add late fee charges to all overdue assignments
                    based on the configured rate, grace period, and maximum cap. This action
                    modifies fee amounts and cannot be easily reversed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApplyLateFees}>Apply</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
