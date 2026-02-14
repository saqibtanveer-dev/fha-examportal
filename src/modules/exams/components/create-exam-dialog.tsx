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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { createExamAction } from '@/modules/exams/exam-actions';
import { toast } from 'sonner';

type Subject = { id: string; name: string; code: string };
type ClassItem = { id: string; name: string; sections: { id: string; name: string }[] };
type QuestionItem = { id: string; title: string; marks: number; type: string };
type AcademicSessionItem = { id: string; name: string; isCurrent: boolean };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  classes: ClassItem[];
  questions: QuestionItem[];
  academicSessions?: AcademicSessionItem[];
};

export function CreateExamDialog({ open, onOpenChange, subjects, classes, questions, academicSessions = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('QUIZ');
  const [academicSessionId, setAcademicSessionId] = useState(() => {
    const current = academicSessions.find((s) => s.isCurrent);
    return current?.id ?? '';
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const router = useRouter();

  const filteredQuestions = questions.filter((q) => !subjectId || true);

  function toggleQuestion(id: string) {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSubmit(formData: FormData) {
    const totalMarks = selectedQuestions.reduce((sum, qId) => {
      const q = questions.find((x) => x.id === qId);
      return sum + (q?.marks ?? 0);
    }, 0);

    startTransition(async () => {
      const result = await createExamAction({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        subjectId,
        academicSessionId: academicSessionId || undefined,
        type: type as 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE' | 'CUSTOM',
        totalMarks,
        passingMarks: parseFloat(formData.get('passingMarks') as string),
        duration: parseInt(formData.get('duration') as string, 10),
        instructions: (formData.get('instructions') as string) || undefined,
        shuffleQuestions: false,
        showResultAfter: 'IMMEDIATELY' as const,
        allowReview: true,
        maxAttempts: 1,
        questions: selectedQuestions.map((qId, i) => ({
          questionId: qId,
          sortOrder: i,
          marks: questions.find((q) => q.id === qId)?.marks ?? 1,
          isRequired: true,
        })),
        classAssignments: selectedClasses.map((classId) => ({ classId })),
      });
      if (result.success) {
        toast.success('Exam created');
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
          <DialogTitle>Create Exam</DialogTitle>
          <DialogDescription>Build a new exam from your question bank.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required disabled={isPending} />
            </div>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" name="duration" type="number" min={5} max={300} required disabled={isPending} />
            </div>
          </div>
          {academicSessions.length > 0 && (
            <div className="space-y-2">
              <Label>Academic Session</Label>
              <Select value={academicSessionId} onValueChange={setAcademicSessionId}>
                <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  {academicSessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}{s.isCurrent ? ' (Current)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="passingMarks">Passing Marks</Label>
            <Input id="passingMarks" name="passingMarks" type="number" min={0} step="0.5" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" name="instructions" rows={2} disabled={isPending} />
          </div>

          {/* Question Selection */}
          <div className="space-y-2">
            <Label>Questions ({selectedQuestions.length} selected)</Label>
            <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1">
              {filteredQuestions.map((q) => (
                <label key={q.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1">
                  <Checkbox
                    checked={selectedQuestions.includes(q.id)}
                    onCheckedChange={() => toggleQuestion(q.id)}
                  />
                  <span className="text-sm flex-1 truncate">{q.title}</span>
                  <span className="text-xs text-muted-foreground">{q.marks}m</span>
                </label>
              ))}
              {filteredQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">No questions available</p>
              )}
            </div>
          </div>

          {/* Class Assignment */}
          <div className="space-y-2">
            <Label>Assign to Classes ({selectedClasses.length} selected)</Label>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <label key={c.id} className="flex items-center gap-1 cursor-pointer">
                  <Checkbox
                    checked={selectedClasses.includes(c.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedClasses((p) => [...p, c.id]);
                      else setSelectedClasses((p) => p.filter((x) => x !== c.id));
                    }}
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !subjectId || selectedQuestions.length === 0 || selectedClasses.length === 0}>
              {isPending && <Spinner size="sm" className="mr-2" />}Create Exam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
