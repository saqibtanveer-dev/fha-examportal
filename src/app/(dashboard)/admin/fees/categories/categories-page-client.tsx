'use client';

import { useFeeCategories } from '@/modules/fees/hooks/use-fee-admin';
import { SkeletonTable } from '@/components/shared/skeletons';
import { CategoriesView } from './categories-view';
import { AlertCircle } from 'lucide-react';

export function CategoriesPageClient() {
  const { data: categories, isLoading, isError } = useFeeCategories();

  if (isLoading) {
    return <SkeletonTable />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">Failed to load fee categories</p>
      </div>
    );
  }

  return <CategoriesView categories={categories ?? []} />;
}
