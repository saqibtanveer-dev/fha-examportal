'use client';

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
import { Clock } from 'lucide-react';
import { QuestionPicker } from './question-picker';
import type { Subject, ClassItem, AcademicSessionItem } from './create-exam-types';
import { useCreateExamForm } from './use-create-exam-form';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  classes: ClassItem[];
  academicSessions?: AcademicSessionItem[];
};

export function CreateExamDialog({ open, onOpenChange, subjects, classes, academicSessions = [] }: Props) {
  const form = useCreateExamForm(academicSessions, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) form.resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exam</DialogTitle>
          <DialogDescription>Build a new exam from your question bank.</DialogDescription>
        </DialogHeader>
        <form action={form.handleSubmit} className="space-y-4">
          {/* Delivery Mode Toggle */}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Label className="text-sm font-medium">Delivery Mode:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.deliveryMode === 'ONLINE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => form.setDeliveryMode('ONLINE')}
                disabled={form.isPending}
              >
                Online
              </Button>
              <Button
                type="button"
                variant={form.deliveryMode === 'WRITTEN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => form.setDeliveryMode('WRITTEN')}
                disabled={form.isPending}
              >
                Written (Paper)
              </Button>
            </div>
          </div>
          {form.deliveryMode === 'WRITTEN' && (
            <p className="text-xs text-muted-foreground">
              Written exams are conducted on paper. You&apos;ll enter marks per question per student on the portal after checking papers.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required disabled={form.isPending} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={form.setType}>
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
              <Select value={form.subjectId} onValueChange={form.handleSubjectChange}>
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
                {form.suggestedDuration > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                        onClick={() => form.setDuration(String(form.suggestedDuration))}
                      >
                        <Clock className="h-3 w-3" />
                        Suggested: {form.suggestedDuration}m
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Click to auto-set duration based on selected questions</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <Input id="duration" name="duration" type="number" min={5} max={300} required disabled={form.isPending} value={form.duration} onChange={(e) => form.setDuration(e.target.value)} />
            </div>
          </div>
          {academicSessions.length > 0 && (
            <div className="space-y-2">
              <Label>Academic Session</Label>
              <Select value={form.academicSessionId} onValueChange={form.setAcademicSessionId}>
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
            <Input id="passingMarks" name="passingMarks" type="number" min={0} step="0.5" required disabled={form.isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} disabled={form.isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" name="instructions" rows={2} disabled={form.isPending} />
          </div>

          <QuestionPicker
            questions={form.questions}
            isLoading={form.isLoadingQuestions}
            hasSubject={!!form.subjectId}
            selectedIds={form.selectedQuestions}
            onToggle={form.toggleQuestion}
            totalMarks={form.totalMarks}
            suggestedDuration={form.suggestedDuration}
          />

          {/* Class Assignment */}
          <div className="space-y-2">
            <Label>Assign to Sections ({form.selectedSections.length} selected)</Label>
            <div className="space-y-1">
              {classes.map((c) => (
                <div key={c.id} className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium w-16">{c.name}:</span>
                  {c.sections.map((s) => {
                    const isChecked = form.selectedSections.some((x) => x.classId === c.id && x.sectionId === s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-1 cursor-pointer">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) form.setSelectedSections((p) => [...p, { classId: c.id, sectionId: s.id }]);
                            else form.setSelectedSections((p) => p.filter((x) => !(x.classId === c.id && x.sectionId === s.id)));
                          }}
                        />
                        <span className="text-sm">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {form.selectedQuestions.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2 text-sm">
              <span>{form.selectedQuestions.length} questions</span>
              <span className="font-medium">{form.totalMarks} marks</span>
              {form.duration && <span className="text-muted-foreground">{form.duration} min</span>}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { form.resetForm(); onOpenChange(false); }}>Cancel</Button>
            <Button type="submit" disabled={form.isPending || !form.subjectId || form.selectedQuestions.length === 0 || form.selectedSections.length === 0}>
              {form.isPending && <Spinner size="sm" className="mr-2" />}Create Exam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
