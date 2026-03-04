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
import type { TeacherData } from './teacher-detail.types';

type Props = {
  exams: TeacherData['exams'];
};

export function TeacherExamsTable({ exams }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Exams Created ({exams.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/principal/exams/${exam.id}`}>
              <div className="rounded-lg border p-3 transition-colors hover:bg-accent">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.subject.code} &bull; {exam.type}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {exam.status}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold">{exam._count.examQuestions}</p>
                    <p className="text-muted-foreground">Questions</p>
                  </div>
                  <div>
                    <p className="font-semibold">{exam._count.examSessions}</p>
                    <p className="text-muted-foreground">Sessions</p>
                  </div>
                  <div>
                    <p className="font-semibold">{exam._count.examResults}</p>
                    <p className="text-muted-foreground">Results</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {exams.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No exams created yet
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Sessions</TableHead>
                <TableHead className="text-center">Results</TableHead>
                <TableHead>Created</TableHead>
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
                  <TableCell className="text-center">{exam._count.examQuestions}</TableCell>
                  <TableCell className="text-center">{exam._count.examSessions}</TableCell>
                  <TableCell className="text-center">{exam._count.examResults}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No exams created yet
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
