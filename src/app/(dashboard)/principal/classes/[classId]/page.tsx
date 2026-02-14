export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { notFound } from 'next/navigation';
import { getClassDetail } from '@/modules/principal/principal-queries';
import { ClassDetailClient } from './class-detail-client';

type Props = {
  params: Promise<{ classId: string }>;
};

export default async function PrincipalClassDetailPage({ params }: Props) {
  await requireRole('PRINCIPAL');
  const { classId } = await params;

  const classData = await getClassDetail(classId);
  if (!classData) notFound();

  return (
    <ClassDetailClient
      classData={{
        ...classData,
        assignedExams: classData.assignedExams.map((e) => ({
          ...e,
          scheduledStartAt: e.scheduledStartAt?.toISOString() ?? null,
        })),
      }}
    />
  );
}
