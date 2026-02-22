'use client';

import { useStudentExamsQuery } from '@/modules/exams/hooks/use-exams-query';
import { StudentExamsSkeleton } from './student-exams-skeleton';
import { StudentExamsView } from './student-exams-view';

export function StudentExamsPageClient() {
  const { data, isLoading } = useStudentExamsQuery();

  if (isLoading || !data) {
    return <StudentExamsSkeleton />;
  }

  if (!data.profile) {
    return (
      <div className="p-6 text-muted-foreground">
        No class assigned yet.
      </div>
    );
  }

  return <StudentExamsView exams={data.exams} />;
}
