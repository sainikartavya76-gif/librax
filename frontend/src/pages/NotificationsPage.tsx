import React from 'react';
import { useNotifications, useMarkAllRead, useMarkRead, useDeleteNotification, useUnreadCount } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadCount();
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();
  const deleteNotif = useDeleteNotification();

  if (isLoading) return (
    <div className="space-y-3 max-w-3xl">
      {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="heading-page">Notifications</h1>
            {unreadCount > 0 && (
              <span className="badge badge-info font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-0.5">Automated circulation notices, due date warnings, and alerts.</p>
        </div>
        {notifications && notifications.length > 0 && unreadCount > 0 && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => markAll.mutate()} 
            isLoading={markAll.isPending}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="card overflow-hidden">
        {!notifications || notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Bell} title="No notifications yet" description="When circulation events, due dates, or fines occur, alerts will appear here." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(n => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onMarkRead={(id) => markRead.mutate(String(id))} 
                onDelete={(id) => deleteNotif.mutate(String(id))} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
