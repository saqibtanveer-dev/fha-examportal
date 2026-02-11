'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState, Spinner } from '@/components/shared';
import { autoGradeSessionAction } from '@/modules/grading/grading-actions';
import { toast } from 'sonner';
import { Zap, PenLine } from 'lucide-react';
import Link from 'next/link';

type Session = {
  id: string;
  attemptNumber: number;
  submittedAt: Date | null;
  student: { id: string; firstName: string; lastName: string };
  exam: { id: string; title: string; subject: { id: string; name: string } };
  _count: { studentAnswers: number };
};

type Props = { sessions: Session[] };

export function GradingPageClient({ sessions }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAutoGrade(sessionId: string) {
    startTransition(async () => {
      const result = await autoGradeSessionAction(sessionId);
      if (result.success) {
        const data = result.data as { mcqMarks: number; fullyGraded: boolean };
        toast.success(data.fullyGraded ? 'Fully graded!' : `MCQs graded (${data.mcqMarks} marks). Manual grading needed.`);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading"
        description="Grade submitted exam answers"
        breadcrumbs={[{ label: 'Teacher', href: '/teacher' }, { label: 'Grading' }]}
      />

      {sessions.length === 0 ? (
        <EmptyState title="No submissions" description="No exam submissions awaiting grading." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{s.exam.subject.name}</Badge>
                  <Badge variant="secondary">{s._count.studentAnswers} answers</Badge>
                </div>
                <CardTitle className="text-base">{s.exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Student: {s.student.firstName} {s.student.lastName} (Attempt #{s.attemptNumber})
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAutoGrade(s.id)} disabled={isPending}>
                    {isPending ? <Spinner size="sm" className="mr-1" /> : <Zap className="mr-1 h-3.5 w-3.5" />}
                    Auto-grade
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/teacher/grading/${s.id}`}>
                      <PenLine className="mr-1 h-3.5 w-3.5" />Manual
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
