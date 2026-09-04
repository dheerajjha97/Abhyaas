import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { syllabusRepository } from '../services/syllabusRepository';
import { SyllabusData } from '../types/syllabus';
import { BookOpen, Layers, CheckCircle2, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';

export const SyllabusView: React.FC = () => {
  const { classId: paramClassId, subjectId: paramSubjectId } = useParams<{ classId?: string; subjectId?: string }>();
  const navigate = useNavigate();
  const { profile } = useStudentProfile();

  const classId = paramClassId || profile.classId || '12';
  const availableSubjects = ALL_AVAILABLE_SUBJECTS.filter((sub) => sub.classes.includes(classId));
  const initialSubject = paramSubjectId 
    ? decodeURIComponent(paramSubjectId) 
    : (profile.selectedSubjects[0] || availableSubjects[0]?.name || 'pol-science');

  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (paramSubjectId) {
      setSelectedSubject(decodeURIComponent(paramSubjectId));
    }
  }, [paramSubjectId]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    syllabusRepository.getSyllabus(classId, selectedSubject).then((data) => {
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
  }, [classId, selectedSubject]);

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <HeaderBar
        showBack={Boolean(paramSubjectId)}
        title="पाठ्यक्रम (Syllabus)"
        subtitle={`Class ${classId} • Board Curriculum`}
      />

      {/* Horizontal Subject Switcher Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
        {availableSubjects.map((sub) => {
          const isSelected =
            selectedSubject.toLowerCase() === sub.name.toLowerCase() ||
            selectedSubject.toLowerCase() === sub.id.toLowerCase();
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.name)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
              }`}
            >
              <span>{sub.emoji}</span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">पाठ्यक्रम लोड हो रहा है...</p>
        </div>
      ) : !syllabusData ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 text-center space-y-3 shadow-2xs">
          <AlertCircle className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
            {selectedSubject} का पाठ्यक्रम जल्द उपलब्ध होगा
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Class {classId} के लिए {selectedSubject} का पाठ्यक्रम तैयार किया जा रहा है। कृपया अन्य विषय चुनें।
          </p>
          <div className="pt-1 flex justify-center gap-2">
            <button
              onClick={() => setSelectedSubject('Political Science')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Political Science पाठ्यक्रम देखें
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Overview Card (Clean High-Contrast Surface) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-900 px-3 py-1 rounded-full text-[10px] font-bold text-blue-700 dark:text-blue-300">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{syllabusData.syllabus.stream || 'Arts & Science'}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {syllabusData.syllabus.board || 'BSEB'} • {syllabusData.syllabus.academicYear || '2025-2026'}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {syllabusData.syllabus.title}
            </h1>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-center border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">कुल अंक</span>
                <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                  {syllabusData.syllabus.totalMarks || 100} Marks
                </span>
                {syllabusData.syllabus.practicalMarks ? (
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block -mt-0.5">
                    ({syllabusData.syllabus.theoryMarks || 70} Th + {syllabusData.syllabus.practicalMarks} Pr)
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block -mt-0.5">
                    (100 थ्योरी)
                  </span>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-center border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">कुल इकाइयाँ</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">{syllabusData.units.length} Units</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-center border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">कुल अध्याय</span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">{syllabusData.syllabus.totalChapters || 15} Chap</span>
              </div>
            </div>
          </div>

          {/* Units List & Accordion */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>इकाईवार विस्तृत पाठ्यक्रम (Unit-wise Curriculum)</span>
            </h2>

            <div className="space-y-3">
              {syllabusData.units.map((unit, idx) => {
                const isOpen = activeUnitId === unit.id;

                return (
                  <div key={unit.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
                    <button
                      onClick={() => setActiveUnitId(isOpen ? null : unit.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 dark:border-blue-900">
                          {unit.unitNumber || idx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
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
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {unit.chapters?.map((chap) => (
                          <div key={chap.id} className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold border border-blue-100 dark:border-blue-900">
                                अध्याय {chap.chapterNumber}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {chap.title}
                              </h4>
                            </div>

                            {chap.topics && chap.topics.length > 0 && (
                              <div className="space-y-1.5 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                                {chap.topics.map((t) => (
                                  <div key={t.id} className="flex items-start gap-2 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
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
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
