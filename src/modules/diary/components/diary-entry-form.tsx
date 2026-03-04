'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Save } from 'lucide-react';
import { getTodayDateString } from '../diary.utils';
import { DIARY_CONTENT_MAX_LENGTH, DIARY_TITLE_MAX_LENGTH } from '../diary.constants';
import type { TeacherSubjectClass } from '../diary.types';

type FormData = {
  classId: string;
  sectionId: string;
  subjectId: string;
  date: string;
  title: string;
  content: string;
};

type Props = {
  assignments: TeacherSubjectClass[];
  onSubmit: (data: FormData, status: 'DRAFT' | 'PUBLISHED') => void;
  isSubmitting?: boolean;
  initialData?: Partial<FormData>;
  submitLabel?: string;
};

export function DiaryEntryForm({
  assignments,
  onSubmit,
  isSubmitting = false,
  initialData,
  submitLabel = 'Publish',
}: Props) {
  const [subjectId, setSubjectId] = useState(initialData?.subjectId ?? '');
  const [classId, setClassId] = useState(initialData?.classId ?? '');
  const [sectionId, setSectionId] = useState(initialData?.sectionId ?? '');
  const [date, setDate] = useState(initialData?.date ?? getTodayDateString());
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');

  // Cascading selectors: subject → class → section
  const subjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();
    for (const a of assignments) {
      if (!map.has(a.subjectId)) {
        map.set(a.subjectId, { id: a.subjectId, name: a.subjectName, code: a.subjectCode });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  const availableClasses = useMemo(() => {
    if (!subjectId) return [];
    const map = new Map<string, { id: string; name: string }>();
    for (const a of assignments) {
      if (a.subjectId === subjectId && !map.has(a.classId)) {
        map.set(a.classId, { id: a.classId, name: a.className });
      }
    }
    return Array.from(map.values());
  }, [assignments, subjectId]);

  const availableSections = useMemo(() => {
    if (!subjectId || !classId) return [];
    const match = assignments.find((a) => a.subjectId === subjectId && a.classId === classId);
    return match?.sections ?? [];
  }, [assignments, subjectId, classId]);

  function handleSubjectChange(value: string) {
    setSubjectId(value);
    setClassId('');
    setSectionId('');
  }

  function handleClassChange(value: string) {
    setClassId(value);
    setSectionId('');
  }

  const isValid = subjectId && classId && sectionId && date && title.trim().length >= 3 && content.trim().length >= 1;

  function handleSubmit(status: 'DRAFT' | 'PUBLISHED') {
    if (!isValid) return;
    onSubmit({ classId, sectionId, subjectId, date, title: title.trim(), content: content.trim() }, status);
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">
          {initialData ? 'Edit Diary Entry' : 'Create Diary Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject / Class / Section selectors */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Select value={subjectId} onValueChange={handleSubjectChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Class</Label>
            <Select value={classId} onValueChange={handleClassChange} disabled={!subjectId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Section</Label>
            <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {availableSections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getTodayDateString()}
            className="h-9 w-full sm:w-44"
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-xs">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chapter 5: Quadratic Equations"
            maxLength={DIARY_TITLE_MAX_LENGTH}
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">{title.length}/{DIARY_TITLE_MAX_LENGTH}</p>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label className="text-xs">Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the diary content here..."
            maxLength={DIARY_CONTENT_MAX_LENGTH}
            rows={8}
            className="resize-y min-h-30"
          />
          <p className="text-xs text-muted-foreground">{content.length}/{DIARY_CONTENT_MAX_LENGTH}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={!isValid || isSubmitting}
          >
            <Send className="mr-1.5 h-4 w-4" />
            {submitLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={!isValid || isSubmitting}
          >
            <Save className="mr-1.5 h-4 w-4" />
            Save as Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
