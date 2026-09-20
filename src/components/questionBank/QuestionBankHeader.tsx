import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrawer } from '../../context/DrawerContext';

interface QuestionBankHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
  title = 'Question Bank',
  subtitle = 'विषयवार प्रश्न बैंक',
  onBack,
}) => {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 transition-colors">
      {/* Left: Circular / Rounded Back Button */}
      <button
        onClick={handleBack}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700/60"
        aria-label="पीछे जाएं"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Center/Left: Title & Subtitle */}
      <div className="flex-1 min-w-0 px-1">
        <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate leading-tight">
          {title} <span className="font-bold text-slate-500 dark:text-slate-400 hidden xs:inline">({subtitle})</span>
        </h1>
        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
          सभी वर्षों के यूनिक लघु एवं दीर्घ उत्तरीय प्रश्नोत्तर (बिना दोहराव)
        </p>
      </div>

      {/* Right: Rounded Hamburger / Menu Button */}
      <button
        onClick={openDrawer}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700/60"
        aria-label="मेनू खोलें"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
};
