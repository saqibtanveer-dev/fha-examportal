'use client';

import type { UseFormReturn } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';

type CampaignFormValues = {
  name: string;
  slug: string;
  description: string;
  type: 'ADMISSION' | 'SCHOLARSHIP' | 'ADMISSION_SCHOLARSHIP';
  targetClassId: string;
  academicSessionId: string;
  testDuration: number;
  totalMarks: number;
  passingMarks: number;
  maxSeats: string;
  negativeMarking: boolean;
  negativeMarkValue: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowCalculator: boolean;
  showRankToApplicant: boolean;
  showScoreToApplicant: boolean;
  showCutoffToApplicant: boolean;
  hasScholarship: boolean;
  registrationStartAt: string;
  registrationEndAt: string;
  testStartAt: string;
  testEndAt: string;
};

export type { CampaignFormValues };

type Props = {
  form: UseFormReturn<CampaignFormValues>;
  classes: { id: string; name: string }[];
  academicSessions: { id: string; name: string }[];
  generateSlug: (name: string) => string;
};

export function CampaignFormFields({ form, classes, academicSessions, generateSlug }: Props) {
  const watchNeg = form.watch('negativeMarking');

  return (
    <>
      {/* Name + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            {...form.register('name', { required: true })}
            onChange={(e) => {
              form.setValue('name', e.target.value);
              form.setValue('slug', generateSlug(e.target.value));
            }}
            placeholder="Admission Test 2026"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input id="slug" {...form.register('slug')} placeholder="admission-test-2026" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          rows={2}
          placeholder="Brief description of this campaign..."
        />
      </div>

      {/* Type, Class, Session */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Campaign Type *</Label>
          <Select
            value={form.watch('type')}
            onValueChange={(v) =>
              form.setValue('type', v as CampaignFormValues['type'])
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMISSION">Admission Test</SelectItem>
              <SelectItem value="SCHOLARSHIP">Scholarship Test</SelectItem>
              <SelectItem value="ADMISSION_SCHOLARSHIP">Admission + Scholarship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Class</Label>
          <Select
            value={form.watch('targetClassId')}
            onValueChange={(v) => form.setValue('targetClassId', v)}
          >
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Academic Session</Label>
          <Select
            value={form.watch('academicSessionId')}
            onValueChange={(v) => form.setValue('academicSessionId', v)}
          >
            <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
            <SelectContent>
              {academicSessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Marks & Duration */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="testDuration">Duration (min) *</Label>
          <Input
            id="testDuration"
            type="number"
            {...form.register('testDuration', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalMarks">Total Marks *</Label>
          <Input
            id="totalMarks"
            type="number"
            {...form.register('totalMarks', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passingMarks">Passing Marks *</Label>
          <Input
            id="passingMarks"
            type="number"
            {...form.register('passingMarks', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSeats">Max Seats</Label>
          <Input
            id="maxSeats"
            type="number"
            {...form.register('maxSeats')}
            placeholder="Unlimited"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="shuffleQuestions"
            checked={form.watch('shuffleQuestions')}
            onCheckedChange={(v) => form.setValue('shuffleQuestions', v)}
          />
          <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="negativeMarking"
            checked={form.watch('negativeMarking')}
            onCheckedChange={(v) => form.setValue('negativeMarking', v)}
          />
          <Label htmlFor="negativeMarking">Negative Marking</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="hasScholarship"
            checked={form.watch('hasScholarship')}
            onCheckedChange={(v) => form.setValue('hasScholarship', v)}
          />
          <Label htmlFor="hasScholarship">Scholarship</Label>
        </div>
      </div>

      {watchNeg && (
        <div className="space-y-2">
          <Label htmlFor="negativeMarkValue">Negative Marking Value (per wrong answer)</Label>
          <Input
            id="negativeMarkValue"
            type="number"
            step="0.01"
            {...form.register('negativeMarkValue')}
          />
        </div>
      )}

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="registrationStartAt">Registration Start</Label>
          <Input
            id="registrationStartAt"
            type="datetime-local"
            {...form.register('registrationStartAt')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationEndAt">Registration End</Label>
          <Input
            id="registrationEndAt"
            type="datetime-local"
            {...form.register('registrationEndAt')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testStartAt">Test Start</Label>
          <Input id="testStartAt" type="datetime-local" {...form.register('testStartAt')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testEndAt">Test End</Label>
          <Input id="testEndAt" type="datetime-local" {...form.register('testEndAt')} />
        </div>
      </div>
    </>
  );
}
