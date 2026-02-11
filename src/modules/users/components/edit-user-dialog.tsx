'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile;
};

export function EditUserDialog({ open, onOpenChange, user }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateUserAction(user.id, {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phone: (formData.get('phone') as string) || undefined,
      });
      if (result.success) {
        toast.success('User updated successfully');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update user');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update {user.firstName} {user.lastName}&apos;s information.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
            <Input id="editEmail" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
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
