'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared';
import { changePasswordAction } from '@/modules/users/password-actions';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function ChangePasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [showPasswords, setShowPasswords] = useState(false);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: formData.get('currentPassword') as string,
        newPassword: formData.get('newPassword') as string,
        confirmPassword: formData.get('confirmPassword') as string,
      });

      if (result.success) {
        toast.success('Password changed successfully');
        router.back();
      } else {
        toast.error(result.error ?? 'Failed to change password');
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Password"
        description="Update your account password"
        breadcrumbs={[{ label: 'Profile', href: '/profile' }, { label: 'Change Password' }]}
      />

      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Must include uppercase, lowercase, number, and special character.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                {showPasswords ? 'Hide' : 'Show'} passwords
              </Button>
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
