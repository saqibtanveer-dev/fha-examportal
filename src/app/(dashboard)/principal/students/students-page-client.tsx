'use client';

import { useSearchParams } from 'next/navigation';
import { useStudentsList, useFilterOptions } from '@/modules/principal/hooks/use-principal-queries';
import { StudentsListSkeleton } from './students-skeleton';
import { StudentsListView } from './students-list-view';

export function StudentsPageClient() {
  const searchParams = useSearchParams();
  
  // Get filters from URL
  const search = searchParams.get('search') ?? '';
  const classId = searchParams.get('classId') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  // Get filter options (classes with grade)
  const { data: filterOptions, isLoading: filtersLoading } = useFilterOptions();

  // Fetch students with React Query
  const { data, isLoading } = useStudentsList({
    search: search || undefined,
    classId: classId || undefined,
    status: status || undefined,
    page,
    pageSize: 20,
  });

  if (isLoading || filtersLoading || !data || !filterOptions) {
    return <StudentsListSkeleton />;
  }

  return (
    <StudentsListView
      students={data.students}
      total={data.total}
      currentPage={page}
      search={search}
      classId={classId}
      status={status}
      classes={filterOptions.classes}
    />
  );
}
