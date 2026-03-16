'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState, Spinner } from '@/components/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileQuestion, Plus, Trash2, Upload, Pencil } from 'lucide-react';
import { useCampaignDetailQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { removeQuestionsFromCampaignAction } from '@/modules/admissions/admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { CreateQuestionDialog } from '@/modules/admissions/components/create-question-dialog';
import { CsvImportDialog } from '@/modules/admissions/components/csv-import-dialog';
import { EditCampaignQuestionDialog } from '@/modules/admissions/components/edit-campaign-question-dialog';

type Props = {
  campaignId: string;
  isDraft: boolean;
};

export function QuestionsTabContent({ campaignId, isDraft }: Props) {
  const { data, isLoading } = useCampaignDetailQuery(campaignId);
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [versionFilter, setVersionFilter] = useState<'ALL' | string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | string>('ALL');

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const result = data;
  const campaign = result?.success ? result.data : null;
  const questions = campaign?.campaignQuestions ?? [];

  const versionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) {
      const key = q.paperVersion ?? 'A';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [questions]);

  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    for (const q of questions) {
      const subjectName = q.question?.subject?.name;
      if (subjectName) set.add(subjectName);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const q of questions) {
      if (q.sectionLabel) set.add(q.sectionLabel);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return questions.filter((q: any) => {
      if (versionFilter !== 'ALL' && (q.paperVersion ?? 'A') !== versionFilter) return false;
      if (subjectFilter !== 'ALL' && q.question?.subject?.name !== subjectFilter) return false;
      if (sectionFilter !== 'ALL' && (q.sectionLabel ?? '') !== sectionFilter) return false;
      if (!needle) return true;

      const title = String(q.question?.title ?? '').toLowerCase();
      const section = String(q.sectionLabel ?? '').toLowerCase();
      const subject = String(q.question?.subject?.name ?? '').toLowerCase();
      return title.includes(needle) || section.includes(needle) || subject.includes(needle);
    });
  }, [questions, versionFilter, subjectFilter, sectionFilter, search]);

  const editQuestion = editQuestionId
    ? questions.find((cq: any) => cq.id === editQuestionId) ?? null
    : null;

  function handleRemove(questionId: string) {
    startTransition(async () => {
      const res = await removeQuestionsFromCampaignAction({
        campaignId,
        questionIds: [questionId],
      });
      if (res.success) {
        toast.success('Question removed');
        invalidate.campaigns();
      } else {
        toast.error(res.error);
      }
    });
  }

  const actionButtons = isDraft ? (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => setCsvOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />Import CSV
      </Button>
      <Button size="sm" onClick={() => setCreateOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />Create Question
      </Button>
    </div>
  ) : undefined;

  return (
    <>
      {questions.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="h-12 w-12 text-muted-foreground" />}
          title="No questions yet"
          description="Create MCQ questions for this campaign or import them from a CSV file."
          action={actionButtons}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {questions.length} total questions &bull; {filteredQuestions.length} visible
              </p>
              <p className="text-xs text-muted-foreground">
                Total marks: {campaign?.totalMarks ?? 0}
              </p>
            </div>
            {actionButtons}
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={versionFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setVersionFilter('ALL')}
              >
                All Versions ({questions.length})
              </Button>
              {versionCounts.map(([version, count]) => (
                <Button
                  key={version}
                  size="sm"
                  variant={versionFilter === version ? 'default' : 'outline'}
                  onClick={() => setVersionFilter(version)}
                >
                  Version {version} ({count})
                </Button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Search by title, section, subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Select value={subjectFilter} onValueChange={(v) => setSubjectFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sectionFilter} onValueChange={(v) => setSectionFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sections</SelectItem>
                  {sectionOptions.map((section) => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {versionCounts.map(([version, count]) => (
                <span key={version} className="rounded-full border px-2 py-0.5">
                  Version {version}: {count}
                </span>
              ))}
            </div>
          </div>

          <QuestionsList
            questions={filteredQuestions}
            isDraft={isDraft}
            isPending={isPending}
            onRemove={handleRemove}
            onEdit={setEditQuestionId}
          />
        </div>
      )}

      <CreateQuestionDialog
        campaignId={campaignId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <CsvImportDialog
        campaignId={campaignId}
        open={csvOpen}
        onOpenChange={setCsvOpen}
      />
      <EditCampaignQuestionDialog
        question={editQuestion}
        open={!!editQuestionId}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditQuestionId(null);
        }}
      />
    </>
  );
}

// ─── Extracted questions list for readability ───────────────────────

function QuestionsList({
  questions,
  isDraft,
  isPending,
  onRemove,
  onEdit,
}: {
  questions: any[];
  isDraft: boolean;
  isPending: boolean;
  onRemove: (id: string) => void;
  onEdit?: (campaignQuestionId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {questions.map((cq: any, index: number) => (
        <Card key={cq.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  Q{index + 1}
                </span>                <Badge variant="outline" className="font-mono text-[10px] px-1.5">
                  {cq.paperVersion ?? 'A'}
                </Badge>                {cq.sectionLabel && (
                  <span className="text-xs text-muted-foreground">[{cq.sectionLabel}]</span>
                )}
                <span className="text-xs text-muted-foreground">{cq.marks} marks</span>
              </div>
              <p className="mt-1 truncate text-sm">
                {cq.question?.title ?? 'Untitled question'}
              </p>
              {cq._count?.applicantAnswers > 0 && (
                <p className="mt-0.5 text-xs text-amber-700">
                  Locked: candidate attempts started
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit?.(cq.id)}
                disabled={(cq._count?.applicantAnswers ?? 0) > 0}
                title={(cq._count?.applicantAnswers ?? 0) > 0 ? 'Cannot edit after attempts' : 'Edit question'}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              {isDraft && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(cq.questionId)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
