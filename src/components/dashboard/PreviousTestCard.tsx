import React from 'react';
import { RotateCcw, BookOpen, ClipboardCheck, FileText, CheckCircle2, ChevronRight, Zap, Target, Clock } from 'lucide-react';
import { TestHistoryItem } from '../../types/progress';
import { ALL_AVAILABLE_SUBJECTS } from '../../types/studentProfile';

interface PreviousTestCardProps {
  test: TestHistoryItem;
  onRetake: () => void;
  className?: string;
}

// Subject subtitle mapping (topic / chapter theme) for a rich educational aesthetic
const SUBJECT_SUBTITLES: Record<string, string> = {
  'Political Science': 'राजनीतिक सिद्धांत एवं विचारधाराएँ',
  'History': 'प्राचीन, मध्यकालीन एवं आधुनिक भारत का इतिहास',
  'Geography': 'मानव भूगोल के मूल सिद्धांत एवं भारत लोग व अर्थव्यवस्था',
  'Hindi': 'गद्य-पद्य खंड, व्याकरण एवं साहित्य बोध',
  'English': 'Reading Comprehension, Grammar & Literature',
  'Science': 'भौतिकी, रसायनशास्त्र एवं जीव विज्ञान संकलन',
  'Mathematics': 'कलन, बीजगणित, त्रिकोणमिति एवं ज्यामिति',
  'Social Science': 'इतिहास, भूगोल, अर्थशास्त्र एवं नागरिक शास्त्र',
  'Physics': 'विद्युत चुंबकत्व, प्रकाशिकी एवं आधुनिक भौतिकी',
  'Chemistry': 'कार्बनिक, अकार्बनिक एवं भौतिक रसायन',
  'Biology': 'प्रजनन, आनुवंशिकी, जैव विविधता एवं मानव कल्याण',
  'Economics': 'व्यष्टि एवं समष्टि अर्थशास्त्र के सिद्धांत',
  'Business Studies': 'प्रबंध के सिद्धांत, वित्त एवं विपणन',
  'Accountancy': 'वित्तीय विवरण, साझेदारी एवं कंपनी लेखांकन',
  'Psychology': 'मनोवैज्ञानिक प्रक्रियाएं एवं मानव व्यवहार',
  'Sociology': 'भारतीय समाज की संरचना एवं सामाजिक परिवर्तन',
  'Philosophy': 'भारतीय एवं पाश्चात्य दर्शन के मूल तत्व',
  'Home Science': 'मानव विकास, पोषण एवं पारिवारिक संसाधन प्रबंध',
  'Sanskrit': 'संस्कृत साहित्य, श्लोक एवं व्याकरण विवेक',
  'Urdu': 'उर्दू शायरी, नसर और कवायद',
  'Maithili': 'मैथिली भाषा, साहित्य एवं व्याकरण',
  'Computer Science': 'प्रोग्रामिंग, डेटाबेस एवं नेटवर्किंग सिद्धांत',
  'Agriculture': 'फसल उत्पादन, मृदा विज्ञान एवं कृषि अर्थशास्त्र',
};

// Helper to format attempt timestamp into a readable, natural date string
const formatAttemptDate = (timestamp?: number): string | null => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `आज, ${timeStr}`;
  }
  if (isYesterday) {
    return `कल, ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return `${dateStr} • ${timeStr}`;
};

export const PreviousTestCard: React.FC<PreviousTestCardProps> = ({
  test,
  onRetake,
  className = '',
}) => {
  // Determine Hindi or contextual subtitle
  const subjectOption = ALL_AVAILABLE_SUBJECTS.find(
    (s) => s.name.toLowerCase() === test.subject.toLowerCase()
  );
  const subtitle =
    SUBJECT_SUBTITLES[test.subject] ||
    (subjectOption ? `${subjectOption.hindiName} विशेष मॉक टेस्ट` : 'महत्वपूर्ण अध्याय एवं वस्तुनिष्ठ प्रश्न');

  const total = test.totalQuestions || 15;
  const correct = typeof test.correct === 'number' ? test.correct : test.score || 0;
  const percentage = Math.round(
    typeof test.percentage === 'number'
      ? test.percentage
      : total > 0
      ? (correct / total) * 100
      : 0
  );

  const attemptDateString = formatAttemptDate(test.timestamp);

  return (
    <div
      id="previous-test-result-card"
      className={`group relative overflow-hidden rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(120% 120% at 0% 0%, rgba(239, 246, 255, 0.75) 0%, rgba(255, 255, 255, 0) 55%)',
      }}
    >
      {/* Top Main Section: 1. Left Icon | 2-4. Badge, Title, Subtitle | 5. Right Retake Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        
        {/* Left Side: 1. History/Retry Icon + 2,3,4. Content Stack */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          
          {/* 1. Left side me History/retry icon */}
          <div className="relative shrink-0">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_6px_16px_-3px_rgba(37,99,235,0.35)] transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              }}
              title="पिछला टेस्ट इतिहास"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25] text-white" />
            </div>
            <div
              aria-hidden="true"
              className="absolute -inset-0.5 rounded-2xl bg-blue-500/20 blur-sm -z-10 opacity-70"
            />
          </div>

          {/* 2, 3, 4. Vertical Stack: Badge -> Date Stamp -> Main Title -> Sub Title / Topic */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            
            {/* 2. पिछला टेस्ट Badge : retry Icon के right में, title के ऊपर */}
            <div className="mb-0.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white text-[10px] sm:text-[11px] font-black shadow-2xs tracking-wide shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                }}
              >
                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[2.5]" />
                <span>पिछला टेस्ट</span>
              </span>
            </div>

            {/* Small muted date stamp below the 'Previous Test' badge */}
            {attemptDateString && (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-1 tracking-tight">
                <Clock className="w-3 h-3 text-slate-400/85 dark:text-slate-500/85 shrink-0" />
                <span>अंतिम प्रयास: {attemptDateString}</span>
              </div>
            )}

            {/* 3. Badge के ठीक नीचे: Main title */}
            <h3
              className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate"
              title={test.testName}
            >
              {test.testName}
            </h3>

            {/* 4. Main title के नीचे: Sub title or topic */}
            <p className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-snug">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 5. पुनः अभ्यास button: Card के सबसे right */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="button"
            id="previous-test-retake-btn"
            onClick={onRetake}
            className="group/btn w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 group-hover/btn:-rotate-45" />
            <span>पुनः अभ्यास</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.75] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
        </div>

      </div>

      {/* 6. Bottom Statistics Section: यह card का सबसे important information section है */}
      {/* 7. Statistics के बीच Vertical Separators */}
      <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-2.5 sm:p-3">
        <div className="flex items-center justify-between">
          
          {/* Stat 1: प्राप्तांक (Score) */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-2.5 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.25]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                स्कोर
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 leading-none">
                {test.score}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500">
                /{total}
              </span>
            </div>
          </div>

          {/* 7. Vertical Separator 1 */}
          <div className="w-[1px] h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/80 shrink-0" />

          {/* Stat 2: सही उत्तर (Correct Answers) */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-2.5 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.25]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                सही उत्तर
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 leading-none">
                {correct}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 hidden xs:inline">
                प्रश्न
              </span>
            </div>
          </div>

          {/* 7. Vertical Separator 2 */}
          <div className="w-[1px] h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/80 shrink-0" />

          {/* Stat 3: कुल प्रश्न (Total Questions) */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-2.5 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.25]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                कुल प्रश्न
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 leading-none">
                {total}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 hidden xs:inline">
                Q
              </span>
            </div>
          </div>

          {/* 7. Vertical Separator 3 */}
          <div className="w-[1px] h-8 sm:h-9 bg-slate-200 dark:bg-slate-700/80 shrink-0" />

          {/* Stat 4: परिणाम व सटीकता (Accuracy / Result Percentage) */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-2.5 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.25]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                सटीकता
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span
                className={`text-sm sm:text-base font-black leading-none ${
                  percentage >= 70
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : percentage >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {percentage}%
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 hidden md:inline">
                {percentage >= 70 ? 'उत्कृष्ट' : percentage >= 40 ? 'औसत' : 'सुधार'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PreviousTestCard;
