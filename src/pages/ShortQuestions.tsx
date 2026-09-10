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
  Share2,
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

  const handleShareQuestion = async () => {
    const shareTitle = `${paper.subject} - लघु उत्तरीय प्रश्न (${currentIndex + 1})`;
    const shareText = `📚 *Abhyaas App | ${paper.subject} (${paper.class})*\n\n❓ *लघु उत्तरीय प्रश्न (${currentIndex + 1}):*\n${currentQ.question}\n\n📖 *आदर्श उत्तर:*\n${currentQ.answer}\n\n🔗 सभी विषयों के मॉडल पेपर्स और परीक्षा तैयारी के लिए Abhyaas App देखें:`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setToast({ id: Date.now().toString(), type: 'success', message: 'प्रश्न सफलतापूर्वक शेयर किया गया!' });
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (!isAbort) {
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          setToast({ id: Date.now().toString(), type: 'success', message: 'प्रश्न एवं उत्तर कॉपी हो गया (शेयर करने के लिए तैयार)' });
        }
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setToast({ id: Date.now().toString(), type: 'success', message: 'शेयर टेक्स्ट क्लिपबोर्ड में कॉपी हो गया!' });
    }
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
              onClick={handleShareQuestion}
              title="प्रश्न शेयर करें (Share Question)"
              className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center cursor-pointer shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleBookmark}
              title={isBooked ? 'बुकमार्क हटाएं' : 'बुकमार्क करें'}
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

      {/* Progress & Marks Indicator */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>लघु उत्तरीय प्रश्न (Short Answer • 2-3 अंक)</span>
        </span>
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 px-3 py-0.5 rounded-full font-black text-[11px] border border-blue-200 dark:border-blue-800">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Main Textbook Page Card */}
      <div className="bg-[#fffefb] dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-amber-200/80 dark:border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
        {/* Subtle top book ruler bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 absolute top-0 left-0 right-0" />

        {/* Question Block */}
        <div className="space-y-3 pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-black text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-xl shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> प्र. {currentIndex + 1}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                [ 2 अंक ]
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer"
                title="Copy Question & Answer"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareQuestion}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer active:scale-95"
                title="Share via Web Share API"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed tracking-tight font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
            {currentQ.question}
          </h3>
        </div>

        {/* Answer Toggle / Header */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>आदर्श उत्तर (Textbook Solution)</span>
          </div>

          <button
            onClick={handleToggleAnswer}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800"
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

        {/* Formatted Answer Body - Textbook Style */}
        {isAnswerVisible && (
          <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/40 dark:bg-slate-800/60 border-l-4 border-blue-600 dark:border-blue-500 border-y border-r border-amber-200/70 dark:border-slate-700/80 shadow-xs animate-in fade-in duration-200">
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-black text-blue-900 dark:text-blue-300">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                उत्तर
              </span>
              <span className="text-slate-400 dark:text-slate-600">:</span>
            </div>
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
