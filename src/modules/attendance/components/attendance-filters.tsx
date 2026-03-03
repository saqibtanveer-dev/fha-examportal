'use client';

import { useMemo } from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AttendanceStatus } from '@prisma/client';
import { X } from 'lucide-react';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_CONFIG } from '../attendance.constants';
import type { AttendanceFilters } from '../attendance.types';

type ClassOption = { id: string; name: string };
type SectionOption = { id: string; name: string };
type SubjectOption = { id: string; name: string; code: string };

type Props = {
  filters: AttendanceFilters;
  onFiltersChange: (filters: AttendanceFilters) => void;
  classes: ClassOption[];
  sections: SectionOption[];
  subjects?: SubjectOption[];
  showSubjectFilter?: boolean;
  showDateRange?: boolean;
  showStatusFilter?: boolean;
};

export function AttendanceFiltersBar({
  filters,
  onFiltersChange,
  classes,
  sections,
  subjects = [],
  showSubjectFilter = false,
  showDateRange = true,
  showStatusFilter = false,
}: Props) {
  const hasActiveFilters = useMemo(
    () =>
      !!(filters.classId || filters.sectionId || filters.subjectId || filters.startDate || filters.endDate || filters.status),
    [filters],
  );

  function update(patch: Partial<AttendanceFilters>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function clearAll() {
    onFiltersChange({});
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Class */}
      <div className="space-y-1.5">
        <Label className="text-xs">Class</Label>
        <Select
          value={filters.classId ?? ''}
          onValueChange={(v) => update({ classId: v || undefined, sectionId: undefined })}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Section */}
      <div className="space-y-1.5">
        <Label className="text-xs">Section</Label>
        <Select
          value={filters.sectionId ?? ''}
          onValueChange={(v) => update({ sectionId: v || undefined })}
          disabled={!filters.classId}
        >
          <SelectTrigger className="h-9 w-32">
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject (optional) */}
      {showSubjectFilter && (
        <div className="space-y-1.5">
          <Label className="text-xs">Subject</Label>
          <Select
            value={filters.subjectId ?? ''}
            onValueChange={(v) => update({ subjectId: v || undefined })}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date Range */}
      {showDateRange && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(e) => update({ startDate: e.target.value || undefined })}
              className="h-9 w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(e) => update({ endDate: e.target.value || undefined })}
              className="h-9 w-36"
            />
          </div>
        </>
      )}

      {/* Status Filter */}
      {showStatusFilter && (
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.status ?? ''}
            onValueChange={(v) => update({ status: (v as AttendanceStatus) || undefined })}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {ATTENDANCE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  <span className="flex items-center gap-1.5">
                    <span>{ATTENDANCE_STATUS_CONFIG[status].icon}</span>
                    <span>{ATTENDANCE_STATUS_CONFIG[status].label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Clear button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-9">
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
