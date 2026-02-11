'use client';

import { useState, useTransition } from 'react';
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

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<string>('STUDENT');
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUserAction({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        role: role as 'ADMIN' | 'TEACHER' | 'STUDENT',
        phone: (formData.get('phone') as string) || undefined,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" disabled={isPending} />
          </div>
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
