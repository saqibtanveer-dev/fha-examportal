'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/shared';
import { Plus, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCampaignQuestionAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { PAPER_VERSIONS } from '@/lib/constants';

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
  paperVersion: string;
};

type Props = {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateQuestionDialog({ campaignId, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const [addedCount, setAddedCount] = useState(0);
  const invalidate = useInvalidateCache();

  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 1,
      sectionLabel: '',
      paperVersion: 'A',
    },
  });

  function handleSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await createCampaignQuestionAction({
        campaignId,
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
        paperVersion: data.paperVersion,
      });

      if (result.success) {
        toast.success('Question added');
        setAddedCount((c) => c + 1);
        invalidate.campaigns();
        form.reset();
      } else {
        toast.error(result.error ?? 'Failed to add question');
      }
    });
  }

  function handleClose() {
    form.reset();
    setAddedCount(0);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create MCQ Question
          </DialogTitle>
          <DialogDescription>
            Create a new MCQ question for this campaign.
            {addedCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {addedCount} added
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Question title */}
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

          {/* Description (optional) */}
          <div className="space-y-1">
            <Label className="text-sm">Description (optional)</Label>
            <Input
              {...form.register('description')}
              placeholder="Additional context or instructions"
            />
          </div>

          {/* 4 options + correct answer selection */}
          <div className="space-y-3">
            <Label className="text-sm">Options & Correct Answer *</Label>
            <RadioGroup
              value={form.watch('correctOption')}
              onValueChange={(v) => form.setValue('correctOption', v as FormValues['correctOption'])}
              className="space-y-2"
            >
              {(['A', 'B', 'C', 'D'] as const).map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <RadioGroupItem value={label} id={`opt-${label}`} />
                  <Label
                    htmlFor={`opt-${label}`}
                    className="w-6 shrink-0 text-sm font-bold"
                  >
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
            <p className="text-xs text-muted-foreground">
              Select the radio button next to the correct answer.
            </p>
          </div>

          {/* Marks + Section + Paper Version */}
          <div className="grid grid-cols-3 gap-3">
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
            <div className="space-y-1">
              <Label className="text-sm">Paper Version *</Label>
              <Select
                value={form.watch('paperVersion')}
                onValueChange={(v) => form.setValue('paperVersion', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  {PAPER_VERSIONS.map((v) => (
                    <SelectItem key={v} value={v}>
                      Version {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Done
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Add Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
