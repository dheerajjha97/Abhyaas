import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import {
  ChevronRight,
  BookOpen,
  Settings2,
  Sparkles,
  Zap,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  FileText,
  Layers,
  BookMarked,
  Cloud,
  Play,
  RotateCcw,
  Flame,
  Target,
  BarChart3,
  CheckSquare,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { questionRepository, normalizeSubject } from '../services/questionRepository';
import { PaperSummary } from '../types/question';
import { Badges } from '../components/dashboard/Badges';
import { Illustration } from '../components/ui/Illustration';
import { getMistakes } from '../utils/bookmarkStorage';
import { BrandLogo } from '../components/ui/BrandLogo';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setClassId, openProfileModal, currentUser, cloudSyncStatus } = useStudentProfile();
  const { progress } = useStudentProgress();

  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'subjectMastery' | 'recentTests'>('overview');

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
    { id: '10', title: 'Class 10', emoji: '🎒', label: '10वीं बोर्ड' },
    { id: '11', title: 'Class 11', emoji: '📚', label: '11वीं' },
    { id: '12', title: 'Class 12', emoji: '🎓', label: '12वीं बोर्ड' },
  ];

  // Helper to count papers for a subject accurately
  const getSubjectPaperCount = (subjectName: string): number => {
    const normTarget = normalizeSubject(subjectName).toLowerCase();
    return papers.filter((p) => {
      const normP = normalizeSubject(p.subject).toLowerCase();
      return normP === normTarget;
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

  const displayedSubjects =
    studentClassSubjects.length > 0 ? studentClassSubjects : classAvailableSubjects.slice(0, 5);

  // Calculate today's solved questions from test history
  const todayStr = new Date().toISOString().split('T')[0];
  const questionsToday = progress.recentHistory
    .filter((t) => new Date(t.timestamp).toISOString().split('T')[0] === todayStr)
    .reduce((sum, t) => sum + (t.totalQuestions || 0), 0);
  const dailyGoalTarget = 20;
  const goalProgressPercent = Math.min(100, Math.round((questionsToday / dailyGoalTarget) * 100));

  // Time-aware dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'सुप्रभात', emoji: '🌅', subtitle: 'ताज़ा दिमाग से आज का पहला अभ्यास शुरू करें' };
    if (hour < 17) return { text: 'शुभ दोपहर', emoji: '☀️', subtitle: 'दोपहर के अभ्यास से अपनी तैयारी मजबूत करें' };
    return { text: 'शुभ संध्या', emoji: '🌙', subtitle: 'आज का 20 प्रश्नों का अभ्यास लक्ष्य पूरा करें' };
  };
  const greeting = getGreeting();
  const lastRecentTest = progress.recentHistory && progress.recentHistory.length > 0 ? progress.recentHistory[0] : null;

  return (
    <div className="space-y-4 sm:space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Top AppBar (Mobile only) with brand logo, greeting & sync */}
      <div className="md:hidden bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandLogo size="md" rounded="rounded-2xl" className="border border-slate-200 dark:border-slate-700 shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Abhyaas
              </h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-full border border-blue-200 dark:border-blue-900">
                PYQ
              </span>
            </div>

            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {greeting.emoji} {greeting.text}, {profile.name || 'विद्यार्थी'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile, Cloud Sync Status & Settings Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={openProfileModal}
            className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-sm font-bold shadow-2xs cursor-pointer"
            title="कक्षा व विषय बदलें"
          >
            {profile.avatarEmoji || '🎓'}
          </button>

          <button
            onClick={openProfileModal}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title={currentUser ? `क्लाउड सिंक: ${currentUser.email}` : 'क्लाउड सिंक'}
          >
            <Cloud
              className={`w-3 h-3 ${
                currentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            />
            <span>{currentUser ? 'Synced' : 'Sync'}</span>
          </button>

          <button
            onClick={() => navigate('/more')}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
            title="सेटिंग्स व अधिक विकल्प"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Elegant Bento Grid: Royal Hero Mock Test Generator & Daily Study Goal Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
        {/* Prominent Subject Mock Test Generator Hero Card */}
        <div
          className="md:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(145deg, #1d4ed8 0%, #1e1b4b 60%, #090d16 100%)',
            backgroundColor: '#0f172a',
          }}
        >
          <div className="relative z-10 space-y-3">
            {/* Header with PYQ App logo badge & live test tag */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                <span>ओरिजिनल PYQ लाइव टेस्ट</span>
              </div>

              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/25 shadow-xs">
                <BrandLogo size={24} rounded="rounded-md" showShadow={false} />
                <span className="text-[11px] font-black text-white tracking-wide">
                  Abhyaas PYQ
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black leading-snug text-white tracking-tight">
                विषय चुनें और तुरंत नया मॉक टेस्ट जनरेट करें!
              </h2>
              <p className="text-xs text-blue-100 mt-1 max-w-md leading-relaxed font-medium">
                बोर्ड परीक्षा के ओरिजिनल प्रश्न पत्रों से रैंडम क्विज़ हल करें, रियल OMR टाइमर से प्रैक्टिस करें और परिणाम सुरक्षित रखें।
              </p>
            </div>

            {/* Quick Subject Launch Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
              {displayedSubjects.slice(0, 6).map((sub) => (
                <button
                  key={sub.name}
                  onClick={() =>
                    navigate(`/mock-test?subject=${encodeURIComponent(sub.name)}`)
                  }
                  className="px-3 py-1.5 rounded-full text-white text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 active:scale-95"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                  }}
                >
                  <span>{sub.emoji}</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>

            {/* Big Launch Button */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => navigate('/mock-test')}
                className="flex-1 py-3 px-4 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/40"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                }}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>कस्टम टेस्ट जनरेट करें</span>
              </button>
              <button
                onClick={() => navigate(`/class/${profile.classId}/subjects`)}
                className="py-3 px-3.5 rounded-2xl text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center border border-white/20 active:scale-95"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                }}
                title="सभी विषय देखें"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Daily Goal / दैनिक अभ्यास लक्ष्य Card (Refined with Circular Progress Visual) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                  <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>दैनिक अभ्यास लक्ष्य</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                  आज का टारगेट
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[210px]">
                  {questionsToday >= dailyGoalTarget
                    ? '🎉 आज का लक्ष्य पूर्ण! उत्कृष्ट निरंतरता!'
                    : questionsToday > 0
                    ? `लक्ष्य पूरा करने के लिए केवल ${dailyGoalTarget - questionsToday} प्रश्न और हल करें!`
                    : 'रोज़ 20 प्रश्न हल करके परीक्षा में टॉप रैंक पक्की करें'}
                </p>
              </div>

              {/* Circular Gauge Ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36"
                    cy="36"
                    r="28"
                    strokeWidth="6"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    fill="none"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="28"
                    strokeWidth="6"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * goalProgressPercent) / 100}
                    strokeLinecap="round"
                    className="stroke-blue-600 transition-all duration-1000 ease-out"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                    {questionsToday}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase leading-none mt-0.5">
                    /{dailyGoalTarget} हल
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Mini Stats Strip */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  🔥
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {progress.studyStreakDays} दिन
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    स्ट्रीक
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  🎯
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {progress.accuracy}%
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    सटीकता
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {goalProgressPercent}% पूर्ण
            </span>
            <button
              onClick={() =>
                navigate(
                  `/mock-test?subject=${encodeURIComponent(
                    displayedSubjects[0]?.name || 'Hindi'
                  )}&type=quick`
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>क्विक स्पीड टेस्ट</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resume Practice (जहाँ छोड़ा था, वहीं से शुरू करें) if recent history exists */}
      {lastRecentTest && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl p-3.5 border border-blue-200/70 dark:border-blue-900/50 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.2 rounded-full">
                  पिछला टेस्ट
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {lastRecentTest.testName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                स्कोर: {lastRecentTest.score}/{lastRecentTest.totalQuestions} ({lastRecentTest.percentage}%) • {new Date(lastRecentTest.timestamp).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/mock-test?subject=${encodeURIComponent(lastRecentTest.subject)}`)
            }
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>पुनः अभ्यास</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4-Card Bento Study Hub (Modern Clean Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => navigate('/mock-test')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col items-center text-center cursor-pointer group hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Illustration name="mocktest" size={44} />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Mock Tests
          </span>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
            लाइव टेस्ट
          </span>
        </button>

        <button
          onClick={() => navigate(`/class/${profile.classId}/subjects`)}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col items-center text-center cursor-pointer group hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Illustration name="papers" size={44} />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Solved Papers
          </span>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
            {papers.length} उपलब्ध
          </span>
        </button>

        <button
          onClick={() =>
            navigate(
              `/class/${profile.classId}/subject/${encodeURIComponent(
                displayedSubjects[0]?.name || 'History'
              )}/syllabus`
            )
          }
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col items-center text-center cursor-pointer group hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Illustration name="syllabus" size={44} />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Syllabus
          </span>
          <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
            पाठ्यक्रम
          </span>
        </button>

        <button
          onClick={() =>
            navigate(
              `/class/${profile.classId}/subject/${encodeURIComponent(
                displayedSubjects[0]?.name || 'Political Science'
              )}/notes`
            )
          }
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col items-center text-center cursor-pointer group hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Illustration name="notes" size={44} />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Chapter Notes
          </span>
          <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
            अध्याय नोट्स
          </span>
        </button>
      </div>

      {/* Student Progress & Performance Analytics Card (Firestore Synced) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none">
                आपकी प्रगति रिपोर्ट (Student Progress)
              </h3>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser ? '☁️ क्लाउड में सुरक्षित (Firestore Auto-Sync)' : '💾 डिवाइस में सुरक्षित • लॉगिन पर ऑटो सिंक'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold border border-slate-200/70 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ओवरव्यू
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'badges'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Award className="w-3 h-3 text-amber-500" />
              <span>बैज</span>
            </button>
            <button
              onClick={() => setActiveTab('subjectMastery')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'subjectMastery'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              विषयवार
            </button>
            <button
              onClick={() => setActiveTab('recentTests')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'recentTests'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              टेस्ट ({progress.recentHistory.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview Progress Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Accuracy Rate */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-center shadow-xs">
                <div className="text-base sm:text-xl font-black text-blue-700 dark:text-blue-300">
                  {progress.accuracy}%
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  सटीकता
                </div>
              </div>

              {/* Questions Solved */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center shadow-xs">
                <div className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {progress.totalQuestionsSolved}
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  हल प्रश्न
                </div>
              </div>

              {/* Tests Completed */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center shadow-xs">
                <div className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-200">
                  {progress.testsCompleted}
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  मॉक टेस्ट
                </div>
              </div>

              {/* Study Streak */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-center shadow-xs">
                <div className="text-base sm:text-xl font-black text-amber-700 dark:text-amber-300 flex items-center justify-center gap-0.5">
                  <span>{progress.studyStreakDays}</span>
                  <span className="text-xs">🔥</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  दिन स्ट्रीक
                </div>
              </div>
            </div>

            {/* Mistake Notebook Quick Access Banner */}
            {getMistakes().length > 0 && (
              <div
                onClick={() => navigate('/mistakes')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center font-black text-sm shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>गलती सुधार डायरी (Mistake Notebook)</span>
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                        {getMistakes().length} सवाल
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      गलत हुए सवालों को दोबारा हल करके 100% तैयारी करें
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            )}

            {/* Badges Preview in Student Overview */}
            <Badges compact onViewAll={() => setActiveTab('badges')} />
          </div>
        )}

        {/* Tab 2: Virtual Badges Component */}
        {activeTab === 'badges' && (
          <Badges defaultExpanded={true} />
        )}

        {/* Tab 2: Subject-wise Mastery Progress */}
        {activeTab === 'subjectMastery' && (
          <div className="space-y-2 pt-1">
            {displayedSubjects.map((sub) => {
              const subStat = progress.subjectStats[sub.name] || {
                attempted: 0,
                correct: 0,
                accuracy: 0,
                testsCount: 0,
              };

              return (
                <div
                  key={sub.name}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{sub.emoji}</span>
                    <div className="truncate">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {subStat.attempted} प्रश्न हल • {subStat.testsCount} टेस्ट पूर्ण
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-blue-600 dark:text-blue-400">
                        {subStat.accuracy}%
                      </div>
                      <div className="text-[9px] text-slate-400">सटीकता</div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/mock-test?subject=${encodeURIComponent(sub.name)}`)
                      }
                      className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 active:scale-95 cursor-pointer shadow-2xs transition-transform"
                    >
                      टेस्ट दें
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Recent Test History */}
        {activeTab === 'recentTests' && (
          <div className="space-y-2 pt-1">
            {progress.recentHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <p>आपने अभी तक कोई मॉक टेस्ट नहीं दिया है।</p>
                <button
                  onClick={() => navigate('/mock-test')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>पहला टेस्ट अभी शुरू करें</span>
                </button>
              </div>
            ) : (
              progress.recentHistory.slice(0, 4).map((test) => (
                <div
                  key={test.id}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {test.testName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(test.timestamp).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                      })} • {test.totalQuestions} प्रश्न
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-xl font-black text-[11px] ${
                        test.percentage >= 70
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : test.percentage >= 40
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {test.percentage}% ({test.score}/{test.totalQuestions})
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/mock-test?subject=${encodeURIComponent(test.subject)}`)
                      }
                      className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                      title="पुनः टेस्ट दें"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Student Selected Subjects with Dual Quick Actions (Flutter ListTiles) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-black">
              मेरे चुने हुए विषय ({displayedSubjects.length})
            </h3>
          </div>

          <button
            onClick={openProfileModal}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-800"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>विषय बदलें</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayedSubjects.map((sub) => {
            const paperCount = getSubjectPaperCount(sub.name);
            const subStat = progress.subjectStats[sub.name];

            return (
              <div
                key={sub.name}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all group"
              >
                <div
                  onClick={() =>
                    navigate(
                      `/class/${profile.classId}/subject/${encodeURIComponent(sub.name)}/papers`
                    )
                  }
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  {(() => {
                    const norm = sub.name.toLowerCase();
                    const illName = norm.includes('hist')
                      ? 'history'
                      : norm.includes('geo')
                      ? 'geography'
                      : norm.includes('pol')
                      ? 'polscience'
                      : norm.includes('bio')
                      ? 'biology'
                      : norm.includes('phys')
                      ? 'physics'
                      : norm.includes('math')
                      ? 'math'
                      : norm.includes('chem')
                      ? 'chemistry'
                      : null;

                    return illName ? (
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-slate-200/70 dark:border-slate-700/60 overflow-hidden group-hover:scale-105 transition-transform bg-slate-50 dark:bg-slate-800 p-0.5">
                        <Illustration name={illName as any} size={42} />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 ${sub.bg} rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs border border-slate-200/60 dark:border-slate-700`}
                      >
                        {sub.emoji}
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({sub.hindiName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap">
                      <span className="text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {paperCount} Solved Papers
                      </span>
                      {subStat && subStat.attempted > 0 && (
                        <span className="text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/60">
                          {subStat.accuracy}% स्कोर
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dual Quick Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      navigate(
                        `/class/${profile.classId}/subject/${encodeURIComponent(sub.name)}/papers`
                      )
                    }
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-200/70 dark:border-slate-700 shadow-xs active:scale-95"
                    title="पेपर्स देखें"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/mock-test?subject=${encodeURIComponent(sub.name)}`)
                    }
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="इस विषय का नया मॉक टेस्ट जनरेट करें"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>टेस्ट</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

