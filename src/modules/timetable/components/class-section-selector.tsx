'use client';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { RefClass } from '@/stores';

type Props = {
  classes: RefClass[];
  selectedClassId: string;
  selectedSectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
  disabled?: boolean;
};

export function ClassSectionSelector({
  classes,
  selectedClassId,
  selectedSectionId,
  onClassChange,
  onSectionChange,
  disabled,
}: Props) {
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const sections = selectedClass?.sections ?? [];

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs">Class</Label>
        <Select
          value={selectedClassId}
          onValueChange={(v) => {
            onClassChange(v);
            onSectionChange('');
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Section</Label>
        <Select
          value={selectedSectionId || sections[0]?.id || ''}
          onValueChange={onSectionChange}
          disabled={disabled || !sections.length}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
