import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ClassDetailData } from './class-detail.types';

type Props = {
  exams: ClassDetailData['assignedExams'];
};

export function ClassExamsTable({ exams }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Assigned Exams ({exams.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile */}
        <div className="space-y-3 p-4 md:hidden">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/principal/exams/${exam.id}`}>
              <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.subject.code} &bull; by {exam.createdBy.firstName}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {exam.status}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold">{exam.resultsCount}</p>
                    <p className="text-muted-foreground">Results</p>
                  </div>
                  <div>
                    <p className="font-semibold">{exam.avgPercentage}%</p>
                    <p className="text-muted-foreground">Avg</p>
                  </div>
                  <div>
                    <p className="font-semibold">{exam.passRate}%</p>
                    <p className="text-muted-foreground">Pass</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-center">Results</TableHead>
                <TableHead className="text-center">Avg %</TableHead>
                <TableHead className="text-center">Pass Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <Link
                      href={`/principal/exams/${exam.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {exam.title}
                    </Link>
                  </TableCell>
                  <TableCell>{exam.subject.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {exam.createdBy.firstName} {exam.createdBy.lastName}
                  </TableCell>
                  <TableCell className="text-center">{exam.resultsCount}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {exam.avgPercentage}%
                  </TableCell>
                  <TableCell className="text-center">{exam.passRate}%</TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No exams assigned
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
