'use client';

// ============================================
// Family Attendance Page — Client Component
// Reuses shared StudentAttendanceView
// ============================================

import { EmptyState } from '@/components/shared';
import { SkeletonPage } from '@/components/shared';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import { useSelectedChild } from '@/modules/family/hooks';
import { StudentAttendanceView } from '@/app/(dashboard)/student/attendance/attendance-view';
import { ChildSelector } from './child-selector';

export function FamilyAttendanceClient() {
  const { children, selectedChild, selectedChildId, isLoading: childrenLoading } = useSelectedChild();

  if (childrenLoading) return <SkeletonPage />;

  if (!selectedChild) {
    return (
      <EmptyState
        icon={<CalendarCheck className="h-12 w-12 text-muted-foreground" />}
        title="No Children"
        description="No students are linked to your account."
      />
    );
  }

  return (
    <StudentAttendanceView
      studentProfile={{
        id: selectedChild.studentProfileId,
        rollNumber: selectedChild.rollNumber,
        registrationNo: selectedChild.registrationNo,
        classId: selectedChild.classId,
        sectionId: selectedChild.sectionId,
      }}
      title="Attendance"
      description={`${selectedChild.studentName}'s attendance record`}
      breadcrumbs={[
        { label: 'Family', href: '/family' },
        { label: 'Attendance' },
      ]}
      headerSlot={
        <div className="mb-2">
          <ChildSelector children={children} selectedChildId={selectedChildId} />
        </div>
      }
    />
  );
}
