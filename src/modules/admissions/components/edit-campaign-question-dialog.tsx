'use client';

import { useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/shared';
import { Pencil } from 'lucide-react';
import { updateCampaignQuestionAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';

type EditableCampaignQuestion = {
  id: string;
  questionId: string;
  marks: number;
  sectionLabel: string | null;
  question: {
    title: string;
    description?: string | null;
    mcqOptions: Array<{
      id: string;
      label: string;
      text: string;
      isCorrect: boolean;
      sortOrder: number;
    }>;
  };
  _count?: {
    applicantAnswers?: number;
  };
};

type FormValues = {
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
  sectionLabel: string;
};

type Props = {
  question: EditableCampaignQuestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

function buildDefaultValues(question: EditableCampaignQuestion | null): FormValues {
  const byLabel = new Map(
    (question?.question.mcqOptions ?? []).map((opt) => [opt.label, opt.text]),
  );
  const correctOption =
    question?.question.mcqOptions.find((opt) => opt.isCorrect)?.label ?? 'A';

  return {
    title: question?.question.title ?? '',
    description: question?.question.description ?? '',
    optionA: byLabel.get('A') ?? '',
    optionB: byLabel.get('B') ?? '',
    optionC: byLabel.get('C') ?? '',
    optionD: byLabel.get('D') ?? '',
    correctOption: OPTION_LABELS.includes(correctOption as 'A' | 'B' | 'C' | 'D')
      ? (correctOption as 'A' | 'B' | 'C' | 'D')
      : 'A',
    marks: question?.marks ?? 1,
    sectionLabel: question?.sectionLabel ?? '',
  };
}

export function EditCampaignQuestionDialog({ question, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const invalidate = useInvalidateCache();

  const form = useForm<FormValues>({
    defaultValues: buildDefaultValues(question),
  });

  useEffect(() => {
    form.reset(buildDefaultValues(question));
  }, [question, form]);

  function handleSubmit(data: FormValues) {
    if (!question) return;

    startTransition(async () => {
      const result = await updateCampaignQuestionAction({
        campaignQuestionId: question.id,
        title: data.title,
        description: data.description || undefined,
        options: [
          { text: data.optionA },
          { text: data.optionB },
          { text: data.optionC },
          { text: data.optionD },
        ],
        correctOption: data.correctOption,
        marks: data.marks,
        sectionLabel: data.sectionLabel || undefined,
      });

      if (!result.success) {
        toast.error(result.error ?? 'Failed to update question');
        return;
      }

      toast.success('Question updated');
      await invalidate.campaigns();
      onOpenChange(false);
    });
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset(buildDefaultValues(question));
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Campaign Question
          </DialogTitle>
          <DialogDescription>
            Update wording, options, answer key, marks, and section label.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm">Question *</Label>
            <Textarea
              {...form.register('title', { required: 'Required', minLength: 3 })}
              placeholder="Enter the question text..."
              rows={2}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Description (optional)</Label>
            <Input
              {...form.register('description')}
              placeholder="Additional context or instructions"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm">Options & Correct Answer *</Label>
            <RadioGroup
              value={form.watch('correctOption')}
              onValueChange={(v) => form.setValue('correctOption', v as FormValues['correctOption'])}
              className="space-y-2"
            >
              {OPTION_LABELS.map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <RadioGroupItem value={label} id={`edit-opt-${label}`} />
                  <Label htmlFor={`edit-opt-${label}`} className="w-6 shrink-0 text-sm font-bold">
                    {label}.
                  </Label>
                  <Input
                    {...form.register(`option${label}` as keyof FormValues, {
                      required: 'Required',
                    })}
                    placeholder={`Option ${label}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Marks *</Label>
              <Input
                type="number"
                min={1}
                step={1}
                {...form.register('marks', { valueAsNumber: true, min: 1 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Section (optional)</Label>
              <Input
                {...form.register('sectionLabel')}
                placeholder="e.g. Math, English"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
