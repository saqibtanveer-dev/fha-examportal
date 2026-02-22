'use client';

import { useClassesList } from '@/modules/principal/hooks/use-principal-queries';
import { ClassesListSkeleton } from './classes-skeleton';
import { ClassesListView } from './classes-list-view';

export function ClassesPageClient() {
  const { data: classes, isLoading } = useClassesList();

  if (isLoading || !classes) {
    return <ClassesListSkeleton />;
  }

  return <ClassesListView classes={classes} />;
}
