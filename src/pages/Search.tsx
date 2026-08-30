import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { SearchResultItem, QuestionType } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration } from '../components/ui/Illustration';
import { Search as SearchIcon, X, HelpCircle, FileText, BookOpen, ArrowRight, Filter } from 'lucide-react';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      questionRepository.searchQuestions(query).then((res) => {
        setResults(res);
        setLoading(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredResults = selectedType === 'all'
    ? results
    : results.filter((r) => r.type === selectedType);

  const typeIcons = {
    mcq: <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />,
    short: <FileText className="w-3.5 h-3.5 text-purple-500" />,
    long: <BookOpen className="w-3.5 h-3.5 text-pink-500" />,
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      <HeaderBar title="सवाल खोजें" subtitle="Global Search Across All Papers" />

      {/* Glass Search Bar Input */}
      <GlassCard padding="none" className="p-2 border-indigo-200/80 shadow-lg flex items-center gap-2">
        <div className="pl-3 text-indigo-600">
          <SearchIcon className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="सवाल या टॉपिक खोजें (जैसे: प्रकाश-संश्लेषण, DNA...)"
          className="w-full py-2.5 pr-3 bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </GlassCard>

      {/* Filter Chips */}
      {query.trim().length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {(['all', 'mcq', 'short', 'long'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                selectedType === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Results Container */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-indigo-600">खोज जारी है...</p>
        </div>
      ) : query.trim() === '' ? (
        <GlassCard padding="lg" className="text-center py-10 space-y-3">
          <div className="w-36 mx-auto">
            <Illustration name="search" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            क्या खोजना चाहते हैं?
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Biology, Physics, Chemistry, Math के प्रश्न, नियम, परिभाषाएं खोजें।
          </p>
        </GlassCard>
      ) : filteredResults.length === 0 ? (
        <GlassCard padding="lg" className="text-center py-10 space-y-3">
          <div className="w-32 mx-auto">
            <Illustration name="empty" />
          </div>
          <h3 className="text-base font-bold text-slate-700">कोई सवाल नहीं मिला</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            "{query}" से मेल खाता हुआ कोई प्रश्न नहीं मिला। स्पेलिंग जांचें या दूसरा शब्द खोजें।
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 px-1">
            {filteredResults.length} परिणाम मिले:
          </div>

          <div className="space-y-3">
            {filteredResults.map((item) => (
              <GlassCard
                key={`${item.paperId}-${item.questionId}`}
                variant="interactive"
                onClick={() => navigate(`/paper/${item.paperId}/${item.type}`)}
                className="p-4 space-y-2 border-slate-200/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {typeIcons[item.type]}
                    <span className="uppercase">{item.type}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">
                    Class {item.classId} • {item.subject}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                  {item.question}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="truncate">{item.paperName}</span>
                  <span className="flex items-center gap-1 font-bold text-indigo-600">
                    देखें <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
