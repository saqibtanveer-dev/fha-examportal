import { requireRole } from '@/lib/auth-utils';
import { fetchTeacherReferenceData } from '@/modules/settings/reference-actions';
import { TeacherShell } from './teacher-shell';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const refResult = await fetchTeacherReferenceData();

  return (
    <TeacherShell
      user={session.user}
      referenceData={refResult.success ? refResult.data : undefined}
    >
      {children}
    </TeacherShell>
  );
}
