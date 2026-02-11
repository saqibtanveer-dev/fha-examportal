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
import { Plus, Search } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/shared';
import { ExamGrid, CreateExamDialog } from '@/modules/exams/components';
import type { PaginatedResult } from '@/utils/pagination';
import type { ExamWithRelations } from '@/modules/exams/exam-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Subject = { id: string; name: string; code: string };
type ClassItem = { id: string; name: string; sections: { id: string; name: string }[] };
type QuestionItem = { id: string; title: string; marks: number; type: string };

type Props = {
  result: DeepSerialize<PaginatedResult<ExamWithRelations>>;
  subjects: Subject[];
  classes: ClassItem[];
  questions: QuestionItem[];
};

export function ExamsPageClient({ result, subjects, classes, questions }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/teacher/exams?${params.toString()}`);
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            defaultValue={searchParams.get('search') ?? ''}
            onChange={(e) => {
              const timer = setTimeout(() => updateFilter('search', e.target.value), 400);
              return () => clearTimeout(timer);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={searchParams.get('status') ?? 'ALL'}
          onValueChange={(val) => updateFilter('status', val)}
        >
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
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

      <CreateExamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subjects={subjects}
        classes={classes}
        questions={questions}
      />
    </div>
  );
}
