'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { Plus, Search } from 'lucide-react';
import { PageHeader, EmptyState, PaginationControls } from '@/components/shared';
import { ExamGrid } from '@/modules/exams/components';

const CreateExamDialog = dynamic(
  () => import('@/modules/exams/components/create-exam-dialog').then(m => ({ default: m.CreateExamDialog })),
  { ssr: false },
);
import { useExamsQuery } from '@/modules/exams/hooks/use-exams-query';
import { useReferenceStore } from '@/stores';
import { ExamsSkeleton } from './exams-skeleton';
import type { PaginationParams } from '@/utils/pagination';
import type { ExamListFilters } from '@/modules/exams/exam-queries';

type Props = {
  filters: ExamListFilters;
  pagination: PaginationParams;
};

export function ExamsPageClient({ filters, pagination }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reference data from Zustand
  const subjects = useReferenceStore((s) => s.subjects);
  const classes = useReferenceStore((s) => s.classes);
  const academicSessions = useReferenceStore((s) => s.academicSessions);

  // React Query — client-first with caching
  const { data: result, isLoading } = useExamsQuery(pagination, filters);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/teacher/exams?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter('search', searchValue);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/teacher/exams?${params.toString()}`);
  }

  if (isLoading || !result) {
    return <ExamsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Create and manage exams"
        breadcrumbs={[{ label: 'Teacher', href: '/teacher' }, { label: 'Exams' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Exam
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
        <Select
          value={searchParams.get('status') ?? 'ALL'}
          onValueChange={(val) => updateFilter('status', val)}
        >
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          title="No exams"
          description="Create your first exam."
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Exam</Button>}
        />
      ) : (
        <ExamGrid exams={result.data} />
      )}

      {result.pagination.totalCount > 0 && (
        <PaginationControls
          currentPage={result.pagination.page}
          totalPages={result.pagination.totalPages}
          totalCount={result.pagination.totalCount}
          pageSize={result.pagination.pageSize}
          onPageChange={goToPage}
        />
      )}

      <CreateExamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subjects={subjects}
        classes={classes}
        academicSessions={academicSessions}
      />
    </div>
  );
}
