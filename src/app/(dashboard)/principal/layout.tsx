import { requireRole } from '@/lib/auth-utils';
import { getUnreadCount } from '@/modules/notifications/notification-queries';
import { PrincipalShell } from './principal-shell';

export default async function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('PRINCIPAL');
  const notificationCount = await getUnreadCount(session.user.id);

  return (
    <PrincipalShell user={session.user} notificationCount={notificationCount}>
      {children}
    </PrincipalShell>
  );
}
