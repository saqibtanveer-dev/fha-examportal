'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

type McqOption = {
  label: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
  imageUrl?: string;
};

type Props = {
  options: McqOption[];
  onChange: (options: McqOption[]) => void;
};

const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

export function McqOptionsEditor({ options, onChange }: Props) {
  function updateOption(index: number, field: keyof McqOption, value: unknown) {
    const updated = [...options];
    (updated[index] as Record<string, unknown>)[field] = value;

    // If setting this as correct, uncheck others (single correct)
    if (field === 'isCorrect' && value === true) {
      updated.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }

    onChange(updated);
  }

  function addOption() {
    if (options.length >= 6) return;
    onChange([
      ...options,
      {
        label: labels[options.length] ?? `${options.length + 1}`,
        text: '',
        isCorrect: false,
        sortOrder: options.length,
      },
    ]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    // Re-label
    updated.forEach((opt, i) => {
      opt.label = labels[i] ?? `${i + 1}`;
      opt.sortOrder = i;
    });
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <Label>MCQ Options</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
            {opt.label}
          </div>
          <Input
            value={opt.text}
            onChange={(e) => updateOption(i, 'text', e.target.value)}
            placeholder={`Option ${opt.label}`}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Checkbox
              checked={opt.isCorrect}
              onCheckedChange={(v) => updateOption(i, 'isCorrect', v)}
            />
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeOption(i)}
            disabled={options.length <= 2}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {options.length < 6 && (
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="mr-1 h-4 w-4" />Add Option
        </Button>
      )}
    </div>
  );
}
