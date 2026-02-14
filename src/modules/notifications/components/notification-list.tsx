'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from '@/modules/notifications/notification-actions';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/utils/format';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: Date;
};

type Props = { notifications: Notification[] };

export function NotificationList({ notifications }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      toast.success('All marked as read');
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNotificationAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck className="mr-1 h-3.5 w-3.5" />Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="h-100">
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${!n.isRead ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  {!n.isRead && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkRead(n.id)} disabled={isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(n.id)} disabled={isPending}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
