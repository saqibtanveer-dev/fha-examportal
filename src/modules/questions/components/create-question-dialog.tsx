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
import { createQuestionAction } from '@/modules/questions/question-actions';
import { McqOptionsEditor } from './mcq-options-editor';
import { toast } from 'sonner';
import type { CreateQuestionInput } from '@/validations/question-schemas';

type Subject = { id: string; name: string; code: string };
type SubjectClassMap = { subjectId: string; classId: string; className: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  subjectClassLinks?: SubjectClassMap[];
};

export function CreateQuestionDialog({ open, onOpenChange, subjects, subjectClassLinks = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<string>('MCQ');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [mcqOptions, setMcqOptions] = useState<CreateQuestionInput['mcqOptions']>([
    { label: 'A', text: '', isCorrect: true, sortOrder: 0 },
    { label: 'B', text: '', isCorrect: false, sortOrder: 1 },
    { label: 'C', text: '', isCorrect: false, sortOrder: 2 },
    { label: 'D', text: '', isCorrect: false, sortOrder: 3 },
  ]);
  const router = useRouter();

  // Classes available for the selected subject
  const classesForSubject = subjectClassLinks.filter((l) => l.subjectId === subjectId);

  function handleSubjectChange(newSubjectId: string) {
    setSubjectId(newSubjectId);
    setClassId(''); // Reset when subject changes
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const input: CreateQuestionInput = {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        subjectId,
        classId: classId || undefined,
        type: type as 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER',
        difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        marks: parseFloat(formData.get('marks') as string),
        expectedTime: parseInt(formData.get('expectedTime') as string, 10) || undefined,
        modelAnswer: (formData.get('modelAnswer') as string) || undefined,
        explanation: (formData.get('explanation') as string) || undefined,
        mcqOptions: type === 'MCQ' ? mcqOptions : undefined,
      };

      const result = await createQuestionAction(input);
      if (result.success) {
        toast.success('Question created');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
          <DialogDescription>Add a new question to the bank.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class {classesForSubject.length > 0 ? '' : '(optional)'}</Label>
              <Select value={classId} onValueChange={setClassId} disabled={!subjectId || classesForSubject.length === 0}>
                <SelectTrigger><SelectValue placeholder={classesForSubject.length === 0 ? 'No classes linked' : 'Select class'} /></SelectTrigger>
                <SelectContent>
                  {classesForSubject.map((l) => (
                    <SelectItem key={l.classId} value={l.classId}>{l.className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">MCQ</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input id="title" name="title" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" rows={3} disabled={isPending} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
              <Label htmlFor="marks">Marks</Label>
              <Input id="marks" name="marks" type="number" step="0.5" min="0.5" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedTime">Time (sec)</Label>
              <Input id="expectedTime" name="expectedTime" type="number" min="10" disabled={isPending} />
            </div>
          </div>
          {type === 'MCQ' && <McqOptionsEditor options={mcqOptions ?? []} onChange={setMcqOptions} />}
          {type !== 'MCQ' && (
            <div className="space-y-2">
              <Label htmlFor="modelAnswer">Model Answer</Label>
              <Textarea id="modelAnswer" name="modelAnswer" rows={4} disabled={isPending} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <Textarea id="explanation" name="explanation" rows={2} disabled={isPending} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !subjectId}>
              {isPending && <Spinner size="sm" className="mr-2" />}Create Question
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
