import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-2xs">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-1 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            {title ? (
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                {title}
              </h1>
            ) : (
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Abhyaas
                </h1>
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-0.5">
                  पढ़ो • अभ्यास करो • बेहतर बनो
                </p>
              </div>
            )}

            {subtitle && (
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction ? (
          <div>{rightAction}</div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>अभ्यास</span>
          </div>
        )}
      </div>
    </header>
  );
};
