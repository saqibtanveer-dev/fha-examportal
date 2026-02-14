'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { createUserAction } from '@/modules/users/user-actions';
import { toast } from 'sonner';

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
  const router = useRouter();

  // Get sections for the selected class
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const availableSections = selectedClass?.sections ?? [];

  // Reset section when class changes
  useEffect(() => {
    setSelectedSectionId('');
  }, [selectedClassId]);

  // Reset role-specific fields when role changes
  useEffect(() => {
    setSelectedClassId('');
    setSelectedSectionId('');
    setGender('');
  }, [role]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUserAction({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        role: role as 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT',
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
      });

      if (result.success) {
        toast.success('User created successfully');
        onOpenChange(false);
        router.refresh();
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
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required disabled={isPending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required disabled={isPending} />
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
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" disabled={isPending} />
          </div>

          {/* ── Student Profile Fields ── */}
          {role === 'STUDENT' && (
            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="text-sm font-semibold text-foreground">Student Profile</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Class <span className="text-destructive">*</span></Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} (Grade {c.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section <span className="text-destructive">*</span></Label>
                  <Select
                    value={selectedSectionId}
                    onValueChange={setSelectedSectionId}
                    disabled={isPending || !selectedClassId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedClassId ? 'Select section' : 'Select class first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number <span className="text-destructive">*</span></Label>
                  <Input id="rollNumber" name="rollNumber" required disabled={isPending} placeholder="e.g. 101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNo">Registration No <span className="text-destructive">*</span></Label>
                  <Input id="registrationNo" name="registrationNo" required disabled={isPending} placeholder="e.g. STU-2026-001" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input id="guardianName" name="guardianName" disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input id="guardianPhone" name="guardianPhone" disabled={isPending} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ── Teacher Profile Fields ── */}
          {role === 'TEACHER' && (
            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="text-sm font-semibold text-foreground">Teacher Profile</h4>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID <span className="text-destructive">*</span></Label>
                <Input id="employeeId" name="employeeId" required disabled={isPending} placeholder="e.g. EMP-001" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" name="qualification" disabled={isPending} placeholder="e.g. M.Sc Physics" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" name="specialization" disabled={isPending} placeholder="e.g. Quantum Mechanics" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
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
