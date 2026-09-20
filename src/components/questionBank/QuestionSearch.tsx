import React from 'react';
import { Search } from 'lucide-react';

interface QuestionSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  subjectName: string;
}

export const QuestionSearch: React.FC<QuestionSearchProps> = ({
  searchQuery,
  onSearchChange,
  subjectName,
}) => {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`खोजें: "${subjectName}" का कोई भी प्रश्न या विषय...`}
        className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
          aria-label="खोज साफ़ करें"
        >
          ✕
        </button>
      )}
    </div>
  );
};
