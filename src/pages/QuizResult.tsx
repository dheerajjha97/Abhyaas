import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QuizResultData } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration } from '../components/ui/Illustration';
import { Trophy, CheckCircle2, XCircle, RotateCcw, BookOpen, ArrowLeft, Award, Sparkles } from 'lucide-react';

export const QuizResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paperId } = useParams<{ paperId: string }>();

  const result: QuizResultData | undefined = location.state?.result;

  if (!result) {
    return (
      <div className="py-20 text-center space-y-4 px-4 max-w-sm mx-auto">
        <HeaderBar showBack title="Quiz Result" />
        <div className="w-32 mx-auto">
          <Illustration name="empty" />
        </div>
        <p className="text-sm font-bold text-slate-700">परिणाम डेटा उपलब्ध नहीं है।</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          होम पेज पर जाएँ
        </button>
      </div>
    );
  }

  const isHighScorer = result.percentage >= 60;

  return (
    <div className="space-y-5 pb-36 animate-in fade-in duration-300">
      <HeaderBar showBack title="Quiz Score" subtitle={result.paperName} />

      {/* Celebratory Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 text-center space-y-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden relative">
        <div className="w-48 mx-auto -mb-2">
          <Illustration name="success" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {isHighScorer ? '🎉 शानदार प्रदर्शन!' : '👍 अच्छा प्रयास!'}
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            आपका Score
          </h2>
          <div className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 my-1">
            {result.score} / {result.totalQuestions}
          </div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            सफलता दर: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{result.percentage}%</span>
          </p>
        </div>

        {/* Breakdown Chips */}
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Correct</span>
              <p className="text-base font-black text-emerald-900 dark:text-emerald-100 leading-none">{result.correct}</p>
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 rounded-2xl flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Wrong</span>
              <p className="text-base font-black text-rose-900 dark:text-rose-100 leading-none">{result.wrong}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => navigate(`/paper/${paperId}/quiz`)}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>फिर से Quiz दें</span>
        </button>

        <button
          onClick={() => navigate(`/paper/${paperId}/short`)}
          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Short Answers पढ़ें</span>
        </button>

        <button
          onClick={() => navigate(`/paper/${paperId}`)}
          className="w-full py-3 px-4 bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>वापस जाएँ (Paper Dashboard)</span>
        </button>
      </div>
    </div>
  );
};
