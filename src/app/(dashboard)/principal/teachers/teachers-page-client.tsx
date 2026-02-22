'use client';

import { useSearchParams } from 'next/navigation';
import { useTeachersList } from '@/modules/principal/hooks/use-principal-queries';
import { TeachersListSkeleton } from './teachers-skeleton';
import { TeachersListView } from './teachers-list-view';

export function TeachersPageClient() {
  const searchParams = useSearchParams();
  
  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useTeachersList({
    search: search || undefined,
    page,
    pageSize: 20,
  });

  if (isLoading || !data) {
    return <TeachersListSkeleton />;
  }

  return (
    <TeachersListView
      teachers={data.teachers}
      total={data.total}
      currentPage={page}
      search={search}
    />
  );
}
