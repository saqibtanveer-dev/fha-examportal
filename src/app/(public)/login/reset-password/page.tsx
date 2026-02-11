import { Suspense } from 'react';
import { ResetPasswordForm } from './reset-password-form';
import { Spinner } from '@/components/shared';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Spinner size="lg" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
