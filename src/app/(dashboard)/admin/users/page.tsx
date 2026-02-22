import { Suspense } from 'react';
import { UsersPageClient } from './users-page-client';
import { UsersListSkeleton } from './users-skeleton';

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersListSkeleton />}>
      <UsersPageClient />
    </Suspense>
  );
}
