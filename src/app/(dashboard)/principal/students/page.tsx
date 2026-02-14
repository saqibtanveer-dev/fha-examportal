export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { PageHeader } from '@/components/shared';
import {
  getStudentsList,
  getFilterOptions,
} from '@/modules/principal/principal-queries';
import { StudentsListClient } from './students-list-client';

type Props = {
  searchParams: Promise<{
    search?: string;
    classId?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function PrincipalStudentsPage({ searchParams }: Props) {
  await requireRole('PRINCIPAL');
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ students, total }, filterOptions] = await Promise.all([
    getStudentsList({
      search: params.search,
      classId: params.classId,
      status: params.status,
      page,
      pageSize: 20,
    }),
    getFilterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="View all students, their performance, and class-wise breakdown"
      />
      <StudentsListClient
        students={students.map((s) => ({
          ...s,
          lastLoginAt: s.lastLoginAt?.toISOString() ?? null,
        }))}
        total={total}
        currentPage={page}
        search={params.search ?? ''}
        classId={params.classId ?? ''}
        status={params.status ?? ''}
        classes={filterOptions.classes}
      />
    </div>
  );
}
