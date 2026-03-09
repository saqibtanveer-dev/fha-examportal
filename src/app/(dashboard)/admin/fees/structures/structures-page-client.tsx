'use client';

import { useFeeStructures, useFeeCategories } from '@/modules/fees/hooks/use-fee-admin';
import { useActiveClasses } from '@/modules/classes/hooks/use-classes-query';
import { SkeletonTable } from '@/components/shared/skeletons';
import { StructuresView } from './structures-view';
import { AlertCircle } from 'lucide-react';

export function StructuresPageClient() {
  const { data: structures, isLoading: structuresLoading, isError: structuresError } = useFeeStructures();
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useFeeCategories(true);
  const { data: classes, isLoading: classesLoading, isError: classesError } = useActiveClasses();

  const isLoading = structuresLoading || categoriesLoading || classesLoading;
  const isError = structuresError || categoriesError || classesError;

  if (isLoading) {
    return <SkeletonTable />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">Failed to load fee structures</p>
      </div>
    );
  }

  return (
    <StructuresView
      structures={structures ?? []}
      categories={categories ?? []}
      classes={(classes ?? []).map((c: { id: string; name: string; grade: number }) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
      }))}
    />
  );
}
