import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { Paper, MCQ } from '../types/question';
import { saveBookmark, isBookmarked, removeBookmark, saveQuizResult } from '../utils/bookmarkStorage';
import { useStudentProgress } from '../context/StudentProgressContext';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { CheckCircle2, XCircle, Bookmark, ArrowRight, ChevronDown, ChevronUp, Lightbulb, RefreshCw } from 'lucide-react';

export const Quiz: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const { recordTestResult } = useStudentProgress();

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
          <Illustration name="quiz" />
        </div>
        <p className="text-sm font-bold text-indigo-600">क्विज़ लोड हो रहा है...</p>
      </div>
    );
  }

  const mcqs = paper.mcqs || [];
  if (mcqs.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto px-4">
        <HeaderBar showBack title="No MCQs" />
        <div className="w-36 mx-auto">
          <Illustration name="empty" />
        </div>
        <p className="text-sm font-bold text-slate-700">इस प्रश्न पत्र में कोई MCQ उपलब्ध नहीं है।</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  const currentQuestion: MCQ = mcqs[currentIndex];
  const totalQuestions = mcqs.length;
  const currentSelected = selectedOptions[currentIndex];
  const isCurrentSubmitted = submitted[currentIndex] || false;
  const isCurrentBookmarked = isBookmarked(currentQuestion.id);

  const handleSelectOption = (opt: string) => {
    if (isCurrentSubmitted) return;
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const handleSubmitAnswer = () => {
    if (!currentSelected) return;
    setSubmitted((prev) => ({ ...prev, [currentIndex]: true }));
    setShowExplanation((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleToggleBookmark = () => {
    if (isCurrentBookmarked) {
      removeBookmark(currentQuestion.id);
      setToast({ id: Date.now().toString(), type: 'info', message: 'बुकमार्क हटा दिया गया' });
    } else {
      saveBookmark({
        id: currentQuestion.id,
        paperId: paper.id,
        paperName: paper.paperName,
        classId: paper.class,
        subject: paper.subject,
        year: paper.year,
        type: 'mcq',
        question: currentQuestion.question,
        options: currentQuestion.options,
        answer: currentQuestion.answer,
        explanation: currentQuestion.explanation,
      });
      setToast({ id: Date.now().toString(), type: 'success', message: 'सवाल बुकमार्क में सेव हो गया' });
    }
  };

  const checkOptionCorrectness = (
    optionText: string,
    optionIdx: number,
    answerText: string
  ): boolean => {
    if (!answerText || !optionText) return false;
    const normOption = optionText.trim().toLowerCase();
    const normAnswer = answerText.trim().toLowerCase();

    // 1. Direct match
    if (normOption === normAnswer) return true;

    // 2. Option key match (A, B, C, D, E)
    const keys = ['a', 'b', 'c', 'd', 'e'];
    const optKey = keys[optionIdx];
    if (
      normAnswer === optKey ||
      normAnswer === `(${optKey})` ||
      normAnswer === `${optKey})` ||
      normAnswer === `${optKey}.`
    ) {
      return true;
    }

    // 3. Strip prefix e.g. "(D) Text" or "D. Text"
    const cleanAnswer = normAnswer.replace(/^\(?([a-e0-9])\)?[\.\:\s\-]*/i, '').trim();
    if (cleanAnswer && normOption === cleanAnswer) return true;

    return false;
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final quiz score
      let correct = 0;
      let wrong = 0;
      const answerDetails: Record<string, { selected: string; isCorrect: boolean }> = {};

      mcqs.forEach((q, idx) => {
        const sel = selectedOptions[idx] || '';
        const selOptIdx = q.options.indexOf(sel);
        const isRight = checkOptionCorrectness(sel, selOptIdx, q.answer);
        if (isRight) correct++;
        else wrong++;
        answerDetails[q.id] = { selected: sel, isCorrect: isRight };
      });

      const percentage = Math.round((correct / totalQuestions) * 100);

      const resultData = {
        paperId: paper.id,
        paperName: paper.paperName,
        subject: paper.subject,
        classId: paper.class,
        totalQuestions,
        score: correct,
        correct,
        wrong,
        percentage,
        timestamp: Date.now(),
        answers: answerDetails,
      };

      saveQuizResult(resultData);

      recordTestResult({
        id: paper.id,
        testName: paper.paperName,
        subject: paper.subject,
        classId: paper.class,
        totalQuestions,
        score: correct,
        correct,
        wrong,
        percentage,
        timestamp: Date.now(),
        timeSpentSeconds: 0,
        isMockTest: false,
      });

      navigate(`/paper/${paper.id}/quiz/result`, {
        state: { result: resultData },
      });
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar
        showBack
        title={`${paper.subject} Quiz`}
        subtitle={`Paper ${paper.paperName}`}
        rightAction={
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-2xl border transition-all active:scale-95 ${
              isCurrentBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isCurrentBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        }
      />

      {/* Progress Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          <span>सवाल {currentIndex + 1} / {totalQuestions}</span>
          <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900 text-[11px]">
            MCQ Practice
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={totalQuestions} color="indigo" />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900">
            Q{currentIndex + 1}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed flex-1">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = currentSelected === option;
            const isCorrectAnswer = checkOptionCorrectness(
              option,
              idx,
              currentQuestion.answer
            );

            let optionStyle =
              'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-300';
            let badgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

            if (isCurrentSubmitted) {
              if (isCorrectAnswer) {
                optionStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-xs';
                badgeStyle = 'bg-emerald-500 text-white';
              } else if (isSelected && !isCorrectAnswer) {
                optionStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-100 font-bold';
                badgeStyle = 'bg-rose-500 text-white';
              } else {
                optionStyle = 'opacity-60 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';
              }
            } else if (isSelected) {
              optionStyle = 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-600 text-blue-900 dark:text-blue-100 font-bold shadow-2xs ring-2 ring-blue-500/30';
              badgeStyle = 'bg-blue-600 text-white';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isCurrentSubmitted}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer active:scale-[0.99] ${optionStyle}`}
              >
                <span className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}>
                  {optionLabels[idx] || idx + 1}
                </span>

                <span className="flex-1 text-sm leading-snug">{option}</span>

                {isCurrentSubmitted && (
                  <div className="shrink-0">
                    {isCorrectAnswer ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Submit or Next Button */}
        <div className="pt-2">
          {!isCurrentSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentSelected}
              className={`w-full py-3.5 px-4 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                currentSelected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>उत्तर की जाँच करें</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentIndex < totalQuestions - 1 ? 'अगला सवाल' : 'स्कोर देखें (Result)'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Explanation Section */}
      {isCurrentSubmitted && !currentQuestion.answer && (
        <GlassCard padding="md" className="border-amber-300 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs">
          <p className="font-medium leading-relaxed">
            ⚠️ <strong>नोट:</strong> इस प्रश्न का आधिकारिक उत्तर अभी उपलब्ध नहीं है।
          </p>
        </GlassCard>
      )}

      {isCurrentSubmitted && currentQuestion.explanation && (
        <div className="rounded-3xl p-4 sm:p-5 bg-amber-50/90 dark:bg-slate-800/95 border border-amber-200/90 dark:border-slate-700 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() =>
              setShowExplanation((prev) => ({
                ...prev,
                [currentIndex]: !prev[currentIndex],
              }))
            }
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
                <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  उत्तर व्याख्या (Explanation)
                </span>
              </div>
            </div>
            <div className="p-1 rounded-lg text-amber-700 dark:text-amber-300 group-hover:bg-amber-100/70 dark:group-hover:bg-slate-700 transition-colors">
              {showExplanation[currentIndex] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showExplanation[currentIndex] && (
            <div className="pt-3 mt-2.5 border-t border-amber-200/70 dark:border-slate-700/80">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
