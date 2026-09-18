import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, AppNotification } from '../../context/NotificationContext';
import { useStudentProfile } from '../../context/StudentProfileContext';

export const NotificationCenterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile } = useStudentProfile();
  const {
    notifications,
    unreadCount,
    isPermissionGranted,
    requestPermission,
    markAsRead,
    markAllAsRead,
    permissionStatus,
  } = useNotifications();

  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.url) {
      if (notif.url.startsWith('http')) {
        window.open(notif.url, '_blank');
      } else {
        navigate(notif.url);
      }
    }
    onClose();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'paper_update':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'notes_update':
        return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'exam_alert':
        return <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'reminder':
      default:
        return <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        id="notification-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="notification-center-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bell className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    स्टडी अलर्ट व रिमाइंडर्स
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                      {unreadCount} नए
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  कक्षा {profile.classId}वीं के नए पेपर्स और परीक्षा अपडेट्स
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Push Permission Banner (if not granted yet) */}
          {!isPermissionGranted && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    पुश नोटिफिकेशन चालू करें
                  </h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 line-clamp-1">
                    जब भी नया 10वीं/12वीं का पेपर या नोट्स आएंगे, तुरंत फोन पर घंटी बजेगी।
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="enable-push-notifications-btn"
                onClick={handleEnablePush}
                disabled={isRequesting}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs shrink-0 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isRequesting ? 'सक्रिय हो रहा...' : 'चालू करें'}
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>
              कुल {notifications.length} अलर्ट • Class {profile.classId}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>सभी को पढ़ा हुआ चिह्नित करें</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-xs font-bold">अभी कोई नया अलर्ट नहीं है।</p>
                <p className="text-[11px] text-slate-500">
                  नए पेपर्स और रिवीजन शीट्स अपलोड होते ही यहाँ दिखेंगे।
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.read
                      ? 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 opacity-80'
                      : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 shadow-xs'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-slate-100 dark:border-slate-600">
                    {getIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4
                        className={`text-xs font-bold leading-tight ${
                          item.read
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-950 dark:text-white font-extrabold'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.body}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('hi-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.url && (
                        <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-bold">
                          <span>खोलें</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>स्मार्ट नोटिफिकेशन सिस्टम द्वारा सुरक्षित</span>
            </div>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full font-bold">
              Class {profile.classId}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
