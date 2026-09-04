import React from 'react';
import { GlassCard } from './GlassCard';
import { Illustration, IllustrationType } from './Illustration';
import { ChevronRight, BookOpen, Zap } from 'lucide-react';

interface SubjectCardProps {
  name: string;
  paperCount: number;
  classId: string;
  illustrationType: IllustrationType;
  gradient: string;
  onClick: () => void;
  onMockTest?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  paperCount,
  classId,
  illustrationType,
  gradient,
  onClick,
  onMockTest,
}) => {
  return (
    <GlassCard
      variant="interactive"
      onClick={onClick}
      className="group p-4 sm:p-5 overflow-hidden border-white/60 dark:border-slate-800"
    >
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-20 blur-xl ${gradient}`} />
      
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Illustration name={illustrationType} size={38} />
          </div>

          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {paperCount > 0 ? (
                <span className="text-emerald-700 dark:text-emerald-400 truncate">
                  {paperCount} {paperCount === 1 ? 'Question Paper' : 'Question Papers'}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  शीघ्र उपलब्ध (0 Papers)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onMockTest && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMockTest();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs border border-indigo-100 dark:border-indigo-900/60"
              title="इस विषय का नया मॉक टेस्ट जनरेट करें"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">मॉक टेस्ट</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
