import { requireRole } from '@/lib/auth-utils';
import { TeacherShell } from './teacher-shell';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('TEACHER', 'ADMIN');
  return <TeacherShell user={session.user}>{children}</TeacherShell>;
}
