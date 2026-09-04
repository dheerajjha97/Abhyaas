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

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setClassId, openProfileModal, currentUser, cloudSyncStatus } = useStudentProfile();
  const { progress } = useStudentProgress();

  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjectMastery' | 'recentTests'>('overview');

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

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Flutter Material 3 Top AppBar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={openProfileModal}
            className="relative w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-2xl shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 text-white"
            title="प्रोफ़ाइल व सेटिंग्स"
          >
            {profile.avatarEmoji || '🎓'}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
                नमस्ते, {profile.name || 'विद्यार्थी'}!
              </h1>
              <span className="text-sm shrink-0">👋</span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                Class {profile.classId} {profile.classId !== '10' && `• ${profile.stream || 'Arts'}`}
              </span>

              {progress.studyStreakDays > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {progress.studyStreakDays} दिन स्ट्रीक
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Status & Settings Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={openProfileModal}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-bold shadow-2xs transition-all cursor-pointer ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title={currentUser ? `क्लाउड सिंक सक्रिय: ${currentUser.email}` : 'क्लाउड सिंक के लिए लॉगिन करें'}
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                currentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            />
            <span className="text-[10px] hidden sm:inline">
              {currentUser ? 'Cloud Synced' : 'Sync'}
            </span>
          </button>

          <button
            onClick={openProfileModal}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700"
            title="सेटिंग्स व प्रोफ़ाइल"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Goal / दैनिक अभ्यास लक्ष्य Card (Clean M3 Solid Surface) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  दैनिक अभ्यास लक्ष्य
                </span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.2 rounded-full border border-blue-200/70 dark:border-blue-800">
                  {questionsToday} / {dailyGoalTarget} प्रश्न
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {questionsToday >= dailyGoalTarget
                  ? '🎉 आज का लक्ष्य पूर्ण! उत्कृष्ट निरंतरता!'
                  : questionsToday > 0
                  ? `लक्ष्य पूरा करने के लिए केवल ${dailyGoalTarget - questionsToday} प्रश्न और हल करें!`
                  : 'रोज़ 20 प्रश्न हल करके परीक्षा में टॉप रैंक पक्की करें'}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(
                `/mock-test?subject=${encodeURIComponent(
                  displayedSubjects[0]?.name || 'Hindi'
                )}&type=quick`
              )
            }
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer shrink-0 transition-transform"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>स्पीड टेस्ट</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${goalProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Class Segmented Selector (Flutter Material 3 SegmentedButton) */}
      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-slate-900 dark:text-slate-100">
            कक्षा चुनें (Select Class)
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-200/70 dark:border-blue-900">
              सक्रिय: Class {profile.classId} {profile.classId !== '10' && `(${profile.stream})`}
            </span>
            <button
              onClick={openProfileModal}
              className="text-[10px] font-bold text-slate-500 hover:text-blue-600 underline cursor-pointer ml-1"
            >
              बदलें
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {classPills.map((cls) => {
            const isSelected = profile.classId === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => setClassId(cls.id)}
                className={`py-2 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{cls.emoji}</span>
                <span className="text-xs font-bold mt-0.5">{cls.title}</span>
                <span
                  className={`text-[9px] ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {cls.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Subject Mock Test Generator Hero Card (Clean Deep Slate / Navy) */}
      <div className="p-5 rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            ओरिजिनल पेपर्स आधारित लाइव टेस्ट
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white">
              विषय चुनें और तुरंत नया मॉक टेस्ट जनरेट करें!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
              बोर्ड परीक्षा के ओरिजिनल प्रश्न पत्रों से रैंडम क्विज़ जनरेट करें, टाइमर के साथ हल करें और परिणाम सुरक्षित रखें।
            </p>
          </div>

          {/* Quick Subject Launch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            {displayedSubjects.slice(0, 5).map((sub) => (
              <button
                key={sub.name}
                onClick={() =>
                  navigate(`/mock-test?subject=${encodeURIComponent(sub.name)}`)
                }
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer border border-white/15"
              >
                <span>{sub.emoji}</span>
                <span>{sub.name}</span>
              </button>
            ))}
          </div>

          {/* Big Launch Button */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => navigate('/mock-test')}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>कस्टम टेस्ट जनरेट करें</span>
            </button>
            <button
              onClick={() => navigate(`/class/${profile.classId}/subjects`)}
              className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center border border-white/15"
              title="सभी विषय देखें"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card Flutter Bento Study Hub (Clean, Calm Educational Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => navigate('/mock-test')}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-amber-200/60 dark:border-amber-900">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Mock Tests
          </span>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            लाइव टेस्ट
          </span>
        </button>

        <button
          onClick={() => navigate(`/class/${profile.classId}/subjects`)}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-blue-200/60 dark:border-blue-900">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Solved Papers
          </span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
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
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Syllabus
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
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
          className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700">
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            Chapter Notes
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            अध्याय नोट्स
          </span>
        </button>
      </div>

      {/* Student Progress & Performance Analytics Card (Firestore Synced) */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 shrink-0">
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

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ओवरव्यू
            </button>
            <button
              onClick={() => setActiveTab('subjectMastery')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'subjectMastery'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              विषयवार
            </button>
            <button
              onClick={() => setActiveTab('recentTests')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'recentTests'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              टेस्ट ({progress.recentHistory.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview Progress Metrics */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Accuracy Rate */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-center">
              <div className="text-base sm:text-xl font-black text-blue-700 dark:text-blue-300">
                {progress.accuracy}%
              </div>
              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                सटीकता
              </div>
            </div>

            {/* Questions Solved */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-center">
              <div className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-300">
                {progress.totalQuestionsSolved}
              </div>
              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                हल प्रश्न
              </div>
            </div>

            {/* Tests Completed */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-200">
                {progress.testsCompleted}
              </div>
              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                मॉक टेस्ट
              </div>
            </div>

            {/* Study Streak */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-center">
              <div className="text-base sm:text-xl font-black text-amber-700 dark:text-amber-300 flex items-center justify-center gap-0.5">
                <span>{progress.studyStreakDays}</span>
                <span className="text-xs">🔥</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                दिन स्ट्रीक
              </div>
            </div>
          </div>
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

        <div className="space-y-2.5">
          {displayedSubjects.map((sub) => {
            const paperCount = getSubjectPaperCount(sub.name);
            const subStat = progress.subjectStats[sub.name];

            return (
              <div
                key={sub.name}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3.5 rounded-2xl sm:rounded-3xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
              >
                <div
                  onClick={() =>
                    navigate(
                      `/class/${profile.classId}/subject/${encodeURIComponent(sub.name)}/papers`
                    )
                  }
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 ${sub.bg} rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs`}
                  >
                    {sub.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({sub.hindiName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap">
                      <span className="text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {paperCount} Solved Papers
                      </span>
                      {subStat && subStat.attempted > 0 && (
                        <span className="text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/60">
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
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
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

