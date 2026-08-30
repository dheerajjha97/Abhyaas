import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { Paper, ShortQuestion } from '../types/question';
import { saveBookmark, isBookmarked, removeBookmark } from '../utils/bookmarkStorage';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { Eye, EyeOff, Bookmark, Copy, ChevronLeft, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

export const ShortQuestions: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!paperId) return;
    setLoading(true);
    questionRepository.getPaperById(paperId).then((data) => {
      setPaper(data);
      setLoading(false);
    });
  }, [paperId]);

  if (loading || !paper) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-40 mx-auto">
          <Illustration name="study" />
        </div>
        <p className="text-sm font-bold text-purple-600">Short Answers लोड हो रहे हैं...</p>
      </div>
    );
  }

  const questions: ShortQuestion[] = paper.shortQuestions || [];
  if (questions.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto px-4">
        <HeaderBar showBack title="Short Answers" />
        <div className="w-36 mx-auto">
          <Illustration name="empty" />
        </div>
        <p className="text-sm font-bold text-slate-700">इस प्रश्न पत्र में Short Questions उपलब्ध नहीं हैं।</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl">
          वापस जाएँ
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const isBooked = isBookmarked(currentQ.id);
  const isAnswerVisible = showAnswer[currentIndex] || false;

  const handleToggleAnswer = () => {
    setShowAnswer((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  const handleToggleBookmark = () => {
    if (isBooked) {
      removeBookmark(currentQ.id);
      setToast({ id: Date.now().toString(), type: 'info', message: 'बुकमार्क हटा दिया गया' });
    } else {
      saveBookmark({
        id: currentQ.id,
        paperId: paper.id,
        paperName: paper.paperName,
        classId: paper.class,
        subject: paper.subject,
        year: paper.year,
        type: 'short',
        question: currentQ.question,
        answer: currentQ.answer,
      });
      setToast({ id: Date.now().toString(), type: 'success', message: 'Short Question सहेज लिया गया' });
    }
  };

  const handleCopyText = () => {
    const textToCopy = `प्रश्न: ${currentQ.question}\n\nउत्तर: ${currentQ.answer}`;
    navigator.clipboard.writeText(textToCopy);
    setToast({ id: Date.now().toString(), type: 'success', message: 'प्रश्न एवं उत्तर कॉपी हो गया' });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar
        showBack
        title={`${paper.subject} Short Answers`}
        subtitle={`Question ${currentIndex + 1} of ${total}`}
        rightAction={
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-2xl border transition-all active:scale-95 ${
              isBooked ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white/80 border-slate-200 text-slate-500'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBooked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        }
      />

      {/* Counter Pill */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4 text-purple-600" /> Short Answer Practice
        </span>
        <span className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Main Reading Card */}
      <GlassCard variant="default" padding="lg" className="space-y-5 border-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg">
            Question {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
          </span>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Answer Toggle Button */}
        <div>
          <button
            onClick={handleToggleAnswer}
            className={`w-full py-3 px-4 font-bold text-xs sm:text-sm rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              isAnswerVisible
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 text-purple-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            {isAnswerVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>उत्तर छिपाएँ</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>उत्तर देखें (Show Answer)</span>
              </>
            )}
          </button>
        </div>

        {/* Answer Content Card */}
        {isAnswerVisible && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 space-y-2 animate-in fade-in duration-200">
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              उत्तर:
            </span>
            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">
              {currentQ.answer}
            </p>
          </div>
        )}
      </GlassCard>

      {/* Decorative Study Illustration between navigation */}
      <div className="w-24 mx-auto py-1 opacity-90">
        <Illustration name="study" />
      </div>

      {/* Bottom Prev / Next Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
            currentIndex === 0
              ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>पिछला सवाल</span>
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
          disabled={currentIndex === total - 1}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
            currentIndex === total - 1
              ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer'
          }`}
        >
          <span>अगला सवाल</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
