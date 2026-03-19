'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { generateEmailFromName, getEmailSuffix } from '@/lib/email-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/shared';
import { addCandidateAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { UserPlus, Copy, Check, Wand2, RotateCcw } from 'lucide-react';
import type { AddCandidateInput } from '../admission-schemas';
import { PAPER_VERSIONS } from '@/lib/constants';

type Props = {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCandidateDialog({ campaignId, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const [testPin, setTestPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const invalidate = useInvalidateCache();

  const form = useForm<Omit<AddCandidateInput, 'campaignId'>>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: undefined,
      guardianName: '',
      guardianPhone: '',
      previousSchool: '',
      previousClass: '',
      paperVersion: 'A',
    },
  });

  function handleSubmit(data: Omit<AddCandidateInput, 'campaignId'>) {
    startTransition(async () => {
      const result = await addCandidateAction({ ...data, campaignId });
      if (result.success && result.data) {
        const d = result.data as { applicationNumber: string; testPin: string };
        toast.success(`Candidate added: ${d.applicationNumber}`);
        setTestPin(d.testPin);
        invalidate.afterDecision(campaignId);
      } else {
        toast.error(result.error ?? 'Failed to add candidate');
      }
    });
  }

  function handleCopyPin() {
    if (!testPin) return;
    navigator.clipboard.writeText(testPin);
    setCopied(true);
    toast.success('Test PIN copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    form.reset();
    setTestPin(null);
    setCopied(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Candidate
          </DialogTitle>
          <DialogDescription>
            Add a candidate to this campaign. They will be auto-verified and ready for testing.
          </DialogDescription>
        </DialogHeader>

        {testPin ? (
          <PinSuccess
            testPin={testPin}
            copied={copied}
            onCopy={handleCopyPin}
            onAddAnother={() => { form.reset(); setTestPin(null); }}
            onClose={handleClose}
          />
        ) : (
          <CandidateForm
            form={form}
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---- Sub-components ----

function PinSuccess({
  testPin,
  copied,
  onCopy,
  onAddAnother,
  onClose,
}: {
  testPin: string;
  copied: boolean;
  onCopy: () => void;
  onAddAnother: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-green-50 p-4 dark:bg-green-950/20">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          Candidate added successfully!
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-3xl font-bold font-mono tracking-[0.3em]">{testPin}</span>
          <Button size="icon" variant="outline" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Share this PIN with the candidate. They enter it at <strong>/test</strong> to start.
        </p>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onAddAnother}>Add Another</Button>
        <Button onClick={onClose}>Done</Button>
      </DialogFooter>
    </div>
  );
}

function CandidateForm({
  form,
  isPending,
  onSubmit,
  onCancel,
}: {
  form: ReturnType<typeof useForm<Omit<AddCandidateInput, 'campaignId'>>>;
  isPending: boolean;
  onSubmit: (data: Omit<AddCandidateInput, 'campaignId'>) => void;
  onCancel: () => void;
}) {
  const [emailManuallyEdited, setEmailManuallyEdited] = useState(false);
  const firstNameValue = form.watch('firstName');
  const lastNameValue = form.watch('lastName');
  const emailValue = form.watch('email');
  useEffect(() => {
    if (emailManuallyEdited) return;
    const auto = generateEmailFromName(firstNameValue ?? '', lastNameValue ?? '', 'CANDIDATE');
    form.setValue('email', auto, { shouldValidate: false });
  }, [firstNameValue, lastNameValue, emailManuallyEdited, form]);

  function resetToAutoEmail() {
    setEmailManuallyEdited(false);
    const auto = generateEmailFromName(firstNameValue ?? '', lastNameValue ?? '', 'CANDIDATE');
    form.setValue('email', auto, { shouldValidate: false });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name *" error={form.formState.errors.firstName?.message}>
          <Input {...form.register('firstName', { required: 'Required' })} placeholder="First name" />
        </FormField>
        <FormField label="Last Name *" error={form.formState.errors.lastName?.message}>
          <Input {...form.register('lastName', { required: 'Required' })} placeholder="Last name" />
        </FormField>
      </div>

      <FormField
        label="Email *"
        error={form.formState.errors.email?.message}
        hint={
          <div className="flex items-center gap-1.5">
            {!emailManuallyEdited && emailValue && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                <Wand2 className="h-2.5 w-2.5" /> auto
              </span>
            )}
            {emailManuallyEdited && (
              <button
                type="button"
                onClick={resetToAutoEmail}
                className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                disabled={isPending}
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset to auto
              </button>
            )}
          </div>
        }
      >
        <Input
          {...form.register('email', { required: 'Required' })}
          type="email"
          placeholder={`e.g. ali.raza${getEmailSuffix('CANDIDATE')}`}
          onChange={(e) => {
            form.setValue('email', e.target.value);
            setEmailManuallyEdited(true);
          }}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Phone">
          <Input {...form.register('phone')} placeholder="Phone number" />
        </FormField>
        <FormField label="Gender">
          <Select onValueChange={(v) => form.setValue('gender', v as 'MALE' | 'FEMALE' | 'OTHER')}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Guardian Name">
          <Input {...form.register('guardianName')} placeholder="Parent/Guardian" />
        </FormField>
        <FormField label="Guardian Phone">
          <Input {...form.register('guardianPhone')} placeholder="Guardian phone" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Previous School">
          <Input {...form.register('previousSchool')} placeholder="Previous school" />
        </FormField>
        <FormField label="Previous Class">
          <Input {...form.register('previousClass')} placeholder="e.g. 8th" />
        </FormField>
      </div>

      <FormField label="Paper Version *">
        <Select
          value={form.watch('paperVersion') ?? 'A'}
          onValueChange={(v) => form.setValue('paperVersion', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {PAPER_VERSIONS.map((v) => (
              <SelectItem key={v} value={v}>
                Version {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner size="sm" className="mr-2" />}
          Add Candidate
        </Button>
      </DialogFooter>
    </form>
  );
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {hint}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
