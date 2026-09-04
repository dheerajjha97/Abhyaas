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
  let newStreak = current.studyStreakDays || 1;
  const lastDate = current.lastActiveDate;

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

  const newQuestionsSolved = current.totalQuestionsSolved + testItem.totalQuestions;
  const newCorrect = current.totalCorrect + testItem.correct;
  const newWrong = current.totalWrong + testItem.wrong;
  const newAccuracy = newQuestionsSolved > 0 ? Math.round((newCorrect / newQuestionsSolved) * 100) : 0;
  const newTestsCompleted = current.testsCompleted + 1;
  const addedMinutes = Math.max(1, Math.round((testItem.timeSpentSeconds || 60) / 60));
  const newMinutes = current.totalMinutesStudied + addedMinutes;

  // Update subject stats
  const subjectName = testItem.subject;
  const prevSub = current.subjectStats[subjectName] || {
    subject: subjectName,
    attempted: 0,
    correct: 0,
    accuracy: 0,
    testsCount: 0,
    lastPracticedAt: 0,
  };

  const subAttempted = prevSub.attempted + testItem.totalQuestions;
  const subCorrect = prevSub.correct + testItem.correct;
  const subAccuracy = subAttempted > 0 ? Math.round((subCorrect / subAttempted) * 100) : 0;

  const updatedSubjectStats = {
    ...current.subjectStats,
    [subjectName]: {
      subject: subjectName,
      attempted: subAttempted,
      correct: subCorrect,
      accuracy: subAccuracy,
      testsCount: prevSub.testsCount + 1,
      lastPracticedAt: Date.now(),
    },
  };

  // Prepend recent history, keep last 25 tests
  const updatedHistory = [testItem, ...current.recentHistory.filter((h) => h.id !== testItem.id)].slice(0, 25);

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
