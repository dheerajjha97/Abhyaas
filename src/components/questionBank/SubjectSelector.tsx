import React from 'react';
import { SubjectOption } from '../../types/studentProfile';
import { ChevronRight, FlaskConical, Globe, Calculator, BookOpen, Layers } from 'lucide-react';

interface SubjectSelectorProps {
  subjects: SubjectOption[];
  activeSubject: string;
  onSelectSubject: (subjectName: string) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  activeSubject,
  onSelectSubject,
}) => {
  const getSubjectVisuals = (name: string) => {
    const s = name.toLowerCase();
    if (s.includes('sci') || s.includes('phy') || s.includes('chem') || s.includes('bio')) {
      return {
        icon: <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        bg: 'bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40',
      };
    }
    if (s.includes('soc') || s.includes('hist') || s.includes('geo') || s.includes('pol')) {
      return {
        icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40',
      };
    }
    if (s.includes('math')) {
      return {
        icon: <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        bg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40',
      };
    }
    if (s.includes('hin') || s.includes('eng') || s.includes('san') || s.includes('urdu') || s.includes('maith')) {
      return {
        icon: <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">अ</span>,
        bg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40',
      };
    }
    return {
      icon: <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40',
    };
  };

  return (
    <section className="space-y-2.5">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1 text-slate-800 dark:text-slate-200">
        <h3 className="text-sm font-black tracking-tight">विषय का चयन करें:</h3>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {subjects.length} विषय उपलब्ध
        </span>
      </div>

      {/* Horizontally Scrollable Cards Container */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
        {subjects.map((sub) => {
          const isSelected = activeSubject.toLowerCase() === sub.name.toLowerCase();
          const visuals = getSubjectVisuals(sub.name);

          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.name)}
              className={`snap-start p-2.5 px-3 rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer shrink-0 text-left border ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-500 dark:border-blue-400 shadow-xs ring-1 ring-blue-500/30 scale-[1.01]'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${visuals.bg}`}
              >
                {visuals.icon}
              </div>

              {/* Subject Names */}
              <div className="min-w-0 pr-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {sub.hindiName}
                </div>
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {sub.name}
                </div>
              </div>

              {/* Subtle Right Arrow */}
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isSelected
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
