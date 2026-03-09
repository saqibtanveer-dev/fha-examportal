'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentAssignments } from '@/modules/fees/hooks/use-fee-data';
import {
  FeeStatusBadge, formatCurrency, formatMonth,
} from '@/modules/fees/components/fee-status-badge';
import { DollarSign, AlertCircle } from 'lucide-react';

type Props = { studentProfileId: string };

export function StudentFeeSection({ studentProfileId }: Props) {
  const { data: assignments, isLoading, error } = useStudentAssignments(studentProfileId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !assignments) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Unable to load fee data.</p>
        </CardContent>
      </Card>
    );
  }

  const totalDue = assignments.reduce((s, a) => s + a.totalAmount, 0);
  const totalPaid = assignments.reduce((s, a) => s + a.paidAmount, 0);
  const totalBalance = assignments.reduce((s, a) => s + a.balanceAmount, 0);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Fees</p>
            <p className="text-xl font-bold">{formatCurrency(totalDue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(totalBalance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" /> Fee Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No fees assigned for this student.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{formatMonth(a.generatedForMonth)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(a.totalAmount)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(a.paidAmount)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(a.balanceAmount)}</TableCell>
                      <TableCell>{new Date(a.dueDate).toLocaleDateString('en-PK')}</TableCell>
                      <TableCell><FeeStatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
