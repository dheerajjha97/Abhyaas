import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { PaperSummary } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { PaperCard } from '../components/ui/PaperCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration } from '../components/ui/Illustration';
import { FileText, Filter, RotateCw, BookOpen, Layers, Zap } from 'lucide-react';

export const Papers: React.FC = () => {
  const { classId = '12', subjectId = 'Biology' } = useParams<{ classId: string; subjectId: string }>();
  const navigate = useNavigate();

  const decodedSubject = decodeURIComponent(subjectId);
  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>('all');

  const fetchPapers = () => {
    setLoading(true);
    questionRepository.getPapersList(classId, decodedSubject).then((data) => {
      setPapers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPapers();
  }, [classId, decodedSubject]);

  const filteredPapers = filterYear === 'all'
    ? papers
    : papers.filter((p) => p.year.toString() === filterYear);

  const years = Array.from(new Set(papers.map((p) => p.year.toString()))).sort(
    (a, b) => Number(b) - Number(a)
  );

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar
        showBack
        title={`${decodedSubject}`}
        subtitle={`Class ${classId} • Study Resources`}
      />

      {/* Resource Tab Navigation (Papers | Mock Test | Syllabus | Notes) */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          className="py-2 px-1.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="truncate">Papers ({papers.length})</span>
        </button>
        <button
          onClick={() => navigate(`/mock-test?subject=${encodeURIComponent(decodedSubject)}`)}
          className="py-2 px-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-650 transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200/60 dark:border-slate-600"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="truncate">Mock Test</span>
        </button>
        <button
          onClick={() => navigate(`/class/${classId}/subject/${encodeURIComponent(decodedSubject)}/syllabus`)}
          className="py-2 px-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-650 transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200/60 dark:border-slate-600"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate">Syllabus</span>
        </button>
        <button
          onClick={() => navigate(`/class/${classId}/subject/${encodeURIComponent(decodedSubject)}/notes`)}
          className="py-2 px-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-650 transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200/60 dark:border-slate-600"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate">Notes</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Solved Papers Bank
            </span>
            <button
              onClick={fetchPapers}
              disabled={loading}
              title="रिफ्रेश करें"
              className="p-1 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            प्रश्न पत्र चुनें
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            वर्षवार एवं सेथवार बोर्ड मॉडल पेपर्स अभ्यास के लिए उपलब्ध हैं।
          </p>
        </div>

        <div className="w-16 shrink-0">
          <Illustration name="search" size={64} />
        </div>
      </div>

      {/* Year Filter Segmented Control */}
      {years.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 px-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterYear('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterYear === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            All Years
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setFilterYear(y)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterYear === y
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Papers List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">प्रश्न पत्र लोड हो रहे हैं...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 text-center py-10 space-y-3">
          <div className="w-24 mx-auto">
            <Illustration name="empty" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">कोई पेपर नहीं मिला</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            इस विषय का कोई प्रश्न पत्र इस वर्ष के लिए उपलब्ध नहीं है। कृपया दूसरा विषय या ऑल इयर्स चुनें।
          </p>
          <button
            onClick={fetchPapers}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            पुनः प्रयास करें (Reload)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onSelect={() => navigate(`/paper/${paper.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
