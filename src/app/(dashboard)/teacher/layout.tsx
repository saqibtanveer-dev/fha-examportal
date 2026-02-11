import { requireRole } from '@/lib/auth-utils';
import { getUnreadCount } from '@/modules/notifications/notification-queries';
import { TeacherShell } from './teacher-shell';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const notificationCount = await getUnreadCount(session.user.id);

  return (
    <TeacherShell user={session.user} notificationCount={notificationCount}>
      {children}
    </TeacherShell>
  );
}
