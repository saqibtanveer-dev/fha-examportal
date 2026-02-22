'use client';

import { useSearchParams } from 'next/navigation';
import { useExamsList, useFilterOptions } from '@/modules/principal/hooks/use-principal-queries';
import { ExamsListSkeleton } from './exams-skeleton';
import { ExamsListView } from './exams-list-view';

export function ExamsPageClient() {
  const searchParams = useSearchParams();
  
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const subjectId = searchParams.get('subjectId') ?? '';
  const type = searchParams.get('type') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const { data: filterOptions, isLoading: filtersLoading } = useFilterOptions();

  const { data, isLoading } = useExamsList({
    search: search || undefined,
    status: status || undefined,
    subjectId: subjectId || undefined,
    type: type || undefined,
    page,
    pageSize: 20,
  });

  if (isLoading || filtersLoading || !data || !filterOptions) {
    return <ExamsListSkeleton />;
  }

  return (
    <ExamsListView
      exams={data.exams}
      total={data.total}
      currentPage={page}
      search={search}
      status={status}
      subjectId={subjectId}
      type={type}
      subjects={filterOptions.subjects}
    />
  );
}
