'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TestTakingInterface } from '@/modules/admissions/components/test-taking-interface';
import { Spinner } from '@/components/shared';

function TestPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const campaign = searchParams.get('campaign') ?? 'Admission Test';

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">Invalid Test Link</h2>
          <p className="mt-2 text-muted-foreground">
            Please use the test access link sent to your email.
          </p>
        </div>
      </div>
    );
  }

  return <TestTakingInterface accessToken={token} campaignName={campaign} />;
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <TestPageContent />
    </Suspense>
  );
}
