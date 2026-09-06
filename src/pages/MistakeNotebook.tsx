import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMistakes, removeMistake, clearAllMistakes, saveBookmark } from '../utils/bookmarkStorage';
import { MistakeQuestion } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { FontControl } from '../components/ui/FontControl';
import {
  AlertCircle,
  Trash2,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react';

export const MistakeNotebook: React.FC = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<MistakeQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Practice mode state
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [practiceSelected, setPracticeSelected] = useState<Record<number, string>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<Record<number, boolean>>({});
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = () => {
    const list = getMistakes();
    setMistakes(list);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    removeMistake(id);
    loadMistakes();
    setToast({ id: Date.now().toString(), type: 'info', message: 'प्रश्न नोटबुक से हटा दिया गया' });
  };

  const handleClearAll = () => {
    if (window.confirm('क्या आप सभी गलत सवालों को नोटबुक से हटाना चाहते हैं?')) {
      clearAllMistakes();
      loadMistakes();
      setPracticeMode(false);
      setToast({ id: Date.now().toString(), type: 'info', message: 'सभी गलत सवाल साफ़ कर दिए गए' });
    }
  };

  const handleBookmark = (m: MistakeQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    saveBookmark({
      id: m.id,
      paperId: m.paperId,
      paperName: m.paperName,
      classId: m.classId,
      subject: m.subject,
      year: 2026,
      type: 'mcq',
      question: m.question,
      options: m.options,
      answer: m.correctAnswer,
      explanation: m.explanation,
    });
    setToast({ id: Date.now().toString(), type: 'success', message: 'सवाल बुकमार्क में भी सेव हो गया' });
  };

  // Unique subjects for filter
  const subjects = Array.from(new Set(mistakes.map((m) => m.subject))).filter(Boolean);

  const filteredMistakes = selectedSubject === 'all'
    ? mistakes
    : mistakes.filter((m) => m.subject === selectedSubject);

  // Font size classes
  const getQuestionFontSize = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base sm:text-lg';
    }
  };

  const getOptionFontSize = () => {
    switch (fontSize) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      default: return 'text-sm';
    }
  };

  // Practice Mode Handlers
  const currentPracticeQ = filteredMistakes[practiceIndex];

  const handlePracticeSelect = (option: string) => {
    if (practiceSubmitted[practiceIndex]) return;
    setPracticeSelected((prev) => ({ ...prev, [practiceIndex]: option }));
  };

  const handlePracticeSubmit = () => {
    setPracticeSubmitted((prev) => ({ ...prev, [practiceIndex]: true }));
  };

  const handleNextPractice = () => {
    if (practiceIndex < filteredMistakes.length - 1) {
      setPracticeIndex((prev) => prev + 1);
    } else {
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'अभ्यास पूर्ण! आपने सभी गलत सवालों का रिवीजन कर लिया।',
      });
      setPracticeMode(false);
      setPracticeIndex(0);
      setPracticeSelected({});
      setPracticeSubmitted({});
    }
  };

  const checkAnswerMatch = (opt: string, ans: string, idx: number): boolean => {
    if (!opt || !ans) return false;
    const nOpt = opt.trim().toLowerCase();
    const nAns = ans.trim().toLowerCase();
    if (nOpt === nAns) return true;
    const keys = ['a', 'b', 'c', 'd', 'e'];
    if (nAns === keys[idx] || nAns === `(${keys[idx]})` || nAns === `${keys[idx]})` || nAns === `${keys[idx]}.`) {
      return true;
    }
    const cleanAns = nAns.replace(/^\(?([a-e0-9])\)?[\.\:\s\-]*/i, '').trim();
    if (cleanAns && nOpt === cleanAns) return true;
    return false;
  };

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar
        title="गलती सुधार डायरी"
        subtitle="Mistake Notebook • ऑटोमैटिक गलत सवालों का संग्रह"
        rightAction={
          mistakes.length > 0 && (
            <button
              onClick={handleClearAll}
              title="सब साफ़ करें"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )
        }
      />

      {/* Top Banner & Control Strip */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-blue-500/10 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-blue-950/40 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-lg shrink-0">
            📖
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>गलतियों से सीखें और 100% स्कोर करें</span>
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
                {mistakes.length} प्रश्न
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              क्विज़ और मॉक टेस्ट में गलत हुए सवाल यहाँ अपने आप जुड़ जाते हैं।
            </p>
          </div>
        </div>

        {/* Font Control */}
        <FontControl fontSize={fontSize} onChangeFontSize={setFontSize} />
      </div>

      {/* Subject Filter Bar & Practice Button */}
      {mistakes.length > 0 && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              सभी ({mistakes.length})
            </button>
            {subjects.map((sub) => {
              const count = mistakes.filter((m) => m.subject === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setPracticeMode(!practiceMode);
              setPracticeIndex(0);
              setPracticeSelected({});
              setPracticeSubmitted({});
            }}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              practiceMode
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
            }`}
          >
            {practiceMode ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>सूची देखें</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>गलत सवालों की प्रैक्टिस करें</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-8 text-center py-14 space-y-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="w-36 mx-auto">
            <Illustration name="quiz" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              कोई गलत सवाल दर्ज नहीं है! 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              जब आप क्विज़ या मॉक टेस्ट हल करते हैं और कोई सवाल गलत होता है, तो वह अपने आप इस डायरी में सेव हो जाता है ताकि आप दोबारा गलती न दोहराएं।
            </p>
          </div>

          <button
            onClick={() => navigate('/mock-test')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            मॉक टेस्ट हल करें
          </button>
        </div>
      ) : practiceMode && currentPracticeQ ? (
        /* Interactive Practice Mode */
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
          {/* Practice Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              पुनः प्रयास (Re-attempt): सवाल {practiceIndex + 1} / {filteredMistakes.length}
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {currentPracticeQ.subject}
            </span>
          </div>

          {/* Question text */}
          <h3 className={`${getQuestionFontSize()} font-bold text-slate-900 dark:text-slate-100 leading-relaxed`}>
            {currentPracticeQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentPracticeQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D', 'E'][idx] || idx + 1;
              const isSelected = practiceSelected[practiceIndex] === opt;
              const isSubmitted = practiceSubmitted[practiceIndex];
              const isCorrect = checkAnswerMatch(opt, currentPracticeQ.correctAnswer, idx);

              let style = 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50';
              let badgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

              if (isSubmitted) {
                if (isCorrect) {
                  style = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-100 font-bold';
                  badgeStyle = 'bg-rose-600 text-white';
                } else {
                  style = 'opacity-60 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';
                }
              } else if (isSelected) {
                style = 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-100 font-bold ring-1 ring-blue-500';
                badgeStyle = 'bg-blue-600 text-white';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handlePracticeSelect(opt)}
                  disabled={isSubmitted}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${style}`}
                >
                  <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${badgeStyle}`}>
                    {letter}
                  </span>
                  <span className={`flex-1 ${getOptionFontSize()} leading-snug`}>{opt}</span>
                  {isSubmitted && (
                    <div className="shrink-0">
                      {isCorrect ? (
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

          {/* Action button */}
          <div className="pt-2">
            {!practiceSubmitted[practiceIndex] ? (
              <button
                onClick={handlePracticeSubmit}
                disabled={!practiceSelected[practiceIndex]}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  practiceSelected[practiceIndex]
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                उत्तर की जाँच करें
              </button>
            ) : (
              <button
                onClick={handleNextPractice}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{practiceIndex < filteredMistakes.length - 1 ? 'अगला सवाल' : 'प्रैक्टिस समाप्त'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Mistake List Cards */
        <div className="space-y-3">
          {filteredMistakes.map((item, index) => {
            const isExpanded = expandedExplanation[item.id] || false;

            return (
              <div
                key={item.id || index}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900 text-[11px]">
                      गलत हुआ सवाल #{index + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      {item.subject}
                    </span>
                    {item.paperName && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                        • {item.paperName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleBookmark(item, e)}
                      title="बुकमार्क में जोड़ें"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="इस सवाल को हटाएँ"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <h4 className={`${getQuestionFontSize()} font-bold text-slate-900 dark:text-slate-100 leading-relaxed`}>
                  {item.question}
                </h4>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/40 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                        आपका चुना हुआ उत्तर (गलत)
                      </div>
                      <div className="font-semibold text-rose-900 dark:text-rose-200 mt-0.5">
                        {item.selectedAnswer || 'कोई उत्तर नहीं दिया गया था'}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/40 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                        सही उत्तर (Correct Answer)
                      </div>
                      <div className="font-semibold text-emerald-900 dark:text-emerald-200 mt-0.5">
                        {item.correctAnswer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Explanation Accordion */}
                {item.explanation && (
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        setExpandedExplanation((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>व्याख्या (Explanation) देखें</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
