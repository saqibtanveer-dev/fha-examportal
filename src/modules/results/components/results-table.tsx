'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPercentage, formatDate } from '@/utils/format';
import type { ResultWithDetails } from '@/modules/results/result-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Props = { results: DeepSerialize<ResultWithDetails>[] };

export function ResultsTable({ results }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="text-center">Marks</TableHead>
            <TableHead className="text-center">Percentage</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.exam.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{r.exam.subject.code}</Badge>
              </TableCell>
              <TableCell className="text-center">
                {String(r.obtainedMarks)} / {String(r.totalMarks)}
              </TableCell>
              <TableCell className="text-center font-medium">
                {formatPercentage(Number(r.percentage))}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={r.isPassed ? 'default' : 'destructive'}>
                  {r.isPassed ? 'Passed' : 'Failed'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(r.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
