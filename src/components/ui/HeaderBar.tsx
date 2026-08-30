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
    <header className="sticky top-0 z-30 w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/40 dark:border-slate-800/80 px-4 py-3 shadow-2xs">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-1 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white/90 active:scale-95 transition-all shadow-2xs cursor-pointer"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            {title ? (
              <h1 className="text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-200 tracking-tight truncate leading-tight">
                {title}
              </h1>
            ) : (
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-indigo-900 dark:text-indigo-200 tracking-tight leading-none">
                  Abhyaas
                </h1>
                <p className="text-[10px] font-medium text-indigo-600/80 dark:text-indigo-400/80 tracking-widest uppercase mt-[1px]">
                  पढ़ो • अभ्यास करो • बेहतर बनो
                </p>
              </div>
            )}

            {subtitle && (
              <p className="text-[10px] font-medium text-indigo-600/80 dark:text-indigo-400/80 tracking-widest uppercase truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction ? (
          <div>{rightAction}</div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/60 px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>अभ्यास</span>
          </div>
        )}
      </div>
    </header>
  );
};
