import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { PaperSummary } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { PaperCard } from '../components/ui/PaperCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration } from '../components/ui/Illustration';
import { FileText, Filter, RotateCw } from 'lucide-react';

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

  const years = Array.from(new Set(papers.map((p) => p.year.toString())));

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar
        showBack
        title={`${decodedSubject} Papers`}
        subtitle={`Class ${classId} • Board Solved Question Papers`}
      />

      {/* Header Banner */}
      <GlassCard variant="accent" padding="md" className="flex items-center justify-between gap-4 border-indigo-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
              <FileText className="w-3 h-3 text-indigo-600" /> Solved Papers Bank
            </span>
            <button
              onClick={fetchPapers}
              disabled={loading}
              title="रिफ्रेश करें"
              className="p-1 rounded-full text-indigo-600 hover:bg-white/50 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            प्रश्न पत्र चुनें
          </h2>
          <p className="text-xs text-slate-500">
            वर्षवार एवं सेथवार बोर्ड मॉडल पेपर्स अभ्यास के लिए उपलब्ध हैं।
          </p>
        </div>

        <div className="w-20 shrink-0">
          <Illustration name="search" size={75} />
        </div>
      </GlassCard>

      {/* Year Filter Segmented Control */}
      {years.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 px-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterYear('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterYear === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Years
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setFilterYear(y)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterYear === y
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
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
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-indigo-600">प्रश्न पत्र लोड हो रहे हैं...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <GlassCard padding="lg" className="text-center py-10 space-y-3">
          <div className="w-28 mx-auto">
            <Illustration name="empty" />
          </div>
          <h4 className="text-base font-bold text-slate-700">कोई पेपर नहीं मिला</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            इस विषय का कोई प्रश्न पत्र इस वर्ष के लिए उपलब्ध नहीं है। कृपया दूसरा विषय या ऑल इयर्स चुनें।
          </p>
          <button
            onClick={fetchPapers}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            पुनः प्रयास करें (Reload)
          </button>
        </GlassCard>
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
