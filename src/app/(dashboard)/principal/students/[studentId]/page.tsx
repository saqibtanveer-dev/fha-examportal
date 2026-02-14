export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { notFound } from 'next/navigation';
import { getStudentDetail } from '@/modules/principal/principal-queries';
import { StudentDetailClient } from './student-detail-client';

type Props = {
  params: Promise<{ studentId: string }>;
};

export default async function PrincipalStudentDetailPage({ params }: Props) {
  await requireRole('PRINCIPAL');
  const { studentId } = await params;

  const student = await getStudentDetail(studentId);
  if (!student) notFound();

  return (
    <StudentDetailClient
      student={{
        ...student,
        createdAt: student.createdAt.toISOString(),
        lastLoginAt: student.lastLoginAt?.toISOString() ?? null,
        studentProfile: {
          ...student.studentProfile,
          dateOfBirth: student.studentProfile.dateOfBirth?.toISOString() ?? null,
          enrollmentDate: student.studentProfile.enrollmentDate.toISOString(),
        },
        results: student.results.map((r) => ({
          ...r,
          totalMarks: Number(r.totalMarks),
          obtainedMarks: Number(r.obtainedMarks),
          percentage: Number(r.percentage),
          createdAt: r.createdAt.toISOString(),
        })),
        sessions: student.sessions.map((s) => ({
          ...s,
          startedAt: s.startedAt?.toISOString() ?? null,
          submittedAt: s.submittedAt?.toISOString() ?? null,
        })),
      }}
    />
  );
}
