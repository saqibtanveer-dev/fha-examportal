import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { ROUTES } from '@/lib/constants';
import { listResultTerms } from '@/modules/reports/queries/result-term-queries';
import { RemarksEntryClient } from '@/modules/reports/components/screens/remarks-entry-client';

export default async function RemarksEntryPage() {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const terms = await listResultTerms({ isActive: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Remarks"
        description="Add class teacher and principal remarks to student DMCs after consolidation."
        breadcrumbs={[
          { label: 'Reports', href: ROUTES.ADMIN.REPORTS },
          { label: 'Student Remarks' },
        ]}
      />
      <RemarksEntryClient terms={terms} />
    </div>
  );
}
