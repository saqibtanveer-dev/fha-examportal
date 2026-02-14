export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import { getTeachersList } from '@/modules/principal/principal-queries';
import { TeachersListClient } from './teachers-list-client';

type Props = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

export default async function PrincipalTeachersPage({ searchParams }: Props) {
  await requireRole('PRINCIPAL');
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { teachers, total } = await getTeachersList({
    search: params.search,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Monitor all teachers, their exams, and performance"
      />
      <TeachersListClient
        teachers={teachers.map((t) => ({
          ...t,
          joiningDate: t.joiningDate.toISOString(),
          lastLoginAt: t.lastLoginAt?.toISOString() ?? null,
        }))}
        total={total}
        currentPage={page}
        search={params.search ?? ''}
      />
    </div>
  );
}
