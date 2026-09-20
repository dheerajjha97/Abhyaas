import React from 'react';
import { ShieldCheck, BookOpen, Calculator, FlaskConical, Globe, Book } from 'lucide-react';

interface QuestionBankHeroProps {
  selectedClass: string;
  subjectName: string;
  subjectHindiName: string;
  shortCount: number;
  longCount: number;
  repeatedCount: number;
}

export const QuestionBankHero: React.FC<QuestionBankHeroProps> = ({
  selectedClass,
  subjectName,
  subjectHindiName,
  shortCount,
  longCount,
  repeatedCount,
}) => {
  // Resolve an appropriate small subject icon
  const renderSubjectIcon = () => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('math')) return <Calculator className="w-3.5 h-3.5" />;
    if (s.includes('sci') || s.includes('chem') || s.includes('phy') || s.includes('bio'))
      return <FlaskConical className="w-3.5 h-3.5" />;
    if (s.includes('soc') || s.includes('geo') || s.includes('hist') || s.includes('pol'))
      return <Globe className="w-3.5 h-3.5" />;
    return <Book className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Soft background ambient glow */}
      <div className="absolute -right-8 -top-8 w-44 h-44 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Top metadata row */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs font-bold text-blue-100">
          <span className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>100% DE-DUPLICATED</span>
          </span>
          <span className="opacity-60">•</span>
          <span>मॉडल उत्तर</span>
          <span className="opacity-60">•</span>
          <span className="font-semibold text-white">कक्षा {selectedClass}</span>
          <span className="opacity-60">•</span>
          <span className="flex items-center gap-1 text-white font-semibold">
            {renderSubjectIcon()}
            <span>{subjectHindiName || subjectName}</span>
          </span>
        </div>

        {/* Main Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
          {subjectHindiName || subjectName} मास्टर प्रश्न बैंक
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed font-medium">
          पिछले सभी वर्षों के प्रश्नपत्रों से संकलित अद्वितीय लघु एवं दीर्घ उत्तरीय प्रश्न, दोहराव-रहित और आधिकारिक मॉडल उत्तरों सहित।
        </p>

        {/* Translucent Glass Statistics Container */}
        <div className="bg-white/12 backdrop-blur-md rounded-2xl border border-white/20 p-3 sm:p-4 grid grid-cols-3 divide-x divide-white/20 text-center mt-2">
          {/* Stat 1: Short */}
          <div className="px-1 sm:px-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {shortCount}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-blue-100 mt-0.5">
              लघु उत्तरीय
            </div>
          </div>

          {/* Stat 2: Long */}
          <div className="px-1 sm:px-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {longCount}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-blue-100 mt-0.5">
              दीर्घ उत्तरीय
            </div>
          </div>

          {/* Stat 3: Repeated VVI (Accent yellow / amber) */}
          <div className="px-1 sm:px-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              {repeatedCount}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-amber-200 mt-0.5">
              रिपीटेड (VVI)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
