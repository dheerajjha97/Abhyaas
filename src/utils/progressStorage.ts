import { StudentProgressData, DEFAULT_STUDENT_PROGRESS, TestHistoryItem } from '../types/progress';
import { evaluateStudentBadges } from '../types/badge';

const PROGRESS_STORAGE_KEY = 'abhyaas_student_progress_v2';

export function getLocalProgress(): StudentProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STUDENT_PROGRESS,
      ...parsed,
      subjectStats: parsed.subjectStats || {},
      recentHistory: Array.isArray(parsed.recentHistory) ? parsed.recentHistory : [],
      earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
    };
  } catch (err) {
    console.error('Failed to parse local progress:', err);
    return DEFAULT_STUDENT_PROGRESS;
  }
}

export function saveLocalProgress(progress: StudentProgressData): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to write local progress:', err);
  }
}

export function calculateUpdatedProgress(
  current: StudentProgressData,
  testItem: TestHistoryItem
): StudentProgressData {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate study streak
  let newStreak = Math.max(1, Number(current?.studyStreakDays) || 1);
  const lastDate = current?.lastActiveDate;

  if (lastDate) {
    const last = new Date(lastDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const safeQuestions = Math.max(0, Number(testItem?.totalQuestions) || Number(testItem?.score) || 0);
  const safeCorrect = Math.max(0, Number(testItem?.correct ?? testItem?.score ?? 0));
  const safeWrong = Math.max(0, Number(testItem?.wrong ?? Math.max(0, safeQuestions - safeCorrect)));

  const currentSolved = Math.max(0, Number(current?.totalQuestionsSolved) || 0);
  const currentCorrect = Math.max(0, Number(current?.totalCorrect) || 0);
  const currentWrong = Math.max(0, Number(current?.totalWrong) || 0);
  const currentTests = Math.max(0, Number(current?.testsCompleted) || 0);
  const currentMinutes = Math.max(0, Number(current?.totalMinutesStudied) || 0);

  const newQuestionsSolved = currentSolved + safeQuestions;
  const newCorrect = currentCorrect + safeCorrect;
  const newWrong = currentWrong + safeWrong;
  const newAccuracy = newQuestionsSolved > 0 ? Math.round((newCorrect / newQuestionsSolved) * 100) : 0;
  const newTestsCompleted = currentTests + 1;
  const addedMinutes = Math.max(1, Math.round((Number(testItem?.timeSpentSeconds) || 60) / 60));
  const newMinutes = currentMinutes + addedMinutes;

  // Update subject stats
  const subjectName = testItem?.subject || 'General';
  const existingStats = current?.subjectStats || {};
  const prevSub = existingStats[subjectName] || {
    subject: subjectName,
    attempted: 0,
    correct: 0,
    accuracy: 0,
    testsCount: 0,
    lastPracticedAt: 0,
  };

  const subAttempted = (Number(prevSub.attempted) || 0) + safeQuestions;
  const subCorrect = (Number(prevSub.correct) || 0) + safeCorrect;
  const subAccuracy = subAttempted > 0 ? Math.round((subCorrect / subAttempted) * 100) : 0;

  const updatedSubjectStats = {
    ...existingStats,
    [subjectName]: {
      subject: subjectName,
      attempted: subAttempted,
      correct: subCorrect,
      accuracy: subAccuracy,
      testsCount: (Number(prevSub.testsCount) || 0) + 1,
      lastPracticedAt: Date.now(),
    },
  };

  // Safe normalized test history item
  const safeTestItem: TestHistoryItem = {
    id: testItem?.id || `test_${Date.now()}`,
    testName: testItem?.testName || `मॉक टेस्ट (${subjectName})`,
    subject: subjectName,
    classId: testItem?.classId || '12',
    totalQuestions: safeQuestions,
    score: safeCorrect,
    correct: safeCorrect,
    wrong: safeWrong,
    percentage: safeQuestions > 0 ? Math.round((safeCorrect / safeQuestions) * 100) : 0,
    timestamp: testItem?.timestamp || Date.now(),
    timeSpentSeconds: Number(testItem?.timeSpentSeconds) || 60,
    isMockTest: Boolean(testItem?.isMockTest),
  };

  // Prepend recent history, keep last 25 tests
  const prevHistory = Array.isArray(current?.recentHistory) ? current.recentHistory.filter(Boolean) : [];
  const updatedHistory = [
    safeTestItem,
    ...prevHistory.filter((h) => h?.id && h.id !== safeTestItem.id),
  ].slice(0, 25);

  const updatedCandidate: StudentProgressData = {
    ...current,
    totalQuestionsSolved: newQuestionsSolved,
    totalCorrect: newCorrect,
    totalWrong: newWrong,
    accuracy: newAccuracy,
    testsCompleted: newTestsCompleted,
    studyStreakDays: newStreak,
    lastActiveDate: todayStr,
    totalMinutesStudied: newMinutes,
    subjectStats: updatedSubjectStats,
    recentHistory: updatedHistory,
    lastUpdated: Date.now(),
  };

  // Evaluate newly earned badges
  const evaluatedBadges = evaluateStudentBadges(updatedCandidate);
  const earnedBadges = evaluatedBadges.filter((b) => b.isUnlocked).map((b) => b.id);

  return {
    ...updatedCandidate,
    earnedBadges,
  };
}
