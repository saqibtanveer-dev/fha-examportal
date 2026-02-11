export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { getNotificationsForUser } from '@/modules/notifications/notification-queries';
import { NotificationList } from '@/modules/notifications/components';
import { PageHeader } from '@/components/shared';

export default async function AdminNotificationsPage() {
  const session = await requireRole('ADMIN');
  const notifications = await getNotificationsForUser(session.user.id, 50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with system events"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Notifications' }]}
      />
      <NotificationList notifications={notifications} />
    </div>
  );
}
