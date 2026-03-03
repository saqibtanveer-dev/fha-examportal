'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Spinner } from '@/components/shared';
import { FileQuestion, Plus, Trash2, Upload } from 'lucide-react';
import { useCampaignDetailQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { removeQuestionsFromCampaignAction } from '@/modules/admissions/admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { CreateQuestionDialog } from '@/modules/admissions/components/create-question-dialog';
import { CsvImportDialog } from '@/modules/admissions/components/csv-import-dialog';

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

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const result = data as any;
  const campaign = result?.success ? result.data : null;
  const questions = campaign?.campaignQuestions ?? [];

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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {questions.length} questions &bull; Total: {campaign?.totalMarks ?? 0} marks
            </p>
            {isDraft && actionButtons}
          </div>
          <QuestionsList questions={questions} isDraft={isDraft} isPending={isPending} onRemove={handleRemove} />
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
    </>
  );
}

// ─── Extracted questions list for readability ───────────────────────

function QuestionsList({
  questions,
  isDraft,
  isPending,
  onRemove,
}: {
  questions: any[];
  isDraft: boolean;
  isPending: boolean;
  onRemove: (id: string) => void;
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
            </div>
            {isDraft && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onRemove(cq.questionId)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
