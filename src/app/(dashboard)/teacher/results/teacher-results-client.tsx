'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState } from '@/components/shared';
import { BarChart3, Users } from 'lucide-react';

type Exam = {
  id: string;
  title: string;
  subject: { code: string };
  _count: { examResults: number };
};

type Props = { exams: Exam[] };

export function TeacherResultsClient({ exams }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Results & Analytics"
        description="View exam results and student performance"
        breadcrumbs={[{ label: 'Teacher', href: '/teacher' }, { label: 'Results' }]}
      />

      {exams.length === 0 ? (
        <EmptyState title="No exams" description="Create exams to view results." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{exam.subject.code}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {exam._count.examResults}
                  </div>
                </div>
                <CardTitle className="truncate text-base">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button size="sm" asChild className="w-full">
                  <Link href={`/teacher/results/${exam.id}`}>
                    <BarChart3 className="mr-2 h-4 w-4" />View Results
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
