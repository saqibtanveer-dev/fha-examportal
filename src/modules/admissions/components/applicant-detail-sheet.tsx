'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import { ApplicantStatusBadge } from './campaign-status-badge';
import { updateCandidateAction, regenerateTestPinAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Copy, Check, RefreshCw, Pencil, KeyRound } from 'lucide-react';
import type { UpdateCandidateInput } from '../admission-schemas';
import { ApplicantQuestionAttempts } from './applicant-question-attempts';

type ApplicantDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  address?: string | null;
  previousSchool?: string | null;
  previousClass?: string | null;
  applicationNumber?: string;
  accessToken?: string;
  status: string;
  createdAt?: string;
  campaign?: { id: string };
  result?: {
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    rank: number | null;
    isPassed: boolean;
  } | null;
  testSession?: {
    status: string;
    tabSwitchCount: number;
    fullscreenExits: number;
    isFlagged: boolean;
    startedAt: string | null;
    submittedAt: string | null;
    timeSpent: number | null;
    applicantAnswers?: Array<{
      id: string;
      selectedOptionId?: string | null;
      answerText?: string | null;
      isMarkedForReview: boolean;
      answeredAt?: string | null;
      timeSpent?: number | null;
      campaignQuestion: {
        sectionLabel?: string | null;
        marks: number;
        question: {
          title: string;
          mcqOptions: Array<{
            id: string;
            label: string;
            text: string;
            isCorrect: boolean;
          }>;
        };
      };
      grade?: {
        marksAwarded: number;
        maxMarks: number;
        negativeMarks?: number;
      } | null;
    }>;
  } | null;
};

type Props = {
  applicant: ApplicantDetail | null;
  isLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApplicantDetailSheet({ applicant, isLoading = false, open, onOpenChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState(applicant?.accessToken ?? '');
  const [copied, setCopied] = useState(false);
  const invalidate = useInvalidateCache();

  useEffect(() => {
    if (applicant) { setPin(applicant.accessToken ?? ''); setIsEditing(false); }
  }, [applicant]);

  if (!applicant && !isLoading) return null;

  function handleCopyPin() {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success('PIN copied');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRegeneratePin() {
    startTransition(async () => {
      const result = await regenerateTestPinAction({ applicantId: applicant!.id });
      if (result.success && result.data) {
        const d = result.data as { testPin: string };
        setPin(d.testPin);
        toast.success('New PIN generated');
        if (applicant?.campaign?.id) {
          invalidate.afterDecision(applicant.campaign.id);
        } else {
          invalidate.applicants();
        }
      } else {
        toast.error(result.error ?? 'Failed to regenerate PIN');
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        {isLoading || !applicant ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading applicant details...</div>
        ) : (
          <>
        <SheetHeader>
          <SheetTitle>{applicant.firstName} {applicant.lastName}</SheetTitle>
          <SheetDescription>Application #{applicant.applicationNumber}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Status + PIN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ApplicantStatusBadge status={applicant.status} />
              {applicant.testSession?.isFlagged && <Badge variant="destructive">Flagged</Badge>}
            </div>
            <PinDisplay pin={pin} copied={copied} onCopy={handleCopyPin}
              onRegenerate={handleRegeneratePin} isPending={isPending} canRegenerate={['VERIFIED', 'TEST_IN_PROGRESS'].includes(applicant.status)} />
          </div>

          <Separator />

          {/* Test session info */}
          {applicant.testSession && (
            <>
              <SessionInfo session={applicant.testSession} />
              <Separator />
            </>
          )}

          {/* Result */}
          {applicant.result && (
            <>
              <ResultInfo result={applicant.result} />
              <Separator />
            </>
          )}

          {applicant.testSession?.applicantAnswers && applicant.testSession.applicantAnswers.length > 0 && (
            <>
              <ApplicantQuestionAttempts attempts={applicant.testSession.applicantAnswers} />
              <Separator />
            </>
          )}

          {/* Editable info */}
          {isEditing ? (
            <EditForm applicant={applicant} onDone={() => { setIsEditing(false); invalidate.afterDecision(applicant.id); }} />
          ) : (
            <InfoDisplay applicant={applicant} onEdit={() => setIsEditing(true)} />
          )}
        </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PinDisplay({ pin, copied, onCopy, onRegenerate, isPending, canRegenerate }: {
  pin: string; copied: boolean; onCopy: () => void; onRegenerate: () => void; isPending: boolean; canRegenerate: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
      <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="font-mono text-xl font-bold tracking-[0.2em]">{pin}</span>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCopy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      {canRegenerate && (
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRegenerate} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      )}
    </div>
  );
}

function SessionInfo({ session }: { session: NonNullable<ApplicantDetail['testSession']> }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Test Session</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <InfoItem label="Status" value={session.status} />
        <InfoItem label="Tab Switches" value={String(session.tabSwitchCount)} />
        <InfoItem label="Fullscreen Exits" value={String(session.fullscreenExits)} />
        {session.timeSpent !== null && (
          <InfoItem label="Time Spent" value={`${Math.floor(session.timeSpent / 60)}m ${session.timeSpent % 60}s`} />
        )}
      </div>
    </div>
  );
}

function ResultInfo({ result }: { result: NonNullable<ApplicantDetail['result']> }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Result</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <InfoItem label="Score" value={`${result.obtainedMarks}/${result.totalMarks}`} />
        <InfoItem label="Percentage" value={`${Number(result.percentage).toFixed(1)}%`} />
        <InfoItem label="Rank" value={result.rank ? `#${result.rank}` : '—'} />
        <InfoItem label="Passed" value={result.isPassed ? 'Yes' : 'No'} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function InfoDisplay({ applicant, onEdit }: { applicant: ApplicantDetail; onEdit: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Personal Info</h4>
        <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <InfoItem label="Email" value={applicant.email} />
        <InfoItem label="Phone" value={applicant.phone ?? '—'} />
        <InfoItem label="Gender" value={applicant.gender ?? '—'} />
        <InfoItem label="DOB" value={applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : '—'} />
        <InfoItem label="Guardian" value={applicant.guardianName ?? '—'} />
        <InfoItem label="Guardian Phone" value={applicant.guardianPhone ?? '—'} />
        <InfoItem label="Previous School" value={applicant.previousSchool ?? '—'} />
        <InfoItem label="Previous Class" value={applicant.previousClass ?? '—'} />
        {applicant.address && <div className="col-span-2"><InfoItem label="Address" value={applicant.address} /></div>}
      </div>
    </div>
  );
}

function EditForm({ applicant, onDone }: { applicant: ApplicantDetail; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  type FormData = Omit<UpdateCandidateInput, 'applicantId'>;
  const form = useForm<FormData>({
    defaultValues: {
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone ?? '',
      guardianName: applicant.guardianName ?? '',
      guardianPhone: applicant.guardianPhone ?? '',
      previousSchool: applicant.previousSchool ?? '',
      previousClass: applicant.previousClass ?? '',
    },
  });

  function handleSubmit(data: FormData) {
    startTransition(async () => {
      const result = await updateCandidateAction({ ...data, applicantId: applicant.id });
      if (result.success) { toast.success('Updated'); onDone(); }
      else toast.error(result.error ?? 'Failed');
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name"><Input {...form.register('firstName')} /></Field>
        <Field label="Last Name"><Input {...form.register('lastName')} /></Field>
      </div>
      <Field label="Email"><Input {...form.register('email')} type="email" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><Input {...form.register('phone')} /></Field>
        <Field label="Gender">
          <Select defaultValue={applicant.gender ?? undefined} onValueChange={(v) => form.setValue('gender', v as 'MALE' | 'FEMALE' | 'OTHER')}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Guardian"><Input {...form.register('guardianName')} /></Field>
        <Field label="Guardian Phone"><Input {...form.register('guardianPhone')} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prev School"><Input {...form.register('previousSchool')} /></Field>
        <Field label="Prev Class"><Input {...form.register('previousClass')} /></Field>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Spinner size="sm" className="mr-1" />}Save
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}
