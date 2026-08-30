import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { Paper, LongQuestion } from '../types/question';
import { saveBookmark, isBookmarked, removeBookmark } from '../utils/bookmarkStorage';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { FormattedAnswer } from '../components/ui/FormattedAnswer';
import {
  Bookmark,
  Copy,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Type,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export const LongQuestions: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [copied, setCopied] = useState(false);

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
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
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
    const textToCopy = `दीर्घ उत्तरीय प्रश्न (${currentIndex + 1}): ${currentQ.question}\n\nउत्तर:\n${currentQ.answer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setToast({ id: Date.now().toString(), type: 'success', message: 'दीर्घ उत्तरीय प्रश्न एवं उत्तर कॉपी हो गया' });
  };

  const cycleFontSize = () => {
    if (fontSize === 'sm') setFontSize('base');
    else if (fontSize === 'base') setFontSize('lg');
    else setFontSize('sm');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar
        showBack
        title={`${paper.subject} Long Answers`}
        subtitle={`5-Mark Question ${currentIndex + 1} of ${total}`}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleFontSize}
              title="Font Size (छोटा/बड़ा करें)"
              className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center gap-0.5 cursor-pointer shadow-2xs hover:bg-slate-50 transition-all"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">{fontSize}</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                isBooked
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                  : 'bg-white/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBooked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Header Banner */}
      <div className="rounded-2xl p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 border border-pink-200/80 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            दीर्घ उत्तरीय प्रश्न (5 Marks Descriptive)
          </span>
        </div>
        <span className="text-[11px] font-extrabold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/80 px-2.5 py-0.5 rounded-full">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Main Long Question & Answer View */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/60 dark:border-slate-800 shadow-xl space-y-6">
        {/* Question Header */}
        <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/70 border border-pink-200 dark:border-pink-800 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" /> दीर्घ प्रश्न संख्या {currentIndex + 1}
            </span>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
            {currentQ.question}
          </h2>
        </div>

        {/* Detailed Formatted Answer Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-pink-800 dark:text-pink-300 bg-pink-100/70 dark:bg-pink-950/60 px-3 py-1 rounded-xl border border-pink-200/60 dark:border-pink-800/60">
              <FileText className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span>विस्तृत आदर्श उत्तर (Comprehensive Solution):</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-slate-800/70 border border-amber-200/80 dark:border-slate-700/80 shadow-2xs">
            <FormattedAnswer content={currentQ.answer} fontSize={fontSize} />
          </div>
        </div>
      </div>

      {/* Bottom Prev / Next Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
            currentIndex === 0
              ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer'
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
              : 'bg-pink-600 hover:bg-pink-700 text-white border-pink-600 shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer'
          }`}
        >
          <span>अगला प्रश्न</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
