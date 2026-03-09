'use client';

import { useState } from 'react';
import { useDefaulterList } from '@/modules/fees/hooks/use-fee-admin';
import { useActiveClasses } from '@/modules/classes/hooks/use-classes-query';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { formatCurrency, formatMonth } from './fee-status-badge';

export function DefaulterReport() {
  const [classFilter, setClassFilter] = useState('all');
  const { data: classes } = useActiveClasses();
  const { data: defaulters, isLoading } = useDefaulterList(
    classFilter === 'all' ? undefined : classFilter,
  );

  if (isLoading) return <Spinner />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Defaulter List</CardTitle>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {(classes ?? []).map((c: { id: string; name: string; grade: number }) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {(!defaulters || defaulters.length === 0) ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No defaulters found. All fees are paid or not yet overdue.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.map((d: {
                  id: string;
                  generatedForMonth: string;
                  totalAmount: number;
                  balanceAmount: number;
                  dueDate: string;
                  studentProfile: {
                    rollNumber: string;
                    user: { firstName: string; lastName: string };
                    class: { name: string } | null;
                    section: { name: string } | null;
                  };
                }) => {
                  const daysOverdue = Math.max(
                    0,
                    Math.floor((Date.now() - new Date(d.dueDate).getTime()) / 86400000),
                  );
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        {d.studentProfile.user.firstName} {d.studentProfile.user.lastName}
                        <span className="ml-1 text-xs text-muted-foreground">({d.studentProfile.rollNumber})</span>
                      </TableCell>
                      <TableCell>{d.studentProfile.class?.name} {d.studentProfile.section?.name}</TableCell>
                      <TableCell>{formatMonth(d.generatedForMonth)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.totalAmount)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.balanceAmount)}</TableCell>
                      <TableCell>{new Date(d.dueDate).toLocaleDateString('en-PK')}</TableCell>
                      <TableCell>
                        <Badge variant={daysOverdue > 30 ? 'destructive' : 'secondary'}>
                          {daysOverdue} days
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
