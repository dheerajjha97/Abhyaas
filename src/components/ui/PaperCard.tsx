import React from 'react';
import { PaperSummary } from '../../types/question';
import { GlassCard } from './GlassCard';
import { Calendar, FileText, HelpCircle, BookOpen, ArrowRight, Award } from 'lucide-react';

interface PaperCardProps {
  paper: PaperSummary;
  onSelect: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onSelect }) => {
  return (
    <GlassCard variant="default" className="p-4 sm:p-5 flex flex-col justify-between gap-4 border-white/80 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <Calendar className="w-3 h-3 text-amber-600" />
              {paper.year}
            </span>
            {paper.board && (
              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Award className="w-3 h-3 text-indigo-500" />
                {paper.board}
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-2">
            {paper.paperName}
          </h3>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Class {paper.class} • {paper.subject}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/20 border border-indigo-200/50 p-2 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {/* Breakdown chips */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-center">
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-indigo-500" /> MCQs
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{paper.mcqCount}</span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-700 px-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <FileText className="w-3 h-3 text-purple-500" /> Short
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{paper.shortCount}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-pink-500" /> Long
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{paper.longCount}</span>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span>तैयारी शुरू करें</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </GlassCard>
  );
};
