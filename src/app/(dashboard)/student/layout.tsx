import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { StudentShell } from './student-shell';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('STUDENT');
  if (!session) redirect('/login');
  return <StudentShell>{children}</StudentShell>;
}
