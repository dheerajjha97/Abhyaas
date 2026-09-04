export interface SubjectProgress {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number; // 0 - 100
  testsCount: number;
  lastPracticedAt: number;
}

export interface TestHistoryItem {
  id: string;
  testName: string;
  subject: string;
  classId: string;
  totalQuestions: number;
  score: number;
  correct: number;
  wrong: number;
  percentage: number;
  timestamp: number;
  timeSpentSeconds?: number;
  isMockTest?: boolean;
}

export interface StudentProgressData {
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number; // 0 - 100
  testsCompleted: number;
  studyStreakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalMinutesStudied: number;
  subjectStats: Record<string, SubjectProgress>;
  recentHistory: TestHistoryItem[];
  lastUpdated: number;
}

export const DEFAULT_STUDENT_PROGRESS: StudentProgressData = {
  totalQuestionsSolved: 0,
  totalCorrect: 0,
  totalWrong: 0,
  accuracy: 0,
  testsCompleted: 0,
  studyStreakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalMinutesStudied: 0,
  subjectStats: {},
  recentHistory: [],
  lastUpdated: Date.now(),
};
