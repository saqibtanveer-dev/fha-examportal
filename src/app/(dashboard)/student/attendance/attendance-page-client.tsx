'use client';

import { useQuery } from '@tanstack/react-query';
import { SkeletonPage, Spinner } from '@/components/shared';
import { fetchMyStudentProfileAction } from '@/modules/attendance/attendance-fetch-actions';
import { StudentAttendanceView } from './attendance-view';

export function StudentAttendanceClient() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-student-profile'],
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

  return <StudentAttendanceView studentProfile={profile} />;
}
