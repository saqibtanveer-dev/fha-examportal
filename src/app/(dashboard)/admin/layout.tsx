import { requireRole } from '@/lib/auth-utils';
import { getUnreadCount } from '@/modules/notifications/notification-queries';
import { AdminShell } from './admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('ADMIN');
  const notificationCount = await getUnreadCount(session.user.id);

  return (
    <AdminShell user={session.user} notificationCount={notificationCount}>
      {children}
    </AdminShell>
  );
}
