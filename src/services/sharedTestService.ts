import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MCQ } from '../types/question';

export interface SharedTest {
  id: string; // Unique alphanumeric code
  title: string;
  subject: string;
  classId: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: MCQ[];
  creatorUid: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: number;
  submissionCount: number;
}

export interface TestSubmission {
  id: string;
  testId: string;
  userName: string;
  isLoggedIn: boolean;
  userId?: string;
  userAvatar?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  correctAnswers: number;
  wrongAnswers: number;
  submittedAt: number;
}

// Generate short, readable, 6-character uppercase test code
function generateShortCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const sharedTestService = {
  /**
   * Create and publish a new shared test challenge to Firestore
   */
  async createSharedTest(data: {
    title: string;
    subject: string;
    classId: string;
    questions: MCQ[];
    timeLimitMinutes: number;
    creatorUid: string;
    creatorName: string;
    creatorAvatar?: string;
  }): Promise<SharedTest> {
    const testId = generateShortCode();
    const testDocRef = doc(db, 'shared_tests', testId);

    const now = Date.now();
    const newTest: SharedTest = {
      id: testId,
      title: data.title.trim() || `${data.subject} क्लास ${data.classId} चैलेंज टेस्ट`,
      subject: data.subject,
      classId: data.classId,
      totalQuestions: data.questions.length,
      timeLimitMinutes: data.timeLimitMinutes,
      questions: data.questions,
      creatorUid: data.creatorUid,
      creatorName: data.creatorName || 'अभ्यास छात्र',
      creatorAvatar: data.creatorAvatar || '🎓',
      createdAt: now,
      submissionCount: 0,
    };

    await setDoc(testDocRef, newTest);
    return newTest;
  },

  /**
   * Fetch a shared test challenge by its ID/code
   */
  async getSharedTest(testId: string): Promise<SharedTest | null> {
    const cleanId = testId.trim().toUpperCase();
    const testDocRef = doc(db, 'shared_tests', cleanId);
    const snap = await getDoc(testDocRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as SharedTest;
  },

  /**
   * Submit a student's test score (works for both logged in users and temp guests)
   */
  async submitTestResult(
    testId: string,
    result: {
      userName: string;
      isLoggedIn: boolean;
      userId?: string;
      userAvatar?: string;
      score: number;
      totalQuestions: number;
      percentage: number;
      timeTakenSeconds: number;
      correctAnswers: number;
      wrongAnswers: number;
    }
  ): Promise<TestSubmission> {
    const cleanId = testId.trim().toUpperCase();
    const submissionsCol = collection(db, 'shared_tests', cleanId, 'submissions');
    const submissionId = `${result.isLoggedIn && result.userId ? result.userId : 'guest'}_${Date.now()}`;
    const subDocRef = doc(submissionsCol, submissionId);

    const submission: TestSubmission = {
      id: submissionId,
      testId: cleanId,
      userName: result.userName.trim() || (result.isLoggedIn ? 'अभ्यास छात्र' : 'अतिथि छात्र'),
      isLoggedIn: Boolean(result.isLoggedIn),
      userId: result.userId || undefined,
      userAvatar: result.userAvatar || (result.isLoggedIn ? '🎓' : '👤'),
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      timeTakenSeconds: result.timeTakenSeconds,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      submittedAt: Date.now(),
    };

    await setDoc(subDocRef, submission);

    // Increment submission count in test document
    try {
      const testDocRef = doc(db, 'shared_tests', cleanId);
      await updateDoc(testDocRef, {
        submissionCount: increment(1),
      });
    } catch {
      // Ignore non-fatal count increment failure
    }

    return submission;
  },

  /**
   * Get sorted leaderboard submissions for a test
   * Sorted by score descending, then timeTakenSeconds ascending (faster gets higher rank)
   */
  async getLeaderboard(testId: string): Promise<TestSubmission[]> {
    const cleanId = testId.trim().toUpperCase();
    const submissionsCol = collection(db, 'shared_tests', cleanId, 'submissions');
    const q = query(submissionsCol, orderBy('score', 'desc'), limit(100));

    const snap = await getDocs(q);
    const submissions: TestSubmission[] = [];
    snap.forEach((d) => {
      submissions.push(d.data() as TestSubmission);
    });

    // Sort by score desc, then by time taken asc
    submissions.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });

    return submissions;
  },

  /**
   * Listen to real-time leaderboard changes
   */
  subscribeToLeaderboard(testId: string, onUpdate: (subs: TestSubmission[]) => void): () => void {
    const cleanId = testId.trim().toUpperCase();
    const submissionsCol = collection(db, 'shared_tests', cleanId, 'submissions');
    const q = query(submissionsCol, orderBy('score', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snap) => {
        const list: TestSubmission[] = [];
        snap.forEach((d) => {
          list.push(d.data() as TestSubmission);
        });

        // Client-side tie-breaker: sort by score desc, then timeTaken asc
        list.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTakenSeconds - b.timeTakenSeconds;
        });

        onUpdate(list);
      },
      () => {
        // In case of any snapshot error, pass empty list
        onUpdate([]);
      }
    );
  },

  /**
   * Get tests created by a specific user
   */
  async getUserCreatedTests(creatorUid: string): Promise<SharedTest[]> {
    const testsCol = collection(db, 'shared_tests');
    const q = query(testsCol, where('creatorUid', '==', creatorUid), limit(50));

    const snap = await getDocs(q);
    const list: SharedTest[] = [];
    snap.forEach((d) => {
      list.push(d.data() as SharedTest);
    });

    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  },
};
