export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import {
  getExamsList,
  getFilterOptions,
} from '@/modules/principal/principal-queries';
import { ExamsListClient } from './exams-list-client';

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    subjectId?: string;
    type?: string;
    page?: string;
  }>;
};

export default async function PrincipalExamsPage({ searchParams }: Props) {
  await requireRole('PRINCIPAL');
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ exams, total }, filterOptions] = await Promise.all([
    getExamsList({
      search: params.search,
      status: params.status,
      subjectId: params.subjectId,
      type: params.type,
      page,
      pageSize: 20,
    }),
    getFilterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Monitor all exams, their participation, and analytics"
      />
      <ExamsListClient
        exams={exams.map((e) => ({
          ...e,
          scheduledStartAt: e.scheduledStartAt?.toISOString() ?? null,
          createdAt: e.createdAt.toISOString(),
        }))}
        total={total}
        currentPage={page}
        search={params.search ?? ''}
        status={params.status ?? ''}
        subjectId={params.subjectId ?? ''}
        type={params.type ?? ''}
        subjects={filterOptions.subjects}
      />
    </div>
  );
}
