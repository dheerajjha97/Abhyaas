import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import {
  sharedTestService,
  SharedTest,
  TestSubmission,
} from '../services/sharedTestService';
import { MCQ } from '../types/question';
import { shareTestChallenge } from '../utils/shareUtils';
import { HeaderBar } from '../components/ui/HeaderBar';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { SecurityWatermark } from '../components/security/ContentProtection';
import { FormattedAnswer } from '../components/ui/FormattedAnswer';
import {
  Trophy,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Users,
  ShieldCheck,
  UserCheck,
  User as UserIcon,
  Play,
  HelpCircle,
  Flag,
  BookOpen,
  Copy,
  ExternalLink,
  ChevronRight,
  LogIn,
  AlertCircle,
  Check,
} from 'lucide-react';

export const TestChallenge: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { profile, currentUser, signInWithGoogle } = useStudentProfile();
  const { recordTestResult } = useStudentProgress();

  // Test metadata & state
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<SharedTest | null>(null);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Participant identity
  const [guestName, setGuestName] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // Test execution state
  const [testStarted, setTestStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [mySubmission, setMySubmission] = useState<TestSubmission | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Auto-shift option
  const [autoShift, setAutoShift] = useState(true);

  // Load test details and subscribe to live leaderboard
  useEffect(() => {
    if (!testId) {
      setError('अमान्य टेस्ट लिंक');
      setLoading(false);
      return;
    }

    let unsubscribeLeaderboard: (() => void) | null = null;

    const loadData = async () => {
      setLoading(true);
      try {
        const foundTest = await sharedTestService.getSharedTest(testId);
        if (!foundTest) {
          setError('यह टेस्ट उपलब्ध नहीं है या लिंक समाप्त हो चुका है।');
          setLoading(false);
          return;
        }

        setTest(foundTest);
        setSecondsRemaining(foundTest.timeLimitMinutes * 60);

        // Subscribe to live leaderboard updates
        unsubscribeLeaderboard = sharedTestService.subscribeToLeaderboard(
          testId,
          (subs) => {
            setSubmissions(subs);
          }
        );
      } catch (err) {
        setError('डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeLeaderboard) {
        unsubscribeLeaderboard();
      }
    };
  }, [testId]);

  // Hide global bottom navigation while test is running
  useEffect(() => {
    if (testStarted && !isSubmitted) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => {
      document.body.classList.remove('hide-bottom-nav');
    };
  }, [testStarted, isSubmitted]);

  // Timer countdown
  useEffect(() => {
    if (!testStarted || isSubmitted) return;

    if (secondsRemaining <= 0) {
      // Auto submit on time out
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, isSubmitted, secondsRemaining]);

  // Current participant display name
  const effectiveParticipantName = useMemo(() => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (profile?.name && profile.name !== 'विद्यार्थी') return profile.name;
    return guestName.trim();
  }, [currentUser, profile, guestName]);

  const isLoggedInUser = Boolean(currentUser);

  // Handle Start Test
  const handleStartTest = () => {
    if (!effectiveParticipantName) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'कृपया टेस्ट शुरू करने के लिए अपना नाम दर्ज करें।',
      });
      return;
    }

    setTestStarted(true);
    setStartTime(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Option selection
  const handleSelectOption = (opt: string) => {
    const isAlready = selectedAnswers[currentQuestionIndex] === opt;
    if (isAlready) {
      setSelectedAnswers((prev) => {
        const copy = { ...prev };
        delete copy[currentQuestionIndex];
        return copy;
      });
      return;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: opt,
    }));

    if (autoShift && test && currentQuestionIndex < test.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 250);
    }
  };

  // Helper to check if student's selected answer is correct
  const checkQuestionCorrectness = (q: MCQ, selected: string): boolean => {
    if (!selected) return false;
    const answerText = (q.answer || (q as unknown as { correctAnswer?: string }).correctAnswer || '').trim();
    if (!answerText) return false;

    const normSelected = selected.trim().toLowerCase();
    const normAnswer = answerText.toLowerCase();

    // If user selected an option letter ('A', 'B', 'C', 'D')
    const letterIdx = ['a', 'b', 'c', 'd'].indexOf(normSelected);
    if (letterIdx !== -1) {
      if (
        normAnswer === normSelected ||
        normAnswer === `(${normSelected})` ||
        normAnswer === `${normSelected})` ||
        normAnswer === `${normSelected}.`
      ) {
        return true;
      }
      const optionAtIdx = q.options ? q.options[letterIdx] : null;
      if (optionAtIdx) {
        const normOption = optionAtIdx.trim().toLowerCase();
        if (normOption === normAnswer) return true;
        const cleanAnswer = normAnswer.replace(/^\(?([a-d0-9])\)?[\.\:\s\-]*/i, '').trim();
        if (cleanAnswer && normOption === cleanAnswer) return true;
      }
    }

    if (normSelected === normAnswer) return true;
    return false;
  };

  // Helper to display correct answer cleanly in review
  const getQuestionCorrectAnswerDisplay = (q: MCQ): string => {
    const ans = (q.answer || (q as unknown as { correctAnswer?: string }).correctAnswer || '').trim();
    if (!ans) return '';
    const match = ans.match(/^\(?([A-Da-d])\)?/);
    let letter = '';
    let text = ans;

    if (match) {
      letter = match[1].toUpperCase();
      const idx = letter.charCodeAt(0) - 65;
      if (q.options && q.options[idx]) {
        text = q.options[idx];
      }
    } else if (q.options) {
      const idx = q.options.findIndex(
        (opt) => opt.trim().toLowerCase() === ans.toLowerCase()
      );
      if (idx !== -1) {
        letter = String.fromCharCode(65 + idx);
        text = q.options[idx];
      }
    }

    if (letter && text && text.toLowerCase() !== letter.toLowerCase()) {
      return `(${letter}) ${text}`;
    }
    return letter ? `(${letter})` : ans;
  };

  // Helper to display user's selected answer in review
  const getUserAnswerDisplay = (q: MCQ, selectedLetter: string): string => {
    if (!selectedLetter) return '';
    const idx = selectedLetter.toUpperCase().charCodeAt(0) - 65;
    const optText = q.options && q.options[idx] ? ` - ${q.options[idx]}` : '';
    return `(${selectedLetter})${optText}`;
  };

  // Submit test (Instant optimistic submission + background Firestore sync)
  const handleSubmitTest = async () => {
    if (!test || isSubmitted || isSavingResult) return;
    setIsSavingResult(true);
    setShowSubmitModal(false);

    const timeTakenSeconds = Math.max(
      1,
      Math.round((Date.now() - (startTime || Date.now())) / 1000)
    );

    let correctCount = 0;
    let wrongCount = 0;

    test.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen && checkQuestionCorrectness(q, chosen)) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const totalQuestions = test.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const submissionData = {
      userName: effectiveParticipantName,
      isLoggedIn: isLoggedInUser,
      userId: currentUser?.uid,
      userAvatar: currentUser?.photoURL || profile.avatarEmoji || (isLoggedInUser ? '🎓' : '👤'),
      score: correctCount,
      totalQuestions,
      percentage,
      timeTakenSeconds,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
    };

    // Instant local state transition — student sees their score immediately!
    const localSubmission: TestSubmission = {
      id: `${isLoggedInUser && currentUser?.uid ? currentUser.uid : 'guest'}_${Date.now()}`,
      testId: test.id,
      ...submissionData,
      submittedAt: Date.now(),
    };

    setMySubmission(localSubmission);
    setIsSubmitted(true);
    setSubmissions((prev) =>
      [localSubmission, ...prev.filter((s) => s.id !== localSubmission.id)].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Also record to local user progress with proper fields
    try {
      recordTestResult({
        id: `challenge-${test.id}-${Date.now()}`,
        testName: test.title || `चैलेंज टेस्ट (${test.subject})`,
        subject: test.subject,
        classId: test.classId || '12',
        totalQuestions,
        score: correctCount,
        correct: correctCount,
        wrong: wrongCount,
        percentage,
        timestamp: Date.now(),
        timeSpentSeconds: timeTakenSeconds,
      });
    } catch {
      // ignore local progress error
    }

    // Sync to Cloud Firestore with timeout protection
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 8000)
      );
      const savedSub = await Promise.race([
        sharedTestService.submitTestResult(test.id, submissionData),
        timeoutPromise,
      ]);
      setMySubmission(savedSub);
      setSubmissions((prev) =>
        [savedSub, ...prev.filter((s) => s.id !== savedSub.id)].sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
        })
      );
    } catch {
      // Cloud sync failed or timed out — but student already has local submission
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'आपका टेस्ट पूरा हो गया! नेटवर्क स्लो होने पर लीडरबोर्ड थोड़ी देर में अपडेट हो जाएगा।',
      });
    } finally {
      setIsSavingResult(false);
    }
  };

  // Share challenge handler
  const handleShareChallenge = async () => {
    if (!test) return;
    const res = await shareTestChallenge({
      testId: test.id,
      title: test.title,
      subject: test.subject,
      classId: test.classId,
      totalQuestions: test.totalQuestions,
      timeLimitMinutes: test.timeLimitMinutes,
      creatorName: test.creatorName,
    });

    if (res.success) {
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: res.method === 'native' ? 'चैलेंज लिंक शेयर किया गया!' : 'चैलेंज लिंक कॉपी हो गया!',
      });
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (secs?: number) => {
    const safeSecs = Math.max(0, Number(secs) || 0);
    const mins = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          टेस्ट चैलेंज लोड हो रहा है...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !test) {
    return (
      <div className="py-16 text-center space-y-4 px-4 max-w-md mx-auto">
        <HeaderBar showBack title="टेस्ट चैलेंज" />
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-3xl mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {error || 'टेस्ट नहीं मिला'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          हो सकता है यह टेस्ट समाप्त हो गया हो या कोड गलत हो। आप मॉक टेस्ट पेज से नया टेस्ट शुरू कर सकते हैं।
        </p>
        <button
          onClick={() => navigate('/mock-test')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          मॉक टेस्ट जनरेटर पर जाएँ
        </button>
      </div>
    );
  }

  // Calculate my rank in leaderboard
  const myRank = mySubmission
    ? submissions.findIndex((s) => s.id === mySubmission.id) + 1
    : 0;

  // -------------------------------------------------------------
  // VIEW 1: TEST RUNNER (WHEN TEST IS IN PROGRESS)
  // -------------------------------------------------------------
  if (testStarted && !isSubmitted) {
    const q = test.questions[currentQuestionIndex];
    const total = test.questions.length;
    const isReviewed = markedForReview[currentQuestionIndex];
    const isSelected = Boolean(selectedAnswers[currentQuestionIndex]);
    const isLast = currentQuestionIndex === total - 1;

    return (
      <div className="space-y-4 pb-36 max-w-3xl mx-auto relative select-none">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Top Control Bar: Progress, Timer, Palette */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs sticky top-2 z-30 flex items-center justify-between gap-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-100 dark:border-blue-900">
              {currentQuestionIndex + 1}/{total}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:inline truncate max-w-[150px]">
              {test.subject}
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm border transition-colors ${
              secondsRemaining < 180
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-900 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Actions: Review Flag, Palette, Submit */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setMarkedForReview((prev) => ({
                  ...prev,
                  [currentQuestionIndex]: !prev[currentQuestionIndex],
                }))
              }
              title={isReviewed ? 'समीक्षा से हटाएं' : 'समीक्षा के लिए मार्क करें'}
              className={`p-2 rounded-xl border transition-colors ${
                isReviewed
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowPalette(true)}
              className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              OMR शीट
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-2xs"
            >
              सबमिट
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs relative overflow-hidden space-y-5">
          <SecurityWatermark text={`अभ्यास चैलेंज • ${test.id}`} />

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                प्रश्न {currentQuestionIndex + 1}
              </span>
              {isReviewed && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">
                  रिव्यू के लिए मार्क
                </span>
              )}
            </div>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              1 अंक
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
            {q.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {q.options.map((optionText, idx) => {
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelectedOption = selectedAnswers[currentQuestionIndex] === optionLetter;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(optionLetter)}
                  className={`w-full p-3.5 sm:p-4 rounded-xl text-left flex items-center gap-3 transition-all border cursor-pointer active:scale-[0.99] ${
                    isSelectedOption
                      ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 dark:border-blue-500 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isSelectedOption
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-medium flex-1 ${
                      isSelectedOption
                        ? 'text-blue-950 dark:text-blue-100 font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>पिछला</span>
          </button>

          {isLast ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>टेस्ट सबमिट करें</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.min(total - 1, prev + 1))
              }
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>अगला</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question Palette Modal */}
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  प्रश्न पैलेट (OMR शीट)
                </h4>
                <button
                  onClick={() => setShowPalette(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2.5 overflow-y-auto py-2 pr-1">
                {test.questions.map((_, idx) => {
                  const isAns = Boolean(selectedAnswers[idx]);
                  const isRev = Boolean(markedForReview[idx]);
                  const isCur = currentQuestionIndex === idx;

                  let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                  if (isRev) {
                    bgClass = 'bg-amber-500 text-white';
                  } else if (isAns) {
                    bgClass = 'bg-emerald-600 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowPalette(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-black flex items-center justify-center border transition-all ${bgClass} ${
                        isCur ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span>हल किया ({Object.keys(selectedAnswers).length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span>रिव्यू ({Object.keys(markedForReview).length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-200 inline-block"></span>
                  <span>शेष ({total - Object.keys(selectedAnswers).length})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  क्या आप टेस्ट सबमिट करना चाहते हैं?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  आपने {total} में से {Object.keys(selectedAnswers).length} प्रश्नों के उत्तर दिए हैं।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  वापस जारी रखें
                </button>
                <button
                  disabled={isSavingResult}
                  onClick={handleSubmitTest}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs"
                >
                  {isSavingResult ? 'सबमिट हो रहा है...' : 'हाँ, सबमिट करें'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: POST-SUBMISSION RESULTS & LIVE LEADERBOARD
  // -------------------------------------------------------------
  if (isSubmitted && mySubmission) {
    return (
      <div className="space-y-5 pb-36 max-w-3xl mx-auto animate-in fade-in duration-300">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <HeaderBar showBack title="टेस्ट चैलेंज परिणाम" subtitle={test.title} />

        {/* Celebration Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center space-y-4 relative overflow-hidden">
          <SecurityWatermark text={`स्कोर कार्ड • ${test.id}`} />

          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-900 shadow-xs">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              चैलेंज पूरा हुआ!
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {mySubmission.userName} का स्कोर
            </h2>
            <div className="text-5xl font-black text-blue-600 dark:text-blue-400 py-1">
              {mySubmission.score} / {mySubmission.totalQuestions}
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              सफलता दर: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{mySubmission.percentage}%</span> • समय: {formatTime(mySubmission.timeTakenSeconds)}
            </p>
          </div>

          {/* Current Rank Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-950/40 p-3 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 max-w-sm mx-auto flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-black text-amber-900 dark:text-amber-200">
              {myRank > 0
                ? `वर्तमान रैंक: #${myRank} (कुल ${submissions.length} छात्रों में)`
                : 'लीडरबोर्ड में दर्ज!'}
            </span>
          </div>

          {/* Quick Breakdown */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-1">
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">सही उत्तर</span>
              <p className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                {mySubmission.correctAnswers}
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold text-rose-700 uppercase">गलत उत्तर</span>
              <p className="text-lg font-black text-rose-900 dark:text-rose-100">
                {mySubmission.wrongAnswers}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Share Challenge, View Solutions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleShareChallenge}
            className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>दोस्तों को यह चैलेंज शेयर करें</span>
          </button>

          <button
            onClick={() => setShowReview(!showReview)}
            className="py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>{showReview ? 'समीक्षा छुपाएं' : 'उत्तर व व्याख्या देखें'}</span>
          </button>
        </div>

        {/* Detailed Solutions Review */}
        {showReview && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              प्रश्नों के सही उत्तर एवं व्याख्या
            </h3>
            <div className="space-y-4">
              {(test?.questions || []).map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns ? checkQuestionCorrectness(q, userAns) : false;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      !userAns
                        ? 'border-slate-200 bg-slate-50 dark:bg-slate-800/40 dark:border-slate-800'
                        : isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-900'
                        : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-500">प्रश्न {idx + 1}</span>
                      {userAns ? (
                        isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> सही (+1)
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> गलत (0)
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">उत्तर नहीं दिया</span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {q.question}
                    </p>

                    <div className="text-xs space-y-1">
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                        सही उत्तर: {getQuestionCorrectAnswerDisplay(q)}
                      </p>
                      {userAns && !isCorrect && (
                        <p className="text-rose-700 dark:text-rose-400">
                          आपका उत्तर: {getUserAnswerDisplay(q, userAns)}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg mt-2 border border-slate-100 dark:border-slate-800">
                          💡 <strong>व्याख्या:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🏆 LIVE LEADERBOARD (लीडरबोर्ड) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-black">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  लाइव लीडरबोर्ड (Live Rankings)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  कुल {submissions.length} छात्र भाग ले चुके हैं
                </p>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {submissions.map((sub, idx) => {
              const rank = idx + 1;
              const isMe = mySubmission && sub.id === mySubmission.id;

              return (
                <div
                  key={sub.id}
                  className={`py-3 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                    isMe
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 my-1'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        rank === 1
                          ? 'bg-amber-500 text-white shadow-xs'
                          : rank === 2
                          ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Participant Avatar & Name */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {sub.userName}
                        </span>
                        {/* Verified vs Guest Badge */}
                        {sub.isLoggedIn ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            वेरिफाइड छात्र
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            <UserIcon className="w-2.5 h-2.5" />
                            अतिथि
                          </span>
                        )}
                        {isMe && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            आप
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        समय: {formatTime(sub.timeTakenSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {sub.score}/{sub.totalQuestions}
                    </span>
                    <p className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                      {sub.percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Home / Generator Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/mock-test')}
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
          >
            अन्य मॉक टेस्ट व प्रश्न पत्र देखें
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: CHALLENGE LANDING PAGE (BEFORE STARTING TEST)
  // -------------------------------------------------------------
  return (
    <div className="space-y-5 pb-36 max-w-3xl mx-auto animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <HeaderBar showBack title="टेस्ट चैलेंज" subtitle={`कोड: ${test.id}`} />

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            लाइव चैलेंज टेस्ट
          </span>
          <span className="text-xs font-mono font-bold bg-black/20 px-3 py-1 rounded-xl">
            कोड: {test.id}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            {test.title}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-2">
            <span>आयोजक (Created by): <strong>{test.creatorName}</strong></span>
          </p>
        </div>

        {/* Details Pills */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl text-center border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">विषय</span>
            <span className="text-xs sm:text-sm font-black truncate block">{test.subject}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl text-center border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">प्रश्न</span>
            <span className="text-xs sm:text-sm font-black block">{test.totalQuestions} सवाल</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl text-center border border-white/10">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">समय</span>
            <span className="text-xs sm:text-sm font-black block">{test.timeLimitMinutes} मिनट</span>
          </div>
        </div>
      </div>

      {/* Join & Start Test Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span>टेस्ट में भाग लें (Join & Start)</span>
        </h3>

        {isLoggedInUser ? (
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                {currentUser?.displayName ? currentUser.displayName[0] : '🎓'}
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">लॉग-इन प्रोफाइल</p>
                <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{currentUser?.displayName || profile.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              वेरिफाइड स्कोर
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              अपना नाम दर्ज करें (लीडरबोर्ड में इसी नाम से स्कोर दिखेगा):
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="उदा. राहुल कुमार / प्रिया शर्मा"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>बिना लॉगिन भी खेल सकते हैं (अतिथि मोड)</span>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="text-blue-600 hover:underline font-bold flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Google लॉगिन करें
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleStartTest}
          disabled={!effectiveParticipantName}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm sm:text-base rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>टेस्ट शुरू करें (Start Challenge)</span>
        </button>
      </div>

      {/* Share Challenge with Friends Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-center sm:text-left">
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>क्लासमेट्स के साथ मुकाबला करें</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            यह लिंक अपने WhatsApp ग्रुप में भेजें और देखें सबसे ज्यादा अंक कौन लाता है।
          </p>
        </div>
        <button
          onClick={handleShareChallenge}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-2xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>चैलेंज शेयर करें</span>
        </button>
      </div>

      {/* Current Leaderboard Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              वर्तमान लीडरबोर्ड (Current Standings)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {submissions.length} प्रतिभागी
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              अभी तक किसी ने यह टेस्ट सबमिट नहीं किया है।
            </p>
            <p className="text-[11px] text-slate-400">
              टेस्ट शुरू करने वाले पहले छात्र बनें और रैंक 1 हासिल करें!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {submissions.map((sub, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={sub.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                        rank === 1
                          ? 'bg-amber-500 text-white'
                          : rank === 2
                          ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {sub.userName}
                        </span>
                        {sub.isLoggedIn ? (
                          <ShieldCheck className="w-3 h-3 text-blue-600" title="वेरिफाइड छात्र" />
                        ) : (
                          <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                            अतिथि
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        समय: {formatTime(sub.timeTakenSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {sub.score}/{sub.totalQuestions}
                    </span>
                    <p className="text-[10px] font-extrabold text-blue-600">
                      {sub.percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
