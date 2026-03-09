import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrincipalFeesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      }
    >
      <PrincipalFeesLoader />
    </Suspense>
  );
}

async function PrincipalFeesLoader() {
  const { PrincipalFeesClient } = await import('./principal-fees-client');
  return <PrincipalFeesClient />;
}
