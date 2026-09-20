import React from 'react';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

interface QuestionControlsProps {
  fontSize: 'sm' | 'base' | 'lg';
  onFontSizeChange: (size: 'sm' | 'base' | 'lg') => void;
  onToggleFilterModal?: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  activeFilterCount?: number;
}

export const QuestionControls: React.FC<QuestionControlsProps> = ({
  fontSize,
  onFontSizeChange,
  onToggleFilterModal,
  onRefresh,
  isRefreshing = false,
  activeFilterCount = 0,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
      {/* Left: 'फ़िल्टर' button */}
      <button
        type="button"
        onClick={onToggleFilterModal}
        className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60 active:scale-95"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
        <span>फ़िल्टर</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Center: Text size controls A- / A / A+ */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => onFontSizeChange('sm')}
          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
            fontSize === 'sm'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="छोटा अक्षर (Small Font)"
        >
          A-
        </button>
        <button
          type="button"
          onClick={() => onFontSizeChange('base')}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
            fontSize === 'base'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="सामान्य अक्षर (Normal Font)"
        >
          A
        </button>
        <button
          type="button"
          onClick={() => onFontSizeChange('lg')}
          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
            fontSize === 'lg'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="बड़ा अक्षर (Large Font)"
        >
          A+
        </button>
      </div>

      {/* Right: Refresh / Reset button */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60 active:scale-95 disabled:opacity-50"
        title="पुनः रीफ्रेश करें (Refresh)"
        aria-label="पुनः रीफ्रेश करें"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 ${
            isRefreshing ? 'animate-spin text-blue-600' : ''
          }`}
        />
      </button>
    </div>
  );
};
