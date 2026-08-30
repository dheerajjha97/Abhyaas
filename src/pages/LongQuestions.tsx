import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { Paper, LongQuestion } from '../types/question';
import { saveBookmark, isBookmarked, removeBookmark } from '../utils/bookmarkStorage';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { Bookmark, Copy, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';

export const LongQuestions: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
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
          <Illustration name="books" />
        </div>
        <p className="text-sm font-bold text-pink-600">Long Answers लोड हो रहे हैं...</p>
      </div>
    );
  }

  const questions: LongQuestion[] = paper.longQuestions || [];
  if (questions.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto px-4">
        <HeaderBar showBack title="Long Answers" />
        <div className="w-36 mx-auto">
          <Illustration name="empty" />
        </div>
        <p className="text-sm font-bold text-slate-700">इस प्रश्न पत्र में Long Questions उपलब्ध नहीं हैं।</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl">
          वापस जाएँ
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const isBooked = isBookmarked(currentQ.id);

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
        type: 'long',
        question: currentQ.question,
        answer: currentQ.answer,
      });
      setToast({ id: Date.now().toString(), type: 'success', message: 'Long Question सहेज लिया गया' });
    }
  };

  const handleCopyText = () => {
    const textToCopy = `विस्तृत प्रश्न (${currentIndex + 1}): ${currentQ.question}\n\nउत्तर:\n${currentQ.answer}`;
    navigator.clipboard.writeText(textToCopy);
    setToast({ id: Date.now().toString(), type: 'success', message: 'विस्तृत प्रश्न एवं उत्तर कॉपी हो गया' });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar
        showBack
        title={`${paper.subject} Long Answers`}
        subtitle={`5-Mark Question ${currentIndex + 1} of ${total}`}
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

      {/* Header Banner */}
      <GlassCard variant="accent" padding="sm" className="flex items-center justify-between gap-3 border-pink-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-pink-600" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            विस्तृत प्रश्न उत्तर (Descriptive Section)
          </span>
        </div>
        <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">
          {currentIndex + 1} / {total}
        </span>
      </GlassCard>

      {/* Distraction-Free Long Answer Reading View */}
      <GlassCard variant="default" padding="lg" className="space-y-6 border-white shadow-xl">
        {/* Question Header */}
        <div className="space-y-2 border-b border-slate-200/80 pb-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-pink-700 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5 text-pink-600" /> Long Question {currentIndex + 1}
            </span>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* Detailed Answer Section */}
        <div className="space-y-3 pt-1">
          <div className="inline-block text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
            विस्तृत उत्तर:
          </div>
          <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-line font-medium bg-slate-50/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
            {currentQ.answer}
          </div>
        </div>
      </GlassCard>

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
          <span>पिछला प्रश्न</span>
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
          <span>अगला प्रश्न</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
