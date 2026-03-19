'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateEmailFromName, getEmailSuffix } from '@/lib/email-utils';
import { RotateCcw, Wand2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { createUserAction } from '@/modules/users/user-actions';
import { toast } from 'sonner';
import { StudentFormFields, TeacherFormFields, FamilyFormFields } from './user-role-form-fields';

type ClassInfo = {
  id: string;
  name: string;
  grade: number;
  sections: { id: string; name: string }[];
};

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes?: ClassInfo[];
};

export function CreateUserDialog({ open, onOpenChange, classes = [] }: CreateUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<string>('STUDENT');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailManuallyEdited, setEmailManuallyEdited] = useState(false);
  const invalidate = useInvalidateCache();

  const autoEmail = useCallback(
    (fn: string, ln: string, r: string) => generateEmailFromName(fn, ln, r),
    [],
  );

  // Auto-fill email when name changes and not manually edited
  useEffect(() => {
    if (!emailManuallyEdited) {
      setEmail(autoEmail(firstName, lastName, role));
    }
  }, [firstName, lastName, role, emailManuallyEdited, autoEmail]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSectionId('');
  }, [selectedClassId]);

  // Reset role-specific fields and re-apply auto email when role changes
  useEffect(() => {
    setSelectedClassId('');
    setSelectedSectionId('');
    setGender('');
    if (!emailManuallyEdited) {
      setEmail(autoEmail(firstName, lastName, role));
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetToAutoEmail() {
    setEmailManuallyEdited(false);
    setEmail(autoEmail(firstName, lastName, role));
  }

  // Reset all state when dialog closes
  useEffect(() => {
    if (!open) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setEmailManuallyEdited(false);
      setRole('STUDENT');
      setSelectedClassId('');
      setSelectedSectionId('');
      setGender('');
    }
  }, [open]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUserAction({
        email,
        password: formData.get('password') as string,
        firstName,
        lastName,
        role: role as 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'FAMILY',
        phone: (formData.get('phone') as string) || undefined,
        // Student fields
        ...(role === 'STUDENT'
          ? {
              classId: selectedClassId || undefined,
              sectionId: selectedSectionId || undefined,
              rollNumber: (formData.get('rollNumber') as string) || undefined,
              registrationNo: (formData.get('registrationNo') as string) || undefined,
              guardianName: (formData.get('guardianName') as string) || undefined,
              guardianPhone: (formData.get('guardianPhone') as string) || undefined,
              dateOfBirth: (formData.get('dateOfBirth') as string) || undefined,
              gender: (gender as 'MALE' | 'FEMALE' | 'OTHER') || undefined,
            }
          : {}),
        // Teacher fields
        ...(role === 'TEACHER'
          ? {
              employeeId: (formData.get('employeeId') as string) || undefined,
              qualification: (formData.get('qualification') as string) || undefined,
              specialization: (formData.get('specialization') as string) || undefined,
            }
          : {}),
        // Family fields
        ...(role === 'FAMILY'
          ? {
              relationship: (formData.get('relationship') as string) || undefined,
              occupation: (formData.get('occupation') as string) || undefined,
              address: (formData.get('address') as string) || undefined,
              emergencyPhone: (formData.get('emergencyPhone') as string) || undefined,
            }
          : {}),
      });

      if (result.success) {
        toast.success('User created successfully');
        onOpenChange(false);
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed to create user');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
              <Input
                id="firstName"
                name="firstName"
                required
                disabled={isPending}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
              <Input
                id="lastName"
                name="lastName"
                required
                disabled={isPending}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Raza"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-1.5">
                {!emailManuallyEdited && email && (
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
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              value={email}
              placeholder={`e.g. ali.raza${getEmailSuffix(role)}`}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailManuallyEdited(true);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isPending}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="PRINCIPAL">Principal</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="FAMILY">Family / Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" disabled={isPending} />
          </div>

          {/* ── Student Profile Fields ── */}
          {role === 'STUDENT' && (
            <StudentFormFields
              classes={classes}
              selectedClassId={selectedClassId}
              onClassChange={setSelectedClassId}
              selectedSectionId={selectedSectionId}
              onSectionChange={setSelectedSectionId}
              gender={gender}
              onGenderChange={setGender}
              disabled={isPending}
            />
          )}

          {/* ── Family Profile Fields ── */}
          {role === 'FAMILY' && <FamilyFormFields disabled={isPending} />}

          {/* ── Teacher Profile Fields ── */}
          {role === 'TEACHER' && <TeacherFormFields disabled={isPending} />}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
