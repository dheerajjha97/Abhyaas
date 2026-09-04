import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import { mockTestService, GeneratedMockTest, MockTestConfig } from '../services/mockTestService';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import {
  Sparkles,
  Zap,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Sliders,
  Play,
  Flag,
  Share2,
  ChevronRight,
  ShieldCheck,
  CloudUpload
} from 'lucide-react';

export const MockTestGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedSubject = searchParams.get('subject') || '';

  const { profile } = useStudentProfile();
  const { recordTestResult, cloudSyncStatus } = useStudentProgress();

  // Generator Configuration State
  const [selectedSubject, setSelectedSubject] = useState<string>(
    preSelectedSubject || profile.selectedSubjects[0] || 'Political Science'
  );
  const [testType, setTestType] = useState<'quick' | 'standard' | 'full' | 'custom'>('standard');
  const [customQuestionsCount, setCustomQuestionsCount] = useState<number>(25);
  const [customTimeMinutes, setCustomTimeMinutes] = useState<number>(25);

  // Active Test Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTest, setCurrentTest] = useState<GeneratedMockTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [testStartedTime, setTestStartedTime] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Get available subjects for student's class
  const classSubjects = ALL_AVAILABLE_SUBJECTS.filter((s) =>
    s.classes.includes(profile.classId || '12')
  );

  // Countdown Timer
  useEffect(() => {
    if (!currentTest || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTest, isSubmitted]);

  // Handle Mock Test Generation
  const handleGenerateTest = async () => {
    setIsGenerating(true);
    let count = 35;
    let time = 35;

    if (testType === 'quick') {
      count = 15;
      time = 15;
    } else if (testType === 'standard') {
      count = 35;
      time = 35;
    } else if (testType === 'full') {
      count = 50;
      time = 50;
    } else {
      count = customQuestionsCount;
      time = customTimeMinutes;
    }

    try {
      const config: MockTestConfig = {
        subject: selectedSubject,
        classId: profile.classId || '12',
        questionCount: count,
        timeLimitMinutes: time,
        testType,
      };

      const generated = await mockTestService.generateMockTest(config);
      setCurrentTest(generated);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setMarkedForReview({});
      setSecondsRemaining(generated.timeLimitMinutes * 60);
      setTestStartedTime(Date.now());
      setIsSubmitted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.message || 'मॉक टेस्ट जनरेट करने में असमर्थ। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper option matching
  const checkOptionCorrectness = (
    optionText: string,
    optionIdx: number,
    answerText: string
  ): boolean => {
    if (!answerText || !optionText) return false;
    const normOption = optionText.trim().toLowerCase();
    const normAnswer = answerText.trim().toLowerCase();

    if (normOption === normAnswer) return true;

    const keys = ['a', 'b', 'c', 'd', 'e'];
    const optKey = keys[optionIdx];
    if (
      normAnswer === optKey ||
      normAnswer === `(${optKey})` ||
      normAnswer === `${optKey})` ||
      normAnswer === `${optKey}.`
    ) {
      return true;
    }

    const cleanAnswer = normAnswer.replace(/^\(?([a-e0-9])\)?[\.\:\s\-]*/i, '').trim();
    if (cleanAnswer && normOption === cleanAnswer) return true;

    return false;
  };

  // Submit Test & Save to Firestore
  const handleSubmitTest = (timeOut = false) => {
    if (!currentTest) return;

    let correctCount = 0;
    let wrongCount = 0;

    currentTest.questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx] || '';
      if (selected) {
        const selIdx = q.options.indexOf(selected);
        const isRight = checkOptionCorrectness(selected, selIdx, q.answer);
        if (isRight) correctCount++;
        else wrongCount++;
      } else {
        wrongCount++;
      }
    });

    const totalQuestions = currentTest.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const timeSpentSecs = Math.round((Date.now() - testStartedTime) / 1000);

    // Save to Firestore & local progress
    recordTestResult({
      id: currentTest.id,
      testName: currentTest.title,
      subject: currentTest.subject,
      classId: currentTest.classId,
      totalQuestions,
      score: correctCount,
      correct: correctCount,
      wrong: wrongCount,
      percentage,
      timestamp: Date.now(),
      timeSpentSeconds: timeSpentSecs,
      isMockTest: true,
    });

    setIsSubmitted(true);
    setShowSubmitModal(false);

    if (timeOut) {
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'समय समाप्त! आपका मॉक टेस्ट सबमिट हो गया है।',
      });
    } else {
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'मॉक टेस्ट सफलतापूर्वक पूर्ण हुआ और प्रोग्रेस सेव हो गई!',
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Render 1: Test Result Screen
  if (currentTest && isSubmitted) {
    let correctCount = 0;
    currentTest.questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx] || '';
      const selIdx = q.options.indexOf(selected);
      if (checkOptionCorrectness(selected, selIdx, q.answer)) {
        correctCount++;
      }
    });

    const total = currentTest.questions.length;
    const pct = Math.round((correctCount / total) * 100);

    let grade = 'शानदार तैयारी! 🎉';
    let gradeDesc = 'आपने बहुत ही उत्कृष्ट प्रदर्शन किया है। इस विषय पर आपकी पकड़ मजबूत है।';
    if (pct < 40) {
      grade = 'सुधार की आवश्यकता है 📖';
      gradeDesc = 'इस विषय के बुनियादी सिद्धांतों का पुनरीक्षण करें और फिर से टेस्ट दें।';
    } else if (pct < 70) {
      grade = 'अच्छा प्रयास! 👍';
      gradeDesc = 'आपका प्रदर्शन अच्छा है, थोड़ी और प्रैक्टिस से आप 90%+ स्कोर कर सकते हैं।';
    }

    return (
      <div className="space-y-4 pb-28 animate-in fade-in duration-300">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Flutter Material 3 App Bar */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentTest(null)}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                मॉक टेस्ट परिणाम
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {currentTest.subject} • कक्षा {currentTest.classId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            <CloudUpload className="w-3.5 h-3.5" />
            <span>सुरक्षित सेव्ड</span>
          </div>
        </div>

        {/* Score Card Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mb-3 shadow-inner">
              {pct >= 70 ? '🏆' : pct >= 40 ? '⭐' : '🎯'}
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
              {grade}
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-5xl font-black tracking-tight">{correctCount}</span>
              <span className="text-xl font-bold opacity-75">/{total}</span>
            </div>
            <p className="text-sm font-bold text-indigo-100 mt-1">कुल प्रतिशत: {pct}%</p>
            <p className="text-xs text-indigo-200 mt-2 max-w-xs leading-relaxed">{gradeDesc}</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{correctCount}</div>
            <div className="text-[11px] font-bold text-slate-500">सही उत्तर</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-1.5">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {total - correctCount}
            </div>
            <div className="text-[11px] font-bold text-slate-500">गलत उत्तर</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto mb-1.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {Math.max(1, Math.round((Date.now() - testStartedTime) / 60000))} m
            </div>
            <div className="text-[11px] font-bold text-slate-500">समय लगा</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => handleGenerateTest()}
            className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>नया टेस्ट दें</span>
          </button>
          <button
            onClick={() => setCurrentTest(null)}
            className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span>डैशबोर्ड जाएँ</span>
          </button>
        </div>

        {/* Detailed Solutions Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              विस्तृत उत्तर एवं समाधान ({total} प्रश्न)
            </h3>
          </div>

          {currentTest.questions.map((q, idx) => {
            const userChoice = selectedAnswers[idx] || 'छोड़ दिया गया';
            const selIdx = q.options.indexOf(userChoice);
            const isCorrect = checkOptionCorrectness(userChoice, selIdx, q.answer);

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/60'
                    : 'border-rose-200 dark:border-rose-900/60'
                } shadow-2xs space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60'
                      }`}
                    >
                      {isCorrect ? '✓ सही उत्तर' : '✗ गलत उत्तर'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {q.question}
                </p>

                <div className="space-y-1.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isAns = checkOptionCorrectness(opt, optIdx, q.answer);
                    const isSelected = userChoice === opt;

                    let rowStyle = 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent';
                    if (isAns) {
                      rowStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold';
                    } else if (isSelected && !isAns) {
                      rowStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${rowStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] shadow-2xs">
                            {['A', 'B', 'C', 'D', 'E'][optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isAns && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            सही विकल्प
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200">
                    <span className="font-bold">व्याख्या: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render 2: Active Test Execution Screen
  if (currentTest) {
    const q = currentTest.questions[currentQuestionIndex];
    const totalQ = currentTest.questions.length;
    const progressPct = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);
    const isAnswered = !!selectedAnswers[currentQuestionIndex];
    const isReview = !!markedForReview[currentQuestionIndex];

    const isTimerUrgent = secondsRemaining < 180; // less than 3 minutes

    return (
      <div className="space-y-4 pb-28 animate-in fade-in duration-300">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Flutter Material 3 Top Test Bar */}
        <div className="sticky top-2 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPaletteModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="प्रश्न तालिका देखें"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{currentQuestionIndex + 1}/{totalQ}</span>
              </button>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 truncate max-w-[120px] sm:max-w-none">
                {currentTest.subject}
              </span>
            </div>

            {/* Countdown Timer Capsule */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                isTimerUrgent
                  ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                  : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              सबमिट करें
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question Card (Flutter Style) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                वस्तुनिष्ठ प्रश्न (MCQ)
              </span>
            </div>

            <button
              onClick={() =>
                setMarkedForReview((prev) => ({
                  ...prev,
                  [currentQuestionIndex]: !prev[currentQuestionIndex],
                }))
              }
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                isReview
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Flag className="w-3 h-3" />
              <span>{isReview ? 'समीक्षाधीन' : 'मार्क करें'}</span>
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
            {q.question}
          </h3>

          {/* Option List */}
          <div className="space-y-2.5 pt-2">
            {q.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === opt;
              const optLabel = ['A', 'B', 'C', 'D', 'E'][optIdx];

              return (
                <button
                  key={optIdx}
                  onClick={() =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [currentQuestionIndex]: opt,
                    }))
                  }
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-bold shadow-xs scale-[1.01]'
                      : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {optLabel}
                  </span>
                  <span className="text-xs sm:text-sm flex-1 leading-snug">{opt}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flutter Style Floating Bottom Action Bar */}
        <div className="fixed bottom-2 left-0 right-0 max-w-md sm:max-w-lg mx-auto px-4 z-40">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-2">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className={`p-3 rounded-2xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
                currentQuestionIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">पिछला</span>
            </button>

            <button
              onClick={() => setShowPaletteModal(true)}
              className="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>प्रश्नावली</span>
            </button>

            {currentQuestionIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>अगला</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>सबमिट</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Modal */}
        {showPaletteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  प्रश्न तालिका (Question Palette)
                </h4>
                <button
                  onClick={() => setShowPaletteModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> हल किया
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> समीक्षा
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" /> शेष
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {currentTest.questions.map((_, idx) => {
                  const answered = !!selectedAnswers[idx];
                  const review = !!markedForReview[idx];
                  const isCurrent = idx === currentQuestionIndex;

                  let btnBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                  if (review) {
                    btnBg = 'bg-amber-500 text-white font-black';
                  } else if (answered) {
                    btnBg = 'bg-indigo-600 text-white font-black';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowPaletteModal(false);
                      }}
                      className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${btnBg} ${
                        isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowPaletteModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                बंद करें
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  मॉक टेस्ट सबमिट करें?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  आपने कुल <b>{totalQ}</b> में से <b>{Object.keys(selectedAnswers).length}</b> प्रश्नों का उत्तर दिया है।
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>हल किए गए:</span>
                  <span className="font-bold text-emerald-600">{Object.keys(selectedAnswers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>शेष प्रश्न:</span>
                  <span className="font-bold text-rose-600">{totalQ - Object.keys(selectedAnswers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>समीक्षाधीन:</span>
                  <span className="font-bold text-amber-600">{Object.keys(markedForReview).length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  और समय लें
                </button>
                <button
                  onClick={() => handleSubmitTest(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  हाँ, सबमिट करें
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render 3: Generator Configuration Screen
  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Flutter App Bar */}
      <HeaderBar
        showBack
        title="मॉक टेस्ट जनरेटर"
        subtitle={`कक्षा ${profile.classId || '12'} • GitHub लाइव डेटाबेस`}
      />

      {/* Generator Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            स्मार्ट क्वेश्चन कंपाइलर
          </div>
          <h2 className="text-xl font-black tracking-tight leading-tight">
            विषय चुनें और तुरंत नया बोर्ड मॉडल टेस्ट बनाएँ!
          </h2>
          <p className="text-xs text-indigo-100 leading-relaxed max-w-sm">
            यह सिस्टम सीधे AbhyaasData GitHub रिपॉजिटरी से वास्तविक बोर्ड पेपर्स के प्रश्नों को एकत्रित और शफल करके नया मॉक टेस्ट तैयार करता है।
          </p>
        </div>
      </div>

      {/* Step 1: Select Subject */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
              1
            </span>
            विषय का चयन करें (Select Subject)
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {classSubjects.map((sub) => {
            const isSelected = selectedSubject === sub.name;
            const isStudentSubject = profile.selectedSubjects.includes(sub.name);

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.name)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{sub.emoji}</span>
                  {isStudentSubject && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      चुना हुआ
                    </span>
                  )}
                </div>
                <div className="text-xs font-black leading-tight truncate">{sub.name}</div>
                <div
                  className={`text-[10px] truncate ${
                    isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {sub.hindiName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Test Format */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 px-1">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
            2
          </span>
          टेस्ट का प्रारूप चुनें (Test Mode)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Quick Sprint */}
          <div
            onClick={() => setTestType('quick')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              testType === 'quick'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center text-lg shrink-0">
              ⚡
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black">त्वरित क्विज़ (Quick Sprint)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                15 प्रश्न • 15 मिनट (दैनिक रिवीजन)
              </p>
            </div>
          </div>

          {/* Standard Mock */}
          <div
            onClick={() => setTestType('standard')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              testType === 'standard'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center text-lg shrink-0">
              📝
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black">स्टैंडर्ड टेस्ट (Standard Mock)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                35 प्रश्न • 35 मिनट (संतुलित अभ्यास)
              </p>
            </div>
          </div>

          {/* Full Board Simulation */}
          <div
            onClick={() => setTestType('full')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              testType === 'full'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center text-lg shrink-0">
              🏆
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black">फुल बोर्ड सिमुलेशन (Full Test)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                50 प्रश्न • 50 मिनट (फाइनल परीक्षा माहौल)
              </p>
            </div>
          </div>

          {/* Custom */}
          <div
            onClick={() => setTestType('custom')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              testType === 'custom'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-100 shadow-xs ring-1 ring-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 flex items-center justify-center text-lg shrink-0">
              ⚙️
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black">कस्टम टेस्ट (Custom Setup)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                अपनी पसंद के प्रश्न और समय सीमा तय करें
              </p>
            </div>
          </div>
        </div>

        {/* Custom Sliders (if custom chosen) */}
        {testType === 'custom' && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>प्रश्नों की संख्या:</span>
                <span className="text-indigo-600 font-black">{customQuestionsCount} प्रश्न</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={customQuestionsCount}
                onChange={(e) => setCustomQuestionsCount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>समय सीमा:</span>
                <span className="text-indigo-600 font-black">{customTimeMinutes} मिनट</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={customTimeMinutes}
                onChange={(e) => setCustomTimeMinutes(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Start Button (Flutter Style Primary Button) */}
      <button
        disabled={isGenerating}
        onClick={handleGenerateTest}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span>GitHub से प्रश्न लोड हो रहे हैं...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>{selectedSubject} मॉक टेस्ट शुरू करें</span>
          </>
        )}
      </button>
    </div>
  );
};
