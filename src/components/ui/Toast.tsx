import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl p-3.5 flex items-center justify-between gap-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[toast.type || 'info']}
          <span className="truncate">{toast.message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
