'use client';

import { useActiveClasses } from '@/modules/classes/hooks/use-classes-query';
import { useFeeSettings, useFeeCategories } from '@/modules/fees/hooks/use-fee-admin';
import { SkeletonCardGrid } from '@/components/shared/skeletons';
import { GenerateFeesView } from './generate-fees-view';
import { AlertCircle } from 'lucide-react';

export function GeneratePageClient() {
  const { data: classes, isLoading: classesLoading, isError: classesError } = useActiveClasses();
  const { data: settings, isLoading: settingsLoading, isError: settingsError } = useFeeSettings();
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useFeeCategories(true);

  if (classesLoading || settingsLoading || categoriesLoading) {
    return <SkeletonCardGrid count={3} />;
  }

  if (classesError || settingsError || categoriesError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">Failed to load data</p>
      </div>
    );
  }

  return (
    <GenerateFeesView
      classes={(classes ?? []).map((c: { id: string; name: string; grade: number; sections?: { id: string; name: string }[] }) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        sections: c.sections?.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })),
      }))}
      categories={(categories ?? []).map((category: { id: string; name: string; frequency: 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME' }) => ({
        id: category.id,
        name: category.name,
        frequency: category.frequency,
      }))}
      dueDayOfMonth={settings?.dueDayOfMonth ?? 10}
    />
  );
}
