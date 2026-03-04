'use client';

import { useMemo } from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { DiaryFilters } from '../diary.types';

type Option = { id: string; name: string };

type Props = {
  filters: DiaryFilters;
  onFiltersChange: (filters: DiaryFilters) => void;
  classes?: Option[];
  sections?: Option[];
  subjects?: Option[];
  showSubjectFilter?: boolean;
  showDateRange?: boolean;
  showStatusFilter?: boolean;
  showTeacherFilter?: boolean;
  teachers?: (Option & { employeeId: string })[];
};

export function DiaryFiltersBar({
  filters,
  onFiltersChange,
  classes = [],
  sections = [],
  subjects = [],
  showSubjectFilter = true,
  showDateRange = true,
  showStatusFilter = false,
  showTeacherFilter = false,
  teachers = [],
}: Props) {
  const hasActive = useMemo(
    () =>
      !!(
        filters.classId ||
        filters.sectionId ||
        filters.subjectId ||
        filters.startDate ||
        filters.endDate ||
        filters.status ||
        filters.teacherProfileId
      ),
    [filters],
  );

  function update(patch: Partial<DiaryFilters>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function clearAll() {
    onFiltersChange({});
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {classes.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Class</Label>
          <Select
            value={filters.classId ?? ''}
            onValueChange={(v) => update({ classId: v || undefined, sectionId: undefined })}
          >
            <SelectTrigger className="h-9 w-32 sm:w-36">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Section</Label>
          <Select
            value={filters.sectionId ?? ''}
            onValueChange={(v) => update({ sectionId: v || undefined })}
            disabled={!filters.classId}
          >
            <SelectTrigger className="h-9 w-28 sm:w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showSubjectFilter && subjects.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Subject</Label>
          <Select
            value={filters.subjectId ?? ''}
            onValueChange={(v) => update({ subjectId: v || undefined })}
          >
            <SelectTrigger className="h-9 w-32 sm:w-40">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showTeacherFilter && teachers.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Teacher</Label>
          <Select
            value={filters.teacherProfileId ?? ''}
            onValueChange={(v) => update({ teacherProfileId: v || undefined })}
          >
            <SelectTrigger className="h-9 w-36 sm:w-44">
              <SelectValue placeholder="All teachers" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showDateRange && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) => update({ startDate: e.target.value || undefined })}
              className="h-9 w-32 sm:w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) => update({ endDate: e.target.value || undefined })}
              className="h-9 w-32 sm:w-36"
            />
          </div>
        </>
      )}

      {showStatusFilter && (
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.status ?? ''}
            onValueChange={(v) => update({ status: (v as DiaryFilters['status']) || undefined })}
          >
            <SelectTrigger className="h-9 w-28 sm:w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-9">
          <X className="mr-1 h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  );
}
