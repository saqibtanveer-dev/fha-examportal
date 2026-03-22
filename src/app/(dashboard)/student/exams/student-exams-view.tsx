'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState } from '@/components/shared';
import { Play, CheckCircle, Clock, FileText, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { formatPercentage } from '@/utils/format';

type ExamResult = {
  id: string;
  obtainedMarks: number | string;
  totalMarks: number | string;
  percentage: number | string;
  grade: string | null;
  isPassed: boolean;
};

type ExamItem = {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  deliveryMode: string;
  status: string;
  subject: { id: string; name: string; code: string };
  examSessions: { id: string; status: string; attemptNumber: number }[];
  examResults?: ExamResult[];
  _count: { examQuestions: number };
};

type Props = { exams: ExamItem[] };

export function StudentExamsView({ exams }: Props) {
  const router = useRouter();

  const onlineExams = exams.filter((e) => e.deliveryMode === 'ONLINE');
  const writtenExams = exams.filter((e) => e.deliveryMode === 'WRITTEN');

  return (
    <div className="space-y-8">
      <PageHeader title="My Exams" description="Available and completed exams" />

      {exams.length === 0 && (
        <EmptyState title="No exams" description="No exams assigned yet." />
      )}

      {/* Online Exams Section */}
      {onlineExams.length > 0 && (
        <section className="space-y-4">
          {writtenExams.length > 0 && (
            <h2 className="text-lg font-semibold">Online Exams</h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onlineExams.map((exam) => {
              const activeSession = exam.examSessions.find(
                (s) => s.status === 'NOT_STARTED' || s.status === 'IN_PROGRESS',
              );
              const completedSession = exam.examSessions.find(
                (s) => s.status === 'SUBMITTED' || s.status === 'GRADED',
              );
              const result = exam.examResults?.[0];

              return (
                <Card key={exam.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{exam.subject.code}</Badge>
                      {completedSession && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          <CheckCircle className="mr-1 h-3 w-3" />Done
                        </Badge>
                      )}
                      {activeSession && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                          <Clock className="mr-1 h-3 w-3" />In Progress
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="truncate text-base">{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 text-sm text-muted-foreground">
                      {exam._count.examQuestions} questions &middot; {exam.duration} min &middot; {Number(exam.totalMarks)} marks
                    </div>
                    {result && (
                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{Number(result.obtainedMarks)}/{Number(result.totalMarks)}</span>
                        <span className="text-muted-foreground">({formatPercentage(Number(result.percentage))})</span>
                        {result.grade && <Badge variant="secondary" className="text-xs">{result.grade}</Badge>}
                      </div>
                    )}
                    {activeSession ? (
                      <Button className="w-full" onClick={() => router.push(`/student/exams/sessions/${activeSession.id}`)}>
                        Continue Exam
                      </Button>
                    ) : completedSession && result ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/student/results/${result.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Result
                        </Link>
                      </Button>
                    ) : completedSession ? (
                      <Button variant="outline" className="w-full" disabled>
                        Awaiting Result
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link href={`/student/exams/${exam.id}/start`}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Exam
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Written Exams Section */}
      {writtenExams.length > 0 && (
        <section className="space-y-4">
          {onlineExams.length > 0 && (
            <h2 className="text-lg font-semibold">Written Exams</h2>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {writtenExams.map((exam) => {
              const result = exam.examResults?.[0];
              const session = exam.examSessions[0];
              const isAbsent = session?.status === 'ABSENT';
              const isGraded = session?.status === 'GRADED';

              return (
                <Card key={exam.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{exam.subject.code}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="mr-1 h-3 w-3" />Written
                        </Badge>
                      </div>
                      {isAbsent && (
                        <Badge variant="destructive" className="text-xs">Absent</Badge>
                      )}
                      {isGraded && result && (
                        <Badge className={result.isPassed ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}>
                          {result.isPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="truncate text-base">{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 text-sm text-muted-foreground">
                      {exam._count.examQuestions} questions &middot; {Number(exam.totalMarks)} marks
                    </div>
                    {result && (
                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{Number(result.obtainedMarks)}/{Number(result.totalMarks)}</span>
                        <span className="text-muted-foreground">({formatPercentage(Number(result.percentage))})</span>
                        {result.grade && <Badge variant="secondary" className="text-xs">{result.grade}</Badge>}
                      </div>
                    )}
                    {result ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/student/results/${result.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Result
                        </Link>
                      </Button>
                    ) : isAbsent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Marked Absent
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        {exam.status === 'COMPLETED' ? 'Awaiting Result' : 'In Progress'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
