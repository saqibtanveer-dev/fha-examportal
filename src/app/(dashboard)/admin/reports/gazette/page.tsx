import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { listResultTerms } from '@/modules/reports/queries/result-term-queries';
import { GazetteClient } from '@/modules/reports/components/screens/gazette-client';

export const metadata = { title: 'Class Gazette' };

export default async function GazettePage() {
  await requireRole('ADMIN', 'PRINCIPAL');

  let terms: Awaited<ReturnType<typeof listResultTerms>> = [];
  try {
    terms = await listResultTerms({});
  } catch {
    // DB temporarily unreachable — render with empty state
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Gazette"
        description="View and print class tabulation sheets showing all students × all subjects"
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Class Gazette' },
        ]}
      />
      <GazetteClient terms={terms} />
    </div>
  );
}
