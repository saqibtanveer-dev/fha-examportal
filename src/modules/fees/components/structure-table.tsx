'use client';

import { useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from './fee-status-badge';
import type { SerializedFeeStructure } from '@/modules/fees/fee.types';

const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: 'Monthly',
  TERM: 'Term',
  ANNUAL: 'Annual',
  ONE_TIME: 'One Time',
};

type Props = { structures: SerializedFeeStructure[] };

export function StructureTable({ structures }: Props) {
  // Group by class for a cleaner view
  const grouped = new Map<string, SerializedFeeStructure[]>();
  for (const s of structures) {
    const key = s.class.name;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(s);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries())
        .sort(([, a], [, b]) => (a[0]?.class.grade ?? 0) - (b[0]?.class.grade ?? 0))
        .map(([className, items]) => (
          <div key={className}>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {className}
            </h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.category.name}</TableCell>
                      <TableCell>{FREQUENCY_LABELS[s.category.frequency] ?? s.category.frequency}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(s.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? 'default' : 'destructive'}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
    </div>
  );
}
