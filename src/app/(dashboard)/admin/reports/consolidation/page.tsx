import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { listResultTerms } from '@/modules/reports/queries/result-term-queries';
import { ConsolidationClient } from '@/modules/reports/components/screens/consolidation-client';

export const metadata = { title: 'Run Consolidation' };

export default async function ConsolidationPage() {
  await requireRole('ADMIN', 'PRINCIPAL');

  let terms: Awaited<ReturnType<typeof listResultTerms>> = [];
  try {
    terms = await listResultTerms({ isActive: true });
  } catch {
    // DB temporarily unreachable — render with empty state
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consolidation"
        description="Compute consolidated results for a result term. Process all students in a class/section at once."
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Consolidation' },
        ]}
      />
      <ConsolidationClient terms={terms} />
    </div>
  );
}
