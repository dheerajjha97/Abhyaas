import React from 'react';
import { FileText } from 'lucide-react';

interface QuestionStatsProps {
  totalCount: number;
  shortCount: number;
  longCount: number;
}

export const QuestionStats: React.FC<QuestionStatsProps> = ({
  totalCount,
  shortCount,
  longCount,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800/80 items-center">
        {/* Total Questions */}
        <div className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              कुल प्रश्न
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              {totalCount}
            </div>
          </div>
        </div>

        {/* Short Questions */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              लघु उत्तरीय
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
              {shortCount} <span className="text-[11px] font-bold text-slate-500">(2 अंक)</span>
            </div>
          </div>
        </div>

        {/* Long Questions */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              दीर्घ उत्तरीय
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
              {longCount} <span className="text-[11px] font-bold text-slate-500">(5 अंक)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
