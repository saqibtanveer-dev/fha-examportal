import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { listResultTerms } from '@/modules/reports/queries/result-term-queries';
import { DmcGeneratorClient } from '@/modules/reports/components/screens/dmc-generator-client';

export const metadata = { title: 'DMC Generator' };

export default async function DmcPage() {
  await requireRole('ADMIN', 'PRINCIPAL');

  const terms = await listResultTerms({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="DMC Generator"
        description="Generate and print Detailed Marks Certificates for students"
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'DMC Generator' },
        ]}
      />
      <DmcGeneratorClient terms={terms} />
    </div>
  );
}
