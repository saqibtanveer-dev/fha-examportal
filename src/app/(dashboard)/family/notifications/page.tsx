import { requireRole } from '@/lib/auth-utils';
import { getNotificationsForUser } from '@/modules/notifications/notification-queries';
import { NotificationList } from '@/modules/notifications/components';
import { PageHeader } from '@/components/shared';

export default async function FamilyNotificationsPage() {
  const session = await requireRole('FAMILY');
  const notifications = await getNotificationsForUser(session.user.id, 50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with your children's activities"
        breadcrumbs={[{ label: 'Family', href: '/family' }, { label: 'Notifications' }]}
      />
      <NotificationList notifications={notifications} />
    </div>
  );
}
