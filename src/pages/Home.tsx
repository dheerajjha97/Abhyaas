import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { ChevronRight, BookOpen, Settings2, Sparkles, User, PlusCircle, FileText, Layers, BookMarked } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { questionRepository, normalizeSubject } from '../services/questionRepository';
import { PaperSummary } from '../types/question';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setClassId, openProfileModal } = useStudentProfile();
  const [papers, setPapers] = useState<PaperSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    questionRepository.getPapersList(profile.classId).then((data) => {
      if (isMounted) {
        setPapers(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [profile.classId]);

  const classPills = [
    { id: '10', title: 'Class 10', emoji: '🎒' },
    { id: '11', title: 'Class 11', emoji: '📚' },
    { id: '12', title: 'Class 12', emoji: '🎓' },
  ];

  // Helper to count papers for a subject accurately
  const getSubjectPaperCount = (subjectName: string): number => {
    const normTarget = normalizeSubject(subjectName).toLowerCase();
    return papers.filter((p) => {
      const normP = normalizeSubject(p.subject).toLowerCase();
      return (
        normP === normTarget ||
        normP.includes(normTarget) ||
        normTarget.includes(normP) ||
        p.subject.toLowerCase() === subjectName.toLowerCase()
      );
    }).length;
  };

  // Filter available subjects for the currently selected class
  const classAvailableSubjects = ALL_AVAILABLE_SUBJECTS.filter((sub) =>
    sub.classes.includes(profile.classId)
  );

  // Filter subjects chosen by student that belong to this class
  const studentClassSubjects = classAvailableSubjects.filter((sub) =>
    profile.selectedSubjects.includes(sub.name)
  );

  // Fallback: if student selected no subjects in this class yet, show available ones
  const displayedSubjects =
    studentClassSubjects.length > 0 ? studentClassSubjects : classAvailableSubjects.slice(0, 4);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Student Profile Quick Header */}
      <div className="flex items-center justify-between px-1 pt-2 pb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={openProfileModal}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
            title="प्रोफ़ाइल बदलें"
          >
            {profile.avatarEmoji || '🎓'}
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-indigo-950 dark:text-indigo-200 tracking-tight leading-tight">
                नमस्ते, {profile.name || 'विद्यार्थी'}!
              </h1>
              <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-600/90 dark:text-indigo-400/90 flex items-center gap-1">
              <span>Class {profile.classId}</span>
              <span>•</span>
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{profile.board}</span>
            </p>
          </div>
        </div>

        {/* Profile Settings Button */}
        <button
          onClick={openProfileModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] shadow-2xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>प्रोफ़ाइल</span>
        </button>
      </div>

      {/* Hero Glass Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 rounded-3xl p-5 shadow-lg relative overflow-hidden border border-white/20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-100 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" /> Class {profile.classId} Board Practice
          </div>
          <h2 className="text-white text-xl sm:text-2xl font-black leading-tight">
            आज क्या पढ़ना है?
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 mb-4 opacity-90 max-w-[260px]">
            आपके चुने हुए <strong>{displayedSubjects.length} विषयों</strong> के सभी मॉडल पेपर एवं क्विज़ तैयार हैं।
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(`/class/${profile.classId}/subjects`)}
              className="bg-white text-indigo-700 font-extrabold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>सभी विषय देखें</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={openProfileModal}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-2.5 rounded-2xl text-xs backdrop-blur-md transition-all cursor-pointer"
            >
              विषय बदलें
            </button>
          </div>
        </div>

        {/* Hero Background Illustration */}
        <div className="absolute right-[-10px] bottom-[-10px] opacity-20 pointer-events-none">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      {/* Quick Study Resources Grid (Syllabus, Revision Notes, Solved Papers) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => navigate(`/class/${profile.classId}/subject/History/syllabus`)}
          className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">Syllabus</span>
          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">पाठ्यक्रम</span>
        </button>

        <button
          onClick={() => navigate(`/class/${profile.classId}/subject/Political%20Science/notes`)}
          className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-purple-100 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">Revision Notes</span>
          <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">अध्याय नोट्स</span>
        </button>

        <button
          onClick={() => navigate(`/class/${profile.classId}/subjects`)}
          className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">Solved Papers</span>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{papers.length} उपलब्ध</span>
        </button>
      </div>

      {/* Class Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5">
            <span>अपनी Class चुनें</span>
            <span className="text-[10px] font-semibold text-slate-400">(Tap to switch)</span>
          </h3>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
            Active: Class {profile.classId}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {classPills.map((cls) => {
            const isSelected = profile.classId === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => setClassId(cls.id)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-extrabold scale-[1.02]'
                    : 'bg-white/70 dark:bg-slate-800/70 border-white/50 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-white/90'
                }`}
              >
                <span className="text-xl mb-1">{cls.emoji}</span>
                <span className="text-xs font-bold">{cls.title}</span>
                {isSelected && (
                  <span className="text-[9px] bg-white/25 px-2 py-0.5 rounded-full mt-1 font-medium">
                    चयनित
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Selected Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold">
              मेरे चुने हुए विषय (My Subjects)
            </h3>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
              {displayedSubjects.length}
            </span>
          </div>

          <button
            onClick={openProfileModal}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>विषय बदलें</span>
          </button>
        </div>

        <div className="space-y-3">
          {displayedSubjects.map((sub) => {
            const paperCount = getSubjectPaperCount(sub.name);
            return (
              <div
                key={sub.name}
                onClick={() =>
                  navigate(
                    `/class/${profile.classId}/subject/${encodeURIComponent(sub.name)}/papers`
                  )
                }
                className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/60 dark:border-slate-800/80 p-3.5 sm:p-4 rounded-3xl flex items-center gap-3.5 shadow-xs hover:shadow-md hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 ${sub.bg} rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform`}
                >
                  {sub.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {sub.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      ({sub.hindiName})
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    {paperCount > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {paperCount} {paperCount === 1 ? 'Solved Paper' : 'Solved Papers'} उपलब्ध
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                        शीघ्र उपलब्ध (0 Papers अभी)
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 p-2 rounded-full text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Banner */}
      <GlassCard variant="solid" className="p-4 flex items-center justify-between gap-4 border-white/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              ऑफ़लाइन सपोर्ट उपलब्ध
            </h5>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              अभ्यास ऐप बिना इंटरनेट के भी सहेजे गए पेपर और क्विज़ दिखाता है।
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
