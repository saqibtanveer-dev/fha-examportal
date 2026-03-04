'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { SkeletonPage } from '@/components/shared';
import { fetchMyStudentDiaryProfileAction } from '@/modules/diary/diary-fetch-actions';
import { StudentDiaryView } from './diary-view';

export function StudentDiaryClient() {
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.diary.studentProfile(),
    queryFn: () => fetchMyStudentDiaryProfileAction(),
  });

  if (isLoading) return <SkeletonPage />;

  if (!profile) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Student profile not found. Please contact administration.
      </div>
    );
  }

  return <StudentDiaryView studentProfile={profile} />;
}
