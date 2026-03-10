'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth } from './fee-status-badge';
import type { AllocationResult } from '@/modules/fees/fee.types';
import { AlertTriangle } from 'lucide-react';

type Props = {
  preview: AllocationResult;
  isPending: boolean;
  onConfirm: () => void;
};

export function AllocationPreview({ preview, isPending, onConfirm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Allocation Preview</CardTitle>
        <CardDescription>
          Allocated: {formatCurrency(preview.totalAllocated)}
          {preview.unallocated > 0 && (
            <span className="ml-2 text-orange-600 font-medium">
              | Unallocated: {formatCurrency(preview.unallocated)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview.unallocated > 0.01 && (
          <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {formatCurrency(preview.unallocated)} exceeds total pending fees and will NOT be collected.
              Only {formatCurrency(preview.totalAllocated)} will be recorded.
            </span>
          </div>
        )}

        {preview.allocations.map((child) => (
          <div key={child.childId}>
            <h4 className="mb-2 text-sm font-semibold">
              {child.childName} ({child.className}) — {formatCurrency(child.allocatedAmount)}
            </h4>
            <div className="overflow-x-auto rounded-md border">
              {/* ── Mobile Card View ── */}
              <div className="space-y-2 p-2 md:hidden">
                {child.assignmentAllocations.map((aa) => (
                  <div key={aa.assignmentId} className="rounded-lg border bg-card p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{formatMonth(aa.periodLabel)}</p>
                      <Badge variant={aa.status === 'CLEARED' ? 'default' : aa.status === 'PARTIAL' ? 'secondary' : 'outline'}>
                        {aa.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs text-center">
                      <div><p className="text-muted-foreground">Previous</p><p className="font-mono">{formatCurrency(aa.previousBalance)}</p></div>
                      <div><p className="text-muted-foreground">Allocated</p><p className="font-mono text-green-700">{formatCurrency(aa.allocatedAmount)}</p></div>
                      <div><p className="text-muted-foreground">Balance</p><p className="font-mono">{formatCurrency(aa.newBalance)}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop Table View ── */}
              <div className="hidden md:block">
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
          </div>
        ))}

        <Button onClick={onConfirm} disabled={isPending} className="w-full">
          {isPending && <Spinner size="sm" className="mr-2" />}
          Confirm & Record Payment
        </Button>
      </CardContent>
    </Card>
  );
}
