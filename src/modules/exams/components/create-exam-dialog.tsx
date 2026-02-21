'use client';

import { useState, useMemo, useTransition } from 'react';
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
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { Clock, Award, HelpCircle } from 'lucide-react';

type Subject = { id: string; name: string; code: string };
type ClassItem = { id: string; name: string; sections: { id: string; name: string }[] };
type QuestionItem = { id: string; title: string; marks: number; type: string; subjectId: string; estimatedTime?: number };
type AcademicSessionItem = { id: string; name: string; isCurrent: boolean };

/** Estimated time per question type (in minutes) */
const QUESTION_TIME_ESTIMATES: Record<string, number> = {
  MCQ: 1,
  TRUE_FALSE: 0.5,
  SHORT_ANSWER: 3,
  LONG_ANSWER: 8,
  FILL_IN_BLANK: 1.5,
  MATCHING: 2,
};

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
  const [duration, setDuration] = useState('');
  const [academicSessionId, setAcademicSessionId] = useState(() => {
    const current = academicSessions.find((s) => s.isCurrent);
    return current?.id ?? '';
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const router = useRouter();

  // Fix: Actually filter questions by selected subject
  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    if (subjectId) {
      filtered = filtered.filter((q) => q.subjectId === subjectId);
    }
    if (questionSearch.trim()) {
      const search = questionSearch.toLowerCase();
      filtered = filtered.filter((q) => q.title.toLowerCase().includes(search));
    }
    return filtered;
  }, [questions, subjectId, questionSearch]);

  // Calculate total marks from selected questions
  const totalMarks = useMemo(() => {
    return selectedQuestions.reduce((sum, qId) => {
      const q = questions.find((x) => x.id === qId);
      return sum + (q?.marks ?? 0);
    }, 0);
  }, [selectedQuestions, questions]);

  // Auto-calculate suggested duration based on selected questions
  const suggestedDuration = useMemo(() => {
    if (selectedQuestions.length === 0) return 0;
    const totalMinutes = selectedQuestions.reduce((sum, qId) => {
      const q = questions.find((x) => x.id === qId);
      if (!q) return sum;
      return sum + (q.estimatedTime ?? QUESTION_TIME_ESTIMATES[q.type] ?? 2);
    }, 0);
    // Add 10% buffer and round up to nearest 5 minutes
    const buffered = totalMinutes * 1.1;
    return Math.max(5, Math.ceil(buffered / 5) * 5);
  }, [selectedQuestions, questions]);

  function toggleQuestion(id: string) {
    setSelectedQuestions((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // Auto-set duration when questions change (only if user hasn't manually set one)
      if (!duration || duration === String(suggestedDuration)) {
        const newTotal = next.reduce((sum, qId) => {
          const q = questions.find((x) => x.id === qId);
          if (!q) return sum;
          return sum + (q.estimatedTime ?? QUESTION_TIME_ESTIMATES[q.type] ?? 2);
        }, 0);
        const buffered = newTotal * 1.1;
        const suggested = Math.max(5, Math.ceil(buffered / 5) * 5);
        if (next.length > 0) setDuration(String(suggested));
      }
      return next;
    });
  }

  // Clear selection when subject changes
  function handleSubjectChange(newSubjectId: string) {
    setSubjectId(newSubjectId);
    // Remove questions that don't belong to the new subject
    if (newSubjectId) {
      setSelectedQuestions((prev) =>
        prev.filter((qId) => {
          const q = questions.find((x) => x.id === qId);
          return q?.subjectId === newSubjectId;
        }),
      );
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createExamAction({
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        subjectId,
        academicSessionId: academicSessionId || undefined,
        type: type as 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICE' | 'CUSTOM',
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
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }

  function resetForm() {
    setSubjectId('');
    setType('QUIZ');
    setDuration('');
    setSelectedQuestions([]);
    setSelectedClasses([]);
    setQuestionSearch('');
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
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
              <Input
                id="duration"
                name="duration"
                type="number"
                min={5}
                max={300}
                required
                disabled={isPending}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
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

          {/* Question Selection - Enhanced with marks display, subject filter, search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Questions ({selectedQuestions.length} selected)</Label>
              {selectedQuestions.length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Award className="h-3.5 w-3.5" />
                    Total: {totalMarks} marks
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    ~{suggestedDuration} min
                  </span>
                </div>
              )}
            </div>
            <Input
              placeholder="Search questions..."
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="max-h-48 overflow-y-auto rounded border p-2 space-y-1">
              {filteredQuestions.map((q) => (
                <label
                  key={q.id}
                  className="flex items-start gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5 group"
                >
                  <Checkbox
                    checked={selectedQuestions.includes(q.id)}
                    onCheckedChange={() => toggleQuestion(q.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm flex-1 min-w-0 line-clamp-2 break-words">{q.title}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="whitespace-pre-wrap break-words">{q.title}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {q.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold">
                      {q.marks}m
                    </Badge>
                  </div>
                </label>
              ))}
              {filteredQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">
                  {subjectId ? 'No questions for this subject' : 'No questions available'}
                </p>
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

          {/* Summary bar */}
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
