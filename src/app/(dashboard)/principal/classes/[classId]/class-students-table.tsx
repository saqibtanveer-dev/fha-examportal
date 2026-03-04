import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { Eye } from 'lucide-react';
import type { ClassDetailData } from './class-detail.types';

type Props = {
  students: ClassDetailData['studentsWithPerformance'];
};

export function ClassStudentsTable({ students }: Props) {
  const sorted = [...students].sort((a, b) => b.avgPercentage - a.avgPercentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Students ({sorted.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile */}
        <div className="space-y-3 p-4 md:hidden">
          {sorted.map((student, idx) => (
            <Link key={student.userId} href={`/principal/students/${student.userId}`}>
              <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                      <p className="truncate font-medium text-sm">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Roll: {student.rollNumber} &bull; {student.section}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{student.avgPercentage}%</p>
                    <p className="text-[10px] text-muted-foreground">{student.examsTaken} exams</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {sorted.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No students</p>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-center">Exams</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead className="text-center">Pass Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((student, idx) => (
                <TableRow key={student.userId}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell className="text-center">{student.examsTaken}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {student.avgPercentage}%
                  </TableCell>
                  <TableCell className="text-center">{student.passRate}%</TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/principal/students/${student.userId}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
