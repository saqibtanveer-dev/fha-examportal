'use client';

import { useClassesList } from '@/modules/classes/hooks/use-classes-query';
import { ClassesListSkeleton } from './classes-skeleton';
import { ClassesView } from './classes-view';

export function ClassesPageClient() {
  const { data: classes, isLoading } = useClassesList();

  if (isLoading || !classes) {
    return <ClassesListSkeleton />;
  }

  return <ClassesView classes={classes} />;
}
