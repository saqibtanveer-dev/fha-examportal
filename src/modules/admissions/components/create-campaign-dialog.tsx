'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/shared';
import { createCampaignAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: { id: string; name: string }[];
  academicSessions: { id: string; name: string }[];
};

export function CreateCampaignDialog({ open, onOpenChange, classes, academicSessions }: Props) {
  const router = useRouter();
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'ADMISSION' as 'ADMISSION' | 'SCHOLARSHIP' | 'ADMISSION_SCHOLARSHIP',
      targetClassId: '',
      academicSessionId: '',
      testDuration: 60,
      totalMarks: 100,
      passingMarks: 40,
      maxSeats: '',
      negativeMarking: false,
      negativeMarkValue: '0.25',
      shuffleQuestions: true,
      shuffleOptions: false,
      allowCalculator: false,
      showRankToApplicant: false,
      showScoreToApplicant: true,
      showCutoffToApplicant: false,
      hasScholarship: false,
      registrationStartAt: '',
      registrationEndAt: '',
      testStartAt: '',
      testEndAt: '',
    },
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  function handleSubmit() {
    const values = form.getValues();
    startTransition(async () => {
      const result = await createCampaignAction({
        name: values.name,
        slug: values.slug || generateSlug(values.name),
        description: values.description || undefined,
        type: values.type,
        targetClassId: values.targetClassId || undefined,
        academicSessionId: values.academicSessionId || undefined,
        testDuration: values.testDuration,
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
        maxSeats: values.maxSeats ? parseInt(values.maxSeats) : undefined,
        negativeMarking: values.negativeMarking,
        negativeMarkValue: values.negativeMarking ? parseFloat(values.negativeMarkValue) : undefined,
        shuffleQuestions: values.shuffleQuestions,
        shuffleOptions: values.shuffleOptions,
        allowCalculator: values.allowCalculator,
        showRankToApplicant: values.showRankToApplicant,
        showScoreToApplicant: values.showScoreToApplicant,
        showCutoffToApplicant: values.showCutoffToApplicant,
        hasScholarship: values.hasScholarship,
        registrationStartAt: values.registrationStartAt || undefined,
        registrationEndAt: values.registrationEndAt || undefined,
        testStartAt: values.testStartAt || undefined,
        testEndAt: values.testEndAt || undefined,
      });

      if (result.success) {
        toast.success('Campaign created');
        invalidate.campaigns();
        onOpenChange(false);
        form.reset();
        if (result.data?.id) {
          router.push(ROUTES.ADMIN_ADMISSIONS.CAMPAIGN_DETAIL(result.data.id));
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  const watchType = form.watch('type');
  const watchNeg = form.watch('negativeMarking');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Set up a new admission or scholarship test campaign
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="space-y-4"
        >
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
              <Input
                id="slug"
                {...form.register('slug')}
                placeholder="admission-test-2026"
              />
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
                onValueChange={(v) => form.setValue('type', v as 'ADMISSION' | 'SCHOLARSHIP' | 'ADMISSION_SCHOLARSHIP')}
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
              <Input
                id="testStartAt"
                type="datetime-local"
                {...form.register('testStartAt')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testEndAt">Test End</Label>
              <Input
                id="testEndAt"
                type="datetime-local"
                {...form.register('testEndAt')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
