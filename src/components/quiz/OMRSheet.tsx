import React from 'react';

interface OMRSheetProps {
  totalQuestions: number;
  selectedOptions: Record<number, string>;
  optionsList: string[][];
  currentIndex: number;
  submitted?: Record<number, boolean>;
  correctAnswers?: string[];
  onSelectOption: (questionIndex: number, option: string) => void;
  onNavigateToQuestion: (index: number) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const OMRSheet: React.FC<OMRSheetProps> = ({
  totalQuestions,
  selectedOptions,
  optionsList,
  currentIndex,
  submitted = {},
  correctAnswers = [],
  onSelectOption,
  onNavigateToQuestion,
}) => {
  const answeredCount = Object.keys(selectedOptions).filter((k) => Boolean(selectedOptions[Number(k)])).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
            OMR
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
              डिजिटल OMR उत्तर पुस्तिका (Answer Sheet)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              बोर्ड परीक्षा की तरह सीधे गोले (A, B, C, D) टच करके भरें
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            भरे गए: <strong className="text-blue-600 dark:text-blue-400">{answeredCount}</strong> / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Bubble Grid: 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
        {Array.from({ length: totalQuestions }).map((_, qIdx) => {
          const isCurrent = qIdx === currentIndex;
          const currentSelected = selectedOptions[qIdx];
          const qOptions = optionsList[qIdx] || [];
          const isSubmitted = submitted[qIdx] || false;
          const correctAnswer = correctAnswers[qIdx];

          return (
            <div
              key={qIdx}
              onClick={() => onNavigateToQuestion(qIdx)}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isCurrent
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-2xs'
                  : 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/70'
              }`}
            >
              {/* Question Number */}
              <div className="flex items-center gap-1 min-w-[36px]">
                <span
                  className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : currentSelected
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {qIdx + 1}
                </span>
              </div>

              {/* OMR Circles (A, B, C, D) */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {OPTION_LETTERS.map((letter, optIdx) => {
                  const optionText = qOptions[optIdx];
                  // If question has fewer options
                  if (!optionText && qOptions.length > 0 && optIdx >= qOptions.length) {
                    return null;
                  }

                  const isBubbleSelected =
                    currentSelected === optionText ||
                    currentSelected === letter ||
                    currentSelected?.toLowerCase() === letter.toLowerCase();

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => onSelectOption(qIdx, optionText || letter)}
                      title={`प्रश्न ${qIdx + 1}: विकल्प (${letter})`}
                      className={`w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center transition-all select-none cursor-pointer ${
                        isBubbleSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-slate-900 dark:ring-white scale-105 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:border-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instruction Footnote */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>💡 किसी भी नंबर पर क्लिक करके उस सवाल पर जा सकते हैं</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">ब्लैक/डार्क सर्कल = भरा हुआ गोला</span>
      </div>
    </div>
  );
};
