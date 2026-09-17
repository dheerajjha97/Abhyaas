import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const ForegroundNotificationToast: React.FC = () => {
  const navigate = useNavigate();
  const { activeToast, dismissToast } = useNotifications();

  if (!activeToast) return null;

  const handleClick = () => {
    if (activeToast.url) {
      if (activeToast.url.startsWith('http')) {
        window.open(activeToast.url, '_blank');
      } else {
        navigate(activeToast.url);
      }
    }
    dismissToast();
  };

  return (
    <AnimatePresence>
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-2xl p-4 shadow-2xl overflow-hidden relative cursor-pointer"
          onClick={handleClick}
        >
          {/* Subtle glow bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-400" />

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {activeToast.classId ? `कक्षा ${activeToast.classId} अलर्ट` : 'नया अलर्ट'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast();
                  }}
                  className="w-5 h-5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug mt-0.5">
                {activeToast.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {activeToast.body}
              </p>

              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2">
                <span>अभी देखें</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
