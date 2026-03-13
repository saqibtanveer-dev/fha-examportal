'use client';

import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/shared';
import { fetchMyStudentProfileAction } from '@/modules/attendance/attendance-fetch-actions';
import { queryKeys } from '@/lib/query-keys';
import { StudentTimetableView } from './timetable-view';

export function StudentTimetableClient() {
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.student.profile(),
    queryFn: () => fetchMyStudentProfileAction(),
  });

  if (isLoading) return <SkeletonPage />;
  if (!profile) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Student profile not found. Please contact administration.
      </div>
    );
  }

  return <StudentTimetableView studentProfile={profile} />;
}
