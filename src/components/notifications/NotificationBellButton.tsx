import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';

export const NotificationBellButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        id="app-notification-bell-btn"
        onClick={() => setIsOpen(true)}
        className={`relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/70 dark:border-slate-700 ${className}`}
        title="स्टडी अलर्ट व रिमाइंडर्स"
        aria-label="स्टडी अलर्ट व रिमाइंडर्स"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
