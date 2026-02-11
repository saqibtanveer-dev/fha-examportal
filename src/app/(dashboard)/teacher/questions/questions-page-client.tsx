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
import { QuestionTable, CreateQuestionDialog } from '@/modules/questions/components';
import type { PaginatedResult } from '@/utils/pagination';
import type { QuestionWithRelations } from '@/modules/questions/question-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Subject = { id: string; name: string; code: string };

type Props = {
  result: DeepSerialize<PaginatedResult<QuestionWithRelations>>;
  subjects: Subject[];
};

export function QuestionsPageClient({ result, subjects }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/teacher/questions?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Create and manage exam questions"
        breadcrumbs={[{ label: 'Teacher', href: '/teacher' }, { label: 'Questions' }]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Question
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            defaultValue={searchParams.get('search') ?? ''}
            onChange={(e) => {
              const timer = setTimeout(() => updateFilter('search', e.target.value), 400);
              return () => clearTimeout(timer);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={searchParams.get('type') ?? 'ALL'}
          onValueChange={(val) => updateFilter('type', val)}
        >
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="MCQ">MCQ</SelectItem>
            <SelectItem value="SHORT_ANSWER">Short</SelectItem>
            <SelectItem value="LONG_ANSWER">Long</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get('difficulty') ?? 'ALL'}
          onValueChange={(val) => updateFilter('difficulty', val)}
        >
          <SelectTrigger className="w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          title="No questions"
          description="Create your first question."
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Question</Button>}
        />
      ) : (
        <QuestionTable questions={result.data} />
      )}

      {result.pagination.totalCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {result.data.length} of {result.pagination.totalCount} (page {result.pagination.page}/{result.pagination.totalPages})
        </p>
      )}

      <CreateQuestionDialog open={dialogOpen} onOpenChange={setDialogOpen} subjects={subjects} />
    </div>
  );
}
