import { requireRole } from '@/lib/auth-utils';
import { getUnreadCount } from '@/modules/notifications/notification-queries';
import { StudentShell } from './student-shell';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('STUDENT');
  const notificationCount = await getUnreadCount(session.user.id);

  return (
    <StudentShell user={session.user} notificationCount={notificationCount}>
      {children}
    </StudentShell>
  );
}
