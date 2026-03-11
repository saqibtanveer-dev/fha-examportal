'use client';

import { PageHeader } from '@/components/shared';
import { EnrollmentView } from '@/modules/subjects/components/enrollment-view';

export default function ElectiveEnrollmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Elective Enrollment"
        description="Manage student enrollments in elective subjects"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Subjects', href: '/admin/subjects' },
          { label: 'Elective Enrollment' },
        ]}
      />
      <EnrollmentView />
    </div>
  );
}
