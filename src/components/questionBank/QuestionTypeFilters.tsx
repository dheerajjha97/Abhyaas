import React from 'react';
import { Flame } from 'lucide-react';

export type QuestionFilterType = 'all' | 'short' | 'long' | 'repeated';

interface QuestionTypeFiltersProps {
  activeFilter: QuestionFilterType;
  onFilterChange: (type: QuestionFilterType) => void;
  totalCount: number;
  shortCount: number;
  longCount: number;
  repeatedCount: number;
}

export const QuestionTypeFilters: React.FC<QuestionTypeFiltersProps> = ({
  activeFilter,
  onFilterChange,
  totalCount,
  shortCount,
  longCount,
  repeatedCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* 1. All Filter */}
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
          activeFilter === 'all'
            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 dark:border-purple-400 text-purple-900 dark:text-purple-200 shadow-xs ring-2 ring-purple-500/20'
            : 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-100/80 dark:border-purple-900/40 text-purple-800 dark:text-purple-300 hover:bg-purple-50/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">सभी</span>
          <span className="text-xs font-black opacity-90">({totalCount})</span>
        </div>
        <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-1">
          सम्पूर्ण प्रश्न बैंक
        </div>
      </button>

      {/* 2. Short Filter */}
      <button
        type="button"
        onClick={() => onFilterChange('short')}
        className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
          activeFilter === 'short'
            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-200 shadow-xs ring-2 ring-blue-500/20'
            : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-100/80 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-50/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">लघु उत्तरीय</span>
          <span className="text-xs font-black opacity-90">({shortCount})</span>
        </div>
        <div className="mt-1">
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            2 अंक
          </span>
        </div>
      </button>

      {/* 3. Long Filter */}
      <button
        type="button"
        onClick={() => onFilterChange('long')}
        className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
          activeFilter === 'long'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
            : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100/80 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">दीर्घ उत्तरीय</span>
          <span className="text-xs font-black opacity-90">({longCount})</span>
        </div>
        <div className="mt-1">
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
            5 अंक
          </span>
        </div>
      </button>

      {/* 4. Repeated VVI Filter */}
      <button
        type="button"
        onClick={() => onFilterChange('repeated')}
        className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
          activeFilter === 'repeated'
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 dark:border-amber-400 text-amber-950 dark:text-amber-200 shadow-xs ring-2 ring-amber-500/20'
            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 hover:bg-amber-50/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>रिपीटेड (VVI)</span>
          </span>
          <span className="text-xs font-black opacity-90">({repeatedCount})</span>
        </div>
        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-1">
          PYQ परीक्षा में 2+ बार
        </div>
      </button>
    </div>
  );
};
