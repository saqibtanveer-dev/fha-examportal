export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { notFound } from 'next/navigation';
import { getTeacherDetail } from '@/modules/principal/principal-queries';
import { TeacherDetailClient } from './teacher-detail-client';

type Props = {
  params: Promise<{ teacherId: string }>;
};

export default async function PrincipalTeacherDetailPage({ params }: Props) {
  await requireRole('PRINCIPAL');
  const { teacherId } = await params;

  const teacher = await getTeacherDetail(teacherId);
  if (!teacher) notFound();

  return (
    <TeacherDetailClient
      teacher={{
        ...teacher,
        createdAt: teacher.createdAt.toISOString(),
        lastLoginAt: teacher.lastLoginAt?.toISOString() ?? null,
        teacherProfile: {
          ...teacher.teacherProfile,
          joiningDate: teacher.teacherProfile.joiningDate.toISOString(),
        },
        exams: teacher.exams.map((e) => ({
          ...e,
          totalMarks: Number(e.totalMarks),
          scheduledStartAt: e.scheduledStartAt?.toISOString() ?? null,
          createdAt: e.createdAt.toISOString(),
        })),
      }}
    />
  );
}
