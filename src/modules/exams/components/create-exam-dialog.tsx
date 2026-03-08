'use client';

import { useState, useMemo, useTransition } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Spinner } from '@/components/shared';
import { createExamAction } from '@/modules/exams/exam-actions';
import { useQuestionsForPicker } from '@/modules/questions/hooks/use-questions-query';
import { useInvalidateCache } from '@/lib/cache-utils';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import { QuestionPicker } from './question-picker';
import type { Subject, ClassItem, QuestionItem, AcademicSessionItem } from './create-exam-types';
import { QUESTION_TIME_ESTIMATES } from './create-exam-types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  classes: ClassItem[];
  academicSessions?: AcademicSessionItem[];
};

export function CreateExamDialog({ open, onOpenChange, subjects, classes, academicSessions = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('QUIZ');
  const [deliveryMode, setDeliveryMode] = useState<'ONLINE' | 'WRITTEN'>('ONLINE');
  const [duration, setDuration] = useState('');
  const [academicSessionId, setAcademicSessionId] = useState(() => {
    const current = academicSessions.find((s) => s.isCurrent);
    return current?.id ?? '';
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const invalidate = useInvalidateCache();

  const { data: pickerQuestions = [], isLoading: isLoadingQuestions } = useQuestionsForPicker(subjectId);
  const questions: QuestionItem[] = useMemo(
    () => pickerQuestions.map((q) => ({ id: q.id, title: q.title, marks: Number(q.marks), type: q.type, subjectId })),
    [pickerQuestions, subjectId],
  );

  const totalMarks = useMemo(
    () => selectedQuestions.reduce((sum, qId) => sum + (questions.find((x) => x.id === qId)?.marks ?? 0), 0),
    [selectedQuestions, questions],
  );

  const suggestedDuration = useMemo(() => {
    if (selectedQuestions.length === 0) return 0;
    const totalMin = selectedQuestions.reduce((sum, qId) => {
      const q = questions.find((x) => x.id === qId);
      return sum + (q?.estimatedTime ?? QUESTION_TIME_ESTIMATES[q?.type ?? ''] ?? 2);
    }, 0);
    return Math.max(5, Math.ceil((totalMin * 1.1) / 5) * 5);
  }, [selectedQuestions, questions]);

  function toggleQuestion(id: string) {
    setSelectedQuestions((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!duration || duration === String(suggestedDuration)) {
        const newTotal = next.reduce((sum, qId) => {
          const q = questions.find((x) => x.id === qId);
          return sum + (q?.estimatedTime ?? QUESTION_TIME_ESTIMATES[q?.type ?? ''] ?? 2);
        }, 0);
        const suggested = Math.max(5, Math.ceil((newTotal * 1.1) / 5) * 5);
        if (next.length > 0) setDuration(String(suggested));
      }
      return next;
    });
  }

  function handleSubjectChange(newSubjectId: string) {
    setSubjectId(newSubjectId);
    setSelectedQuestions([]);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createExamAction({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        subjectId,
        academicSessionId: academicSessionId || undefined,
        type: type as 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE' | 'CUSTOM',
        deliveryMode,
        totalMarks,
        passingMarks: parseFloat(formData.get('passingMarks') as string),
        duration: parseInt(duration, 10),
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
        resetForm();
        await invalidate.afterExamCreate();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function resetForm() {
    setSubjectId('');
    setType('QUIZ');
    setDeliveryMode('ONLINE');
    setDuration('');
    setSelectedQuestions([]);
    setSelectedClasses([]);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exam</DialogTitle>
          <DialogDescription>Build a new exam from your question bank.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* Delivery Mode Toggle */}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">Delivery Mode:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={deliveryMode === 'ONLINE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeliveryMode('ONLINE')}
                disabled={isPending}
              >
                Online
              </Button>
              <Button
                type="button"
                variant={deliveryMode === 'WRITTEN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeliveryMode('WRITTEN')}
                disabled={isPending}
              >
                Written (Paper)
              </Button>
            </div>
          </div>
          {deliveryMode === 'WRITTEN' && (
            <p className="text-xs text-muted-foreground">
              Written exams are conducted on paper. You&apos;ll enter marks per question per student on the portal after checking papers.
            </p>
          )}

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
              <Select value={subjectId} onValueChange={handleSubjectChange}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="duration">Duration (min)</Label>
                {suggestedDuration > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                        onClick={() => setDuration(String(suggestedDuration))}
                      >
                        <Clock className="h-3 w-3" />
                        Suggested: {suggestedDuration}m
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Click to auto-set duration based on selected questions</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <Input id="duration" name="duration" type="number" min={5} max={300} required disabled={isPending} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          {academicSessions.length > 0 && (
            <div className="space-y-2">
              <Label>Academic Session</Label>
              <Select value={academicSessionId} onValueChange={setAcademicSessionId}>
                <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  {academicSessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}{s.isCurrent ? ' (Current)' : ''}</SelectItem>
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

          <QuestionPicker
            questions={questions}
            isLoading={isLoadingQuestions}
            hasSubject={!!subjectId}
            selectedIds={selectedQuestions}
            onToggle={toggleQuestion}
            totalMarks={totalMarks}
            suggestedDuration={suggestedDuration}
          />

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

          {selectedQuestions.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2 text-sm">
              <span>{selectedQuestions.length} questions</span>
              <span className="font-medium">{totalMarks} marks</span>
              {duration && <span className="text-muted-foreground">{duration} min</span>}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Cancel</Button>
            <Button type="submit" disabled={isPending || !subjectId || selectedQuestions.length === 0 || selectedClasses.length === 0}>
              {isPending && <Spinner size="sm" className="mr-2" />}Create Exam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
