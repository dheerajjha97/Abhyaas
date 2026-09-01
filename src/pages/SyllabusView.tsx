import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { syllabusRepository } from '../services/syllabusRepository';
import { SyllabusData } from '../types/syllabus';
import { BookOpen, Layers, CheckCircle2, ChevronRight, Award, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';

export const SyllabusView: React.FC = () => {
  const { classId = '12', subjectId = 'pol-science' } = useParams<{ classId: string; subjectId: string }>();
  const navigate = useNavigate();
  const { profile } = useStudentProfile();

  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    syllabusRepository.getSyllabus(classId, subjectId).then((data) => {
      if (isMounted) {
        setSyllabusData(data);
        if (data && data.units && data.units.length > 0) {
          setActiveUnitId(data.units[0].id);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [classId, subjectId]);

  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <HeaderBar title="Syllabus" subtitle="पाठ्यक्रम लोड हो रहा है..." />
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">पाठ्यक्रम सामग्री लोड हो रही है...</p>
        </div>
      </div>
    );
  }

  if (!syllabusData) {
    return (
      <div className="space-y-4 pb-24">
        <HeaderBar title="Syllabus" subtitle="पाठ्यक्रम विवरण" />
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">पाठ्यक्रम उपलब्ध नहीं है</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {subjectId} (Class {classId}) के लिए सिलेबस जल्द ही अपडेट किया जाएगा।
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer"
          >
            वापस जाएँ
          </button>
        </div>
      </div>
    );
  }

  const { syllabus, units } = syllabusData;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar
        title={`${syllabus.subjectName || subjectId} Syllabus`}
        subtitle={`Class ${syllabus.classId || classId} • ${syllabus.board || 'BSEB'} (${syllabus.academicYear || '2025-2026'})`}
      />

      {/* Hero Overview Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-3xl p-5 shadow-lg border border-white/20 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-indigo-100 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{syllabus.stream || 'Arts & Science'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black">{syllabus.title}</h1>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center">
              <span className="text-[10px] opacity-80 uppercase font-bold block">कुल अंक</span>
              <span className="text-base sm:text-lg font-black text-amber-300">{syllabus.totalMarks || 100} Marks</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center">
              <span className="text-[10px] opacity-80 uppercase font-bold block">कुल इकाइयाँ</span>
              <span className="text-base sm:text-lg font-black text-white">{units.length} Units</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 text-center">
              <span className="text-[10px] opacity-80 uppercase font-bold block">कुल अध्याय</span>
              <span className="text-base sm:text-lg font-black text-white">{syllabus.totalChapters || 15} Chap</span>
            </div>
          </div>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none">
          <BookOpen className="w-40 h-40 text-white" />
        </div>
      </div>

      {/* Units List & Accordion */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 px-1">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>इकाईवार विस्तृत पाठ्यक्रम (Unit-wise Curriculum)</span>
        </h2>

        <div className="space-y-3">
          {units.map((unit, idx) => {
            const isOpen = activeUnitId === unit.id;

            return (
              <GlassCard key={unit.id} className="p-0 overflow-hidden border border-indigo-100/60 dark:border-slate-800">
                <button
                  onClick={() => setActiveUnitId(isOpen ? null : unit.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {unit.unitNumber || idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-snug">
                        {unit.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {unit.chapters?.length || 0} अध्याय शामिल हैं
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {unit.chapters?.map((chap) => (
                      <div key={chap.id} className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-indigo-100/50 dark:border-slate-700 shadow-2xs space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
                            अध्याय {chap.chapterNumber}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {chap.title}
                          </h4>
                        </div>

                        {chap.topics && chap.topics.length > 0 && (
                          <div className="space-y-1.5 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                            {chap.topics.map((t) => (
                              <div key={t.id} className="flex items-start gap-2 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  <strong className="text-slate-900 dark:text-slate-100">{t.topicNumber}</strong> {t.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
