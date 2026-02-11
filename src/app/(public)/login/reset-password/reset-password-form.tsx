'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordAction } from '@/modules/users/reset-password-actions';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10">
          <p className="text-sm text-destructive">
            Invalid or missing reset token. Please request a new reset link.
          </p>
          <Link href="/login/forgot-password">
            <Button variant="outline" className="mt-4">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await resetPasswordAction({ token, newPassword, confirmPassword });
      if (result.success) setSuccess(true);
      else setError(result.error ?? 'Something went wrong');
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <KeyRound className="mx-auto mb-2 h-8 w-8 text-primary" />
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          {success ? 'Your password has been reset!' : 'Enter your new password below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Your password has been successfully reset. You can now log in.
            </p>
            <Link href="/login">
              <Button className="mt-2 w-full">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number, special"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-1 inline-block h-3 w-3" />Back to Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
