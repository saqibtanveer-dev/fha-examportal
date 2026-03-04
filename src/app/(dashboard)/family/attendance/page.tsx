import { Suspense } from 'react';
import { requireRole } from '@/lib/auth-utils';
import { FamilyAttendanceClient } from '@/modules/family/components';
import { SkeletonDashboard } from '@/components/shared';

export default async function FamilyAttendancePage() {
  await requireRole('FAMILY');

  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <FamilyAttendanceClient />
    </Suspense>
  );
}
