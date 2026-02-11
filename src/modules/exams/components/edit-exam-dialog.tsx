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
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { updateExamAction } from '@/modules/exams/exam-actions';
import { toast } from 'sonner';
import type { ExamWithRelations } from '@/modules/exams/exam-queries';
import type { DeepSerialize } from '@/utils/serialize';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: DeepSerialize<ExamWithRelations>;
};

export function EditExamDialog({ open, onOpenChange, exam }: Props) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<string>(exam.type);
  const [showResultAfter, setShowResultAfter] = useState<string>(exam.showResultAfter);
  const [shuffleQuestions, setShuffleQuestions] = useState(exam.shuffleQuestions);
  const [allowReview, setAllowReview] = useState(exam.allowReview);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateExamAction(exam.id, {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        type: type as 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE' | 'CUSTOM',
        duration: parseInt(formData.get('duration') as string, 10),
        passingMarks: parseFloat(formData.get('passingMarks') as string),
        instructions: (formData.get('instructions') as string) || undefined,
        maxAttempts: parseInt(formData.get('maxAttempts') as string, 10) || 1,
        shuffleQuestions,
        showResultAfter: showResultAfter as 'IMMEDIATELY' | 'AFTER_DEADLINE' | 'MANUAL',
        allowReview,
      });
      if (result.success) {
        toast.success('Exam updated');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    });
  }

  if (exam.status !== 'DRAFT') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Edit</DialogTitle>
            <DialogDescription>
              Only draft exams can be edited. This exam is {exam.status.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>Update exam settings (draft only).</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examTitle">Title</Label>
            <Input
              id="examTitle"
              name="title"
              defaultValue={exam.title}
              required
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE', 'CUSTOM'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="examDuration">Duration (min)</Label>
              <Input
                id="examDuration"
                name="duration"
                type="number"
                min={5}
                max={300}
                defaultValue={exam.duration}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examPassing">Passing Marks</Label>
              <Input
                id="examPassing"
                name="passingMarks"
                type="number"
                min={0}
                step="0.5"
                defaultValue={Number(exam.passingMarks)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examAttempts">Max Attempts</Label>
              <Input
                id="examAttempts"
                name="maxAttempts"
                type="number"
                min={1}
                max={10}
                defaultValue={exam.maxAttempts}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="examDesc">Description</Label>
            <Textarea
              id="examDesc"
              name="description"
              defaultValue={exam.description ?? ''}
              rows={2}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examInst">Instructions</Label>
            <Textarea
              id="examInst"
              name="instructions"
              defaultValue={exam.instructions ?? ''}
              rows={2}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Show Results</Label>
            <Select value={showResultAfter} onValueChange={setShowResultAfter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IMMEDIATELY">Immediately</SelectItem>
                <SelectItem value="AFTER_DEADLINE">After Deadline</SelectItem>
                <SelectItem value="MANUAL">Manual Release</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="examShuffle">Shuffle Questions</Label>
              <Switch
                id="examShuffle"
                checked={shuffleQuestions}
                onCheckedChange={setShuffleQuestions}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="examReview">Allow Review</Label>
              <Switch
                id="examReview"
                checked={allowReview}
                onCheckedChange={setAllowReview}
              />
            </div>
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
