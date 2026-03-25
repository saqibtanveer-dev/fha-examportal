'use client';

import { useEffect, useState, useTransition } from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/shared';
import { updateUserAction } from '@/modules/users/update-user-action';
import { toast } from 'sonner';
import type { UserWithProfile } from '@/modules/users/user-queries';
import { FamilyFormFields, StudentFormFields, TeacherFormFields } from './user-role-form-fields';

type ClassInfo = {
  id: string;
  name: string;
  grade: number;
  sections: { id: string; name: string }[];
};

function formatDateForInput(value?: Date | null): string {
  if (!value) return '';
  return value.toISOString().slice(0, 10);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile;
  classes?: ClassInfo[];
};

export function EditUserDialog({ open, onOpenChange, user, classes = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(user.email);
  const [selectedClassId, setSelectedClassId] = useState(user.studentProfile?.classId ?? '');
  const [selectedSectionId, setSelectedSectionId] = useState(user.studentProfile?.sectionId ?? '');
  const [gender, setGender] = useState(user.studentProfile?.gender ?? '');
  const invalidate = useInvalidateCache();

  useEffect(() => {
    if (!open) return;
    setEmail(user.email);
    setSelectedClassId(user.studentProfile?.classId ?? '');
    setSelectedSectionId(user.studentProfile?.sectionId ?? '');
    setGender(user.studentProfile?.gender ?? '');
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    if (!selectedClassId) {
      setSelectedSectionId('');
      return;
    }

    const selectedClass = classes.find((cls) => cls.id === selectedClassId);
    if (!selectedClass) {
      setSelectedClassId('');
      setSelectedSectionId('');
      return;
    }

    const hasSection = selectedClass?.sections.some((section) => section.id === selectedSectionId);
    if (!hasSection) {
      setSelectedSectionId('');
    }
  }, [selectedClassId, selectedSectionId, classes, open]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const payload = {
        email,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phone: (formData.get('phone') as string) ?? '',
        ...(user.role === 'STUDENT'
          ? {
              classId: selectedClassId || undefined,
              sectionId: selectedSectionId || undefined,
              rollNumber: formData.get('rollNumber') as string,
              registrationNo: formData.get('registrationNo') as string,
              guardianName: (formData.get('guardianName') as string) ?? '',
              guardianPhone: (formData.get('guardianPhone') as string) ?? '',
              dateOfBirth: (formData.get('dateOfBirth') as string) ?? '',
              gender: (gender as 'MALE' | 'FEMALE' | 'OTHER') || undefined,
            }
          : {}),
        ...(user.role === 'TEACHER'
          ? {
              employeeId: formData.get('employeeId') as string,
              qualification: (formData.get('qualification') as string) ?? '',
              specialization: (formData.get('specialization') as string) ?? '',
            }
          : {}),
        ...(user.role === 'FAMILY'
          ? {
              relationship: formData.get('relationship') as string,
              occupation: (formData.get('occupation') as string) ?? '',
              address: (formData.get('address') as string) ?? '',
              emergencyPhone: (formData.get('emergencyPhone') as string) ?? '',
            }
          : {}),
      };

      const result = await updateUserAction(user.id, payload);

      if (result.success) {
        toast.success('User updated successfully');
        onOpenChange(false);
        await invalidate.users();
      } else {
        toast.error(result.error ?? 'Failed to update user');
      }
    });
  }

  const roleLabel =
    user.role === 'FAMILY' ? 'Family / Parent' : user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update account and profile information for {user.firstName} {user.lastName}.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            Role: <span className="font-medium text-foreground">{roleLabel}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">First Name</Label>
              <Input
                id="editFirstName"
                name="firstName"
                defaultValue={user.firstName}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">Last Name</Label>
              <Input
                id="editLastName"
                name="lastName"
                defaultValue={user.lastName}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEmail">Email</Label>
            <Input
              id="editEmail"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Login email can be updated. If this email already exists, you will see a clear error.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPhone">Phone (optional)</Label>
            <Input
              id="editPhone"
              name="phone"
              defaultValue={user.phone ?? ''}
              disabled={isPending}
            />
          </div>

          {user.role === 'STUDENT' && (
            <StudentFormFields
              classes={classes}
              selectedClassId={selectedClassId}
              onClassChange={setSelectedClassId}
              selectedSectionId={selectedSectionId}
              onSectionChange={setSelectedSectionId}
              gender={gender}
              onGenderChange={setGender}
              disabled={isPending}
              defaults={{
                rollNumber: user.studentProfile?.rollNumber ?? '',
                registrationNo: user.studentProfile?.registrationNo ?? '',
                guardianName: user.studentProfile?.guardianName ?? '',
                guardianPhone: user.studentProfile?.guardianPhone ?? '',
                dateOfBirth: formatDateForInput(user.studentProfile?.dateOfBirth),
              }}
            />
          )}

          {user.role === 'TEACHER' && (
            <TeacherFormFields
              disabled={isPending}
              defaults={{
                employeeId: user.teacherProfile?.employeeId ?? '',
                qualification: user.teacherProfile?.qualification ?? '',
                specialization: user.teacherProfile?.specialization ?? '',
              }}
            />
          )}

          {user.role === 'FAMILY' && (
            <FamilyFormFields
              disabled={isPending}
              defaults={{
                relationship: user.familyProfile?.relationship ?? '',
                occupation: user.familyProfile?.occupation ?? '',
                address: user.familyProfile?.address ?? '',
                emergencyPhone: user.familyProfile?.emergencyPhone ?? '',
              }}
            />
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner size="sm" className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
