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
import { Spinner } from '@/components/shared';
import { createCampaignAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { CampaignFormFields, type CampaignFormValues } from './campaign-form-fields';

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
  const form = useForm<CampaignFormValues>({
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
          <CampaignFormFields
            form={form}
            classes={classes}
            academicSessions={academicSessions}
            generateSlug={generateSlug}
          />

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
