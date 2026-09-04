import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StudentProgressData, DEFAULT_STUDENT_PROGRESS, TestHistoryItem, SubjectProgress } from '../types/progress';
import { getLocalProgress, saveLocalProgress, calculateUpdatedProgress } from '../utils/progressStorage';
import { useStudentProfile } from './StudentProfileContext';
import { db, doc, getDoc, setDoc } from '../lib/firebase';

interface StudentProgressContextType {
  progress: StudentProgressData;
  isSyncing: boolean;
  cloudSyncStatus: 'synced' | 'saving' | 'offline' | 'unauthenticated';
  recordTestResult: (result: TestHistoryItem) => Promise<void>;
  getSubjectProgress: (subjectName: string) => SubjectProgress;
  resetProgress: () => void;
}

const StudentProgressContext = createContext<StudentProgressContextType | undefined>(undefined);

export const StudentProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStudentProfile();
  const [progress, setProgress] = useState<StudentProgressData>(getLocalProgress());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'unauthenticated'>(
    currentUser ? 'synced' : 'unauthenticated'
  );

  // Sync to Firestore
  const syncToFirestore = useCallback(
    async (progressData: StudentProgressData, uid?: string) => {
      const targetUid = uid || currentUser?.uid;
      if (!targetUid) return;

      try {
        setCloudSyncStatus('saving');
        // Save to users/{userId}/progress/summary
        const progressRef = doc(db, 'users', targetUid, 'progress', 'summary');
        await setDoc(progressRef, {
          ...progressData,
          lastUpdated: Date.now(),
        }, { merge: true });

        // Also save summary fields in user main doc for fast queries
        const userRef = doc(db, 'users', targetUid);
        await setDoc(
          userRef,
          {
            progressSummary: {
              totalQuestionsSolved: progressData.totalQuestionsSolved,
              accuracy: progressData.accuracy,
              testsCompleted: progressData.testsCompleted,
              studyStreakDays: progressData.studyStreakDays,
              lastUpdated: Date.now(),
            },
          },
          { merge: true }
        );

        setCloudSyncStatus('synced');
      } catch (err) {
        console.warn('Could not sync progress to Firestore:', err);
        setCloudSyncStatus('offline');
      }
    },
    [currentUser?.uid]
  );

  // Load progress from Firestore on user login
  useEffect(() => {
    if (!currentUser) {
      setCloudSyncStatus('unauthenticated');
      return;
    }

    let isMounted = true;
    const loadCloudProgress = async () => {
      try {
        setIsSyncing(true);
        setCloudSyncStatus('saving');
        const progressRef = doc(db, 'users', currentUser.uid, 'progress', 'summary');
        const snap = await getDoc(progressRef);

        if (snap.exists()) {
          const cloudData = snap.data() as StudentProgressData;
          if (isMounted) {
            // Merge with local progress (take higher tests or newer timestamp)
            const local = getLocalProgress();
            const merged: StudentProgressData = {
              ...local,
              ...cloudData,
              totalQuestionsSolved: Math.max(local.totalQuestionsSolved, cloudData.totalQuestionsSolved || 0),
              totalCorrect: Math.max(local.totalCorrect, cloudData.totalCorrect || 0),
              testsCompleted: Math.max(local.testsCompleted, cloudData.testsCompleted || 0),
              studyStreakDays: Math.max(local.studyStreakDays, cloudData.studyStreakDays || 1),
              subjectStats: {
                ...local.subjectStats,
                ...(cloudData.subjectStats || {}),
              },
              recentHistory: cloudData.recentHistory && cloudData.recentHistory.length > 0
                ? cloudData.recentHistory
                : local.recentHistory,
              lastUpdated: Date.now(),
            };
            setProgress(merged);
            saveLocalProgress(merged);
            setCloudSyncStatus('synced');
          }
        } else {
          // Cloud empty: save current local progress to Firestore
          const currentLocal = getLocalProgress();
          await syncToFirestore(currentLocal, currentUser.uid);
          setCloudSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Error reading progress from Firestore:', err);
        setCloudSyncStatus('offline');
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    loadCloudProgress();

    return () => {
      isMounted = false;
    };
  }, [currentUser, syncToFirestore]);

  // Record completed test/quiz
  const recordTestResult = useCallback(
    async (result: TestHistoryItem) => {
      setProgress((prev) => {
        const updated = calculateUpdatedProgress(prev, result);
        saveLocalProgress(updated);

        // Sync to cloud if user is logged in
        if (currentUser?.uid) {
          syncToFirestore(updated, currentUser.uid);
        }

        return updated;
      });
    },
    [currentUser?.uid, syncToFirestore]
  );

  const getSubjectProgress = useCallback(
    (subjectName: string): SubjectProgress => {
      return (
        progress.subjectStats[subjectName] || {
          subject: subjectName,
          attempted: 0,
          correct: 0,
          accuracy: 0,
          testsCount: 0,
          lastPracticedAt: 0,
        }
      );
    },
    [progress.subjectStats]
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_STUDENT_PROGRESS);
    saveLocalProgress(DEFAULT_STUDENT_PROGRESS);
    if (currentUser?.uid) {
      syncToFirestore(DEFAULT_STUDENT_PROGRESS, currentUser.uid);
    }
  }, [currentUser?.uid, syncToFirestore]);

  return (
    <StudentProgressContext.Provider
      value={{
        progress,
        isSyncing,
        cloudSyncStatus,
        recordTestResult,
        getSubjectProgress,
        resetProgress,
      }}
    >
      {children}
    </StudentProgressContext.Provider>
  );
};

export const useStudentProgress = () => {
  const context = useContext(StudentProgressContext);
  if (!context) {
    throw new Error('useStudentProgress must be used within a StudentProgressProvider');
  }
  return context;
};
