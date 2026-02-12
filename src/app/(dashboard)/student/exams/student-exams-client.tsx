'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState } from '@/components/shared';
import { Play, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

type ExamItem = {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  subject: { id: string; name: string; code: string };
  examSessions: { id: string; status: string; attemptNumber: number }[];
  _count: { examQuestions: number };
};

type Props = { exams: ExamItem[] };

export function StudentExamsClient({ exams }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader title="My Exams" description="Available and completed exams" />
      {exams.length === 0 ? (
        <EmptyState title="No exams" description="No exams assigned yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const activeSession = exam.examSessions.find(
              (s) => s.status === 'NOT_STARTED' || s.status === 'IN_PROGRESS',
            );
            const completedSession = exam.examSessions.find(
              (s) => s.status === 'SUBMITTED' || s.status === 'GRADED',
            );

            return (
              <Card key={exam.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{exam.subject.code}</Badge>
                    {completedSession && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />Done
                      </Badge>
                    )}
                    {activeSession && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="mr-1 h-3 w-3" />In Progress
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 text-sm text-muted-foreground">
                    {exam._count.examQuestions} questions &middot; {exam.duration} min &middot; {String(exam.totalMarks)} marks
                  </div>
                  {activeSession ? (
                    <Button className="w-full" onClick={() => router.push(`/student/exams/sessions/${activeSession.id}`)}>
                      Continue Exam
                    </Button>
                  ) : completedSession ? (
                    <Button variant="outline" className="w-full" disabled>
                      Completed
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
      )}
    </div>
  );
}
