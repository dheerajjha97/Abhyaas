import React from 'react';
import { RotateCcw, BookOpen, ClipboardCheck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
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

  return (
    <div
      id="previous-test-result-card"
      className={`group relative overflow-hidden rounded-2xl border border-blue-600/12 bg-white/95 dark:bg-slate-900/90 p-3.5 sm:p-4 md:p-4.5 shadow-[0_4px_20px_rgb(37,99,235,0.05)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_8px_24px_rgb(37,99,235,0.08)] hover:border-blue-600/20 ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(120% 120% at 0% 0%, rgba(239, 246, 255, 0.75) 0%, rgba(255, 255, 255, 0) 55%)',
      }}
    >
      {/* Responsive Container: Compact horizontal flow with lower height */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        
        {/* Left Section: Icon + Text Details */}
        <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4 min-w-0 flex-1">
          
          {/* Compact Rounded-Square Icon Container */}
          <div className="relative shrink-0">
            <div
              className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white shadow-[0_6px_16px_-3px_rgba(37,99,235,0.4)] transition-transform duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              }}
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25] text-white" />
            </div>
            <div
              aria-hidden="true"
              className="absolute -inset-0.5 rounded-xl bg-blue-500/20 blur-sm -z-10 opacity-70"
            />
          </div>

          {/* Content Area: Badge, Main Title, Subtitle, and Statistics */}
          <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 w-full">
            
            {/* Top Line: Badge + Title */}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-black shadow-xs tracking-wide shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                }}
              >
                <BookOpen className="w-2.5 h-2.5 text-white/90 stroke-[2.5]" />
                <span>पिछला टेस्ट</span>
              </span>
              <h3
                className="text-sm sm:text-base font-black tracking-tight text-[#0F172A] dark:text-slate-100 leading-tight truncate"
                title={test.testName}
              >
                {test.testName}
              </h3>
            </div>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs font-medium text-[#64748B] dark:text-slate-400 truncate leading-none">
              {subtitle}
            </p>

            {/* Result Statistics Row - Compact */}
            <div className="pt-0.5">
              <div className="inline-flex items-center gap-2.5 sm:gap-3.5">
                
                {/* Stat 1: Score */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-3 h-3 text-[#2563EB] dark:text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="font-semibold text-[#64748B] dark:text-slate-400 hidden xs:inline">
                      स्कोर:
                    </span>
                    <span className="font-extrabold text-[#2563EB] dark:text-blue-400">
                      {test.score}/{total} ({percentage}%)
                    </span>
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-800" />

                {/* Stat 2: Total Questions */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
                    <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="font-semibold text-[#64748B] dark:text-slate-400 hidden xs:inline">
                      प्रश्न:
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {total}
                    </span>
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-800" />

                {/* Stat 3: Correct Answers */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="font-semibold text-[#64748B] dark:text-slate-400 hidden xs:inline">
                      सही:
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {correct}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Right Section: Compact CTA Button */}
        <div className="shrink-0 w-full md:w-auto pt-1 md:pt-0">
          <button
            type="button"
            onClick={onRetake}
            className="group/btn w-full md:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 font-extrabold text-xs sm:text-sm border border-[#2563EB]/35 hover:border-[#2563EB] dark:border-blue-500/40 dark:hover:border-blue-400 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>पुनः अभ्यास</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.75] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreviousTestCard;
