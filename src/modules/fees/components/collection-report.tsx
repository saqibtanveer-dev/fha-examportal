'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/shared';
import { formatCurrency } from './fee-status-badge';
import { fetchCollectionReportAction } from '@/modules/fees/fee-fetch-actions';

type CollectionRow = {
  paymentMethod: string;
  _sum: { amount: number | null };
  _count: { id: number };
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  ONLINE: 'Online',
  CHEQUE: 'Cheque',
};

export function CollectionReport() {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<CollectionRow[]>([]);

  function handleFetch() {
    startTransition(async () => {
      try {
        const result = await fetchCollectionReportAction(startDate, endDate);
        setData((result as CollectionRow[]) ?? []);
      } catch {
        setData([]);
      }
    });
  }

  const grandTotal = data.reduce((sum, r) => sum + (Number(r._sum?.amount) || 0), 0);
  const totalTxns = data.reduce((sum, r) => sum + (r._count?.id ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Collection by Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1 flex-1">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1 flex-1">
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleFetch} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <Spinner size="sm" /> : 'Fetch'}
          </Button>
        </div>

        {data.length > 0 && (
          <>
            {/* ── Mobile Card View ── */}
            <div className="space-y-2 md:hidden">
              {data.map((row) => (
                <div key={row.paymentMethod} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod}</p>
                    <p className="font-mono text-sm font-medium">{formatCurrency(Number(row._sum?.amount) || 0)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{row._count?.id ?? 0} transactions</p>
                </div>
              ))}
              <div className="rounded-lg border bg-muted/50 p-3 font-semibold">
                <div className="flex items-center justify-between text-sm">
                  <span>Total ({totalTxns} txns)</span>
                  <span className="font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* ── Desktop Table View ── */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.paymentMethod}>
                    <TableCell className="font-medium">
                      {METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod}
                    </TableCell>
                    <TableCell className="text-right">{row._count?.id ?? 0}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(row._sum?.amount) || 0)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalTxns}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(grandTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </div>
          </>
        )}

        {data.length === 0 && !isPending && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Select a date range and click Fetch to see collection data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
