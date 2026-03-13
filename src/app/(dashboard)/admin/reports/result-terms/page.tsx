import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { listResultTerms } from '@/modules/reports/queries/result-term-queries';
import { prisma } from '@/lib/prisma';
import { ResultTermsClient } from '@/modules/reports/components/screens/result-terms-client';

export const metadata = { title: 'Result Terms' };

async function getPageData() {
  const [terms, sessions, classes] = await Promise.all([
    listResultTerms({}),
    prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      orderBy: { grade: 'asc' },
      select: { id: true, name: true, grade: true },
    }),
  ]);
  return { terms, sessions, classes };
}

const PAGE_DATA_FALLBACK = { terms: [], sessions: [], classes: [] } as Awaited<ReturnType<typeof getPageData>>;

export default async function ResultTermsPage() {
  await requireRole('ADMIN', 'PRINCIPAL');

  let data = PAGE_DATA_FALLBACK;
  try {
    data = await getPageData();
  } catch {
    // DB temporarily unreachable — render with empty state
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Result Terms"
        description="Configure consolidation terms — define exam groups, weightage, and link exams"
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Result Terms' },
        ]}
      />
      <ResultTermsClient
        terms={data.terms}
        sessions={data.sessions}
        classes={data.classes}
      />
    </div>
  );
}
