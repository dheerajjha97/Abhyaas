import React from 'react';
import { Type } from 'lucide-react';

interface FontControlProps {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
}

export const FontControl: React.FC<FontControlProps> = ({ fontSize, onChangeFontSize }) => {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold select-none">
      <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1 flex items-center gap-0.5">
        <Type className="w-3 h-3" />
        <span className="hidden sm:inline">फॉन्ट:</span>
      </span>
      <button
        type="button"
        onClick={() => onChangeFontSize('sm')}
        className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
          fontSize === 'sm'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        title="छोटा फॉन्ट (Compact)"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => onChangeFontSize('md')}
        className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
          fontSize === 'md'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        title="सामान्य फॉन्ट (Normal)"
      >
        A
      </button>
      <button
        type="button"
        onClick={() => onChangeFontSize('lg')}
        className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
          fontSize === 'lg'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        title="बड़ा फॉन्ट (Large)"
      >
        A+
      </button>
      <button
        type="button"
        onClick={() => onChangeFontSize('xl')}
        className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
          fontSize === 'xl'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        title="अति बड़ा फॉन्ट (Extra Large for formulas)"
      >
        A++
      </button>
    </div>
  );
};
