import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { listResultTerms } from '@/modules/reports/queries/result-term-queries';
import { prisma } from '@/lib/prisma';
import { ResultTermsClient } from '@/modules/reports/components/screens/result-terms-client';
import { logger } from '@/lib/logger';

export const metadata = { title: 'Result Terms' };

async function getPageData() {
  const [termsResult, sessionsResult, classesResult] = await Promise.allSettled([
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

  if (termsResult.status === 'rejected') {
    logger.error({ err: termsResult.reason }, 'Failed to load result terms list');
  }
  if (sessionsResult.status === 'rejected') {
    logger.error({ err: sessionsResult.reason }, 'Failed to load academic sessions for result terms page');
  }
  if (classesResult.status === 'rejected') {
    logger.error({ err: classesResult.reason }, 'Failed to load classes for result terms page');
  }

  return {
    terms: termsResult.status === 'fulfilled' ? termsResult.value : [],
    sessions: sessionsResult.status === 'fulfilled' ? sessionsResult.value : [],
    classes: classesResult.status === 'fulfilled' ? classesResult.value : [],
  };
}

const PAGE_DATA_FALLBACK = { terms: [], sessions: [], classes: [] } as Awaited<ReturnType<typeof getPageData>>;

export default async function ResultTermsPage() {
  await requireRole('ADMIN', 'PRINCIPAL');
  const data = await getPageData().catch((err) => {
    logger.error({ err }, 'Failed to load result terms page data');
    return PAGE_DATA_FALLBACK;
  });

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
