import { Suspense } from 'react';
import { DatesheetDetailClient } from './datesheet-detail-client';
import { SkeletonPage } from '@/components/shared';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminDatesheetDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<SkeletonPage />}>
      <DatesheetDetailClient datesheetId={id} />
    </Suspense>
  );
}
