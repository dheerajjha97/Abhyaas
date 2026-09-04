import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { Paper, ShortQuestion } from '../types/question';
import { saveBookmark, isBookmarked, removeBookmark } from '../utils/bookmarkStorage';
import { HeaderBar } from '../components/ui/HeaderBar';
import { QuestionSkeleton } from '../components/ui/Skeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { FormattedAnswer } from '../components/ui/FormattedAnswer';
import {
  Eye,
  EyeOff,
  Bookmark,
  Copy,
  ChevronLeft,
  ChevronRight,
  FileText,
  Type,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export const ShortQuestions: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
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
      <div className="space-y-4 max-w-2xl mx-auto pb-16 animate-in fade-in">
        <HeaderBar showBack title="लघु उत्तरीय प्रश्न" />
        <QuestionSkeleton />
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
  const isAnswerVisible = showAnswer[currentIndex] ?? true; // Default visible for convenient reading

  const handleToggleAnswer = () => {
    setShowAnswer((prev) => ({
      ...prev,
      [currentIndex]: !isAnswerVisible,
    }));
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
    const textToCopy = `प्रश्न (${currentIndex + 1}): ${currentQ.question}\n\nउत्तर:\n${currentQ.answer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setToast({ id: Date.now().toString(), type: 'success', message: 'प्रश्न एवं उत्तर कॉपी हो गया' });
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
        title={`${paper.subject} Short Answers`}
        subtitle={`Question ${currentIndex + 1} of ${total}`}
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

      {/* Progress Counter Pill */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>लघु उत्तरीय प्रश्न (2-3 Marks)</span>
        </span>
        <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 px-3 py-0.5 rounded-full font-extrabold text-[11px]">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Main Question & Answer Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/60 dark:border-slate-800 shadow-xl space-y-5">
        {/* Question Header */}
        <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 px-3 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-purple-600" /> प्रश्न संख्या {currentIndex + 1}
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

          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
            {currentQ.question}
          </h3>
        </div>

        {/* Answer Toggle / Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              आदर्श उत्तर (Model Answer):
            </span>
          </div>

          <button
            onClick={handleToggleAnswer}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {isAnswerVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>छिपाएँ</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>उत्तर देखें</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted Answer Body */}
        {isAnswerVisible && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700/80 shadow-2xs animate-in fade-in duration-200">
            <FormattedAnswer content={currentQ.answer} fontSize={fontSize} />
          </div>
        )}
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
