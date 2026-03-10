'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPercentage, formatDate } from '@/utils/format';
import { Eye } from 'lucide-react';
import type { ResultWithDetails } from '@/modules/results/result-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Props = {
  results: DeepSerialize<ResultWithDetails>[];
  /** Controls which detail link is generated and which columns are shown */
  viewMode?: 'student' | 'teacher';
  /** Required for teacher view — used to build detail links */
  examId?: string;
  /** Override the base href for detail links (e.g. '/family/results') */
  detailHrefPrefix?: string;
};

export function ResultsTable({ results, viewMode = 'student', examId, detailHrefPrefix }: Props) {
  const isTeacher = viewMode === 'teacher';

  function getDetailHref(result: DeepSerialize<ResultWithDetails>): string {
    if (detailHrefPrefix) {
      return `${detailHrefPrefix}/${result.id}`;
    }
    if (isTeacher && examId) {
      return `/teacher/results/${examId}/${result.id}`;
    }
    return `/student/results/${result.id}`;
  }

  return (
    <>
      {/* ── Mobile Card View ── */}
      <div className="space-y-2 md:hidden">
        {results.map((r) => (
          <Link key={r.id} href={getDetailHref(r)} className="block rounded-lg border bg-card p-3 space-y-1.5 active:bg-muted">
            {isTeacher && (
              <p className="text-xs text-muted-foreground">{r.student.firstName} {r.student.lastName}</p>
            )}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium line-clamp-1 flex-1">{r.exam.title}</p>
              <Badge variant={r.isPassed ? 'default' : 'destructive'}>
                {r.isPassed ? 'Passed' : 'Failed'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span><Badge variant="outline" className="text-[10px]">{r.exam.subject.code}</Badge></span>
              <span className="font-mono">{Number(r.obtainedMarks)}/{Number(r.totalMarks)}</span>
              <span>{formatPercentage(Number(r.percentage))}</span>
              {r.grade && <Badge variant="secondary" className="text-[10px]">{r.grade}</Badge>}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isTeacher && <TableHead>Student</TableHead>}
            <TableHead>Exam</TableHead>
            <TableHead className="hidden sm:table-cell">Subject</TableHead>
            <TableHead className="text-center">Marks</TableHead>
            <TableHead className="hidden sm:table-cell text-center">Percentage</TableHead>
            <TableHead className="hidden md:table-cell text-center">Grade</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Date</TableHead>
            <TableHead className="text-center">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.id}>
              {isTeacher && (
                <TableCell className="max-w-40 font-medium">
                  <span className="line-clamp-1">{r.student.firstName} {r.student.lastName}</span>
                </TableCell>
              )}
              <TableCell className="max-w-48 font-medium">
                <span className="line-clamp-2 wrap-break-word">{r.exam.title}</span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline">{r.exam.subject.code}</Badge>
              </TableCell>
              <TableCell className="text-center">
                {Number(r.obtainedMarks)} / {Number(r.totalMarks)}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center font-medium">
                {formatPercentage(Number(r.percentage))}
              </TableCell>
              <TableCell className="hidden md:table-cell text-center">
                {r.grade ? (
                  <Badge variant="secondary">{r.grade}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={r.isPassed ? 'default' : 'destructive'}>
                  {r.isPassed ? 'Passed' : 'Failed'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {formatDate(r.createdAt)}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={getDetailHref(r)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </>
  );
}
