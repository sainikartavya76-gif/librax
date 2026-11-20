import React from 'react';
import { Bell, Clock, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: any;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'DUE_REMINDER': return <Clock className="w-5 h-5 text-warning" />;
    case 'RESERVATION_AVAILABLE': return <CheckCircle className="w-5 h-5 text-success" />;
    case 'FINE_IMPOSED': return <AlertTriangle className="w-5 h-5 text-danger" />;
    default: return <Bell className="w-5 h-5 text-accent" />;
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onDelete }) => {
  return (
    <div 
      className={`group flex items-start gap-4 p-4 border-b border-border transition-colors hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50/30' : 'bg-surface'}`}
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
    >
      <div className="mt-1 flex-shrink-0">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-textPrimary' : 'font-medium text-textSecondary'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-textMuted whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="mt-1 text-sm text-textSecondary line-clamp-2">
          {notification.message}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-accent" />
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="p-1.5 text-textMuted hover:text-danger hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
