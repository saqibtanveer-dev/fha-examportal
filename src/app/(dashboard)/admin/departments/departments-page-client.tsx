'use client';

import { useDepartmentsList } from '@/modules/departments/hooks/use-departments-query';
import { DepartmentsListSkeleton } from './departments-skeleton';
import { DepartmentsView } from './departments-view';

export function DepartmentsPageClient() {
  const { data: departments, isLoading } = useDepartmentsList();

  if (isLoading || !departments) {
    return <DepartmentsListSkeleton />;
  }

  return <DepartmentsView departments={departments} />;
}
