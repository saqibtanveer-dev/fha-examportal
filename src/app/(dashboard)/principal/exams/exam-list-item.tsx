import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import { FileText, Users, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export type Exam = {
  id: string;
  title: string;
  type: string;
  status: string;
  subjectName: string;
  subjectCode: string;
  createdBy: string;
  totalMarks: number;
  duration: number;
  scheduledStartAt: string | null;
  totalQuestions: number;
  totalStudents: number;
  avgPercentage: number;
  passRate: number;
  createdAt: string;
};

export type Subject = { id: string; name: string; code: string };

export const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PUBLISHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export const typeLabels: Record<string, string> = {
  QUIZ: 'Quiz',
  MIDTERM: 'Midterm',
  FINAL: 'Final',
  PRACTICE: 'Practice',
  CUSTOM: 'Custom',
};

export function ExamMobileCard({ exam }: { exam: Exam }) {
  return (
    <Link href={`${ROUTES.PRINCIPAL.EXAMS}/${exam.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pb-4 pt-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{exam.title}</h3>
              <p className="text-sm text-muted-foreground">
                {exam.subjectName} ({exam.subjectCode})
              </p>
            </div>
            <Badge className={statusColors[exam.status] ?? ''} variant="secondary">
              {exam.status}
            </Badge>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{exam.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{exam.totalStudents} students</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>Avg: {exam.avgPercentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{exam.duration} min</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <Badge variant="outline">{typeLabels[exam.type] ?? exam.type}</Badge>
            <span className="text-muted-foreground">By {exam.createdBy}</span>
          </div>
          {exam.totalStudents > 0 && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.min(exam.passRate, 100)}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function ExamTableRow({
  exam,
  onClick,
}: {
  exam: Exam;
  onClick: () => void;
}) {
  return (
    <TableRow className="cursor-pointer" onClick={onClick}>
      <TableCell>
        <div>
          <p className="max-w-50 truncate font-medium">{exam.title}</p>
          <p className="text-xs text-muted-foreground">
            {Number(exam.totalMarks)} marks · {exam.duration} min
          </p>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">{exam.subjectName}</span>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{typeLabels[exam.type] ?? exam.type}</Badge>
      </TableCell>
      <TableCell>
        <Badge className={statusColors[exam.status] ?? ''} variant="secondary">
          {exam.status}
        </Badge>
      </TableCell>
      <TableCell className="text-center">{exam.totalQuestions}</TableCell>
      <TableCell className="text-center">{exam.totalStudents}</TableCell>
      <TableCell className="text-right">
        {exam.totalStudents > 0 ? (
          <span className={exam.avgPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
            {exam.avgPercentage}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {exam.totalStudents > 0 ? (
          <span className={exam.passRate >= 50 ? 'text-green-600' : 'text-red-600'}>
            {exam.passRate}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{exam.createdBy}</TableCell>
    </TableRow>
  );
}
