'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { McqOptionsEditor } from './mcq-options-editor';
import { updateQuestionAction } from '@/modules/questions/update-question-actions';
import { toast } from 'sonner';
import type { QuestionWithRelations } from '@/modules/questions/question-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: DeepSerialize<QuestionWithRelations>;
};

type McqOptionState = {
  label: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
  imageUrl?: string;
};

export function EditQuestionDialog({ open, onOpenChange, question }: Props) {
  const [isPending, startTransition] = useTransition();
  const [difficulty, setDifficulty] = useState<string>(question.difficulty);
  const [mcqOptions, setMcqOptions] = useState<McqOptionState[]>(
    question.mcqOptions.map((o) => ({
      label: o.label,
      text: o.text,
      isCorrect: o.isCorrect,
      sortOrder: o.sortOrder,
      ...(o.imageUrl ? { imageUrl: o.imageUrl } : {}),
    })),
  );
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateQuestionAction(question.id, {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        marks: parseFloat(formData.get('marks') as string),
        expectedTime: parseInt(formData.get('expectedTime') as string, 10) || undefined,
        modelAnswer: (formData.get('modelAnswer') as string) || undefined,
        explanation: (formData.get('explanation') as string) || undefined,
        mcqOptions: question.type === 'MCQ' ? mcqOptions : undefined,
      });
      if (result.success) {
        toast.success('Question updated');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update question details. Type and subject cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Question Title</Label>
            <Input
              id="editTitle"
              name="title"
              defaultValue={question.title}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editDesc">Description (optional)</Label>
            <Textarea
              id="editDesc"
              name="description"
              defaultValue={question.description ?? ''}
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMarks">Marks</Label>
              <Input
                id="editMarks"
                name="marks"
                type="number"
                step="0.5"
                min="0.5"
                defaultValue={Number(question.marks)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTime">Time (sec)</Label>
              <Input
                id="editTime"
                name="expectedTime"
                type="number"
                min="10"
                defaultValue={question.expectedTime ?? ''}
                disabled={isPending}
              />
            </div>
          </div>
          {question.type === 'MCQ' && (
            <McqOptionsEditor options={mcqOptions} onChange={(opts) => setMcqOptions(opts)} />
          )}
          {question.type !== 'MCQ' && (
            <div className="space-y-2">
              <Label htmlFor="editModelAnswer">Model Answer</Label>
              <Textarea
                id="editModelAnswer"
                name="modelAnswer"
                defaultValue={question.modelAnswer ?? ''}
                rows={4}
                disabled={isPending}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="editExplanation">Explanation (optional)</Label>
            <Textarea
              id="editExplanation"
              name="explanation"
              defaultValue={question.explanation ?? ''}
              rows={2}
              disabled={isPending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
