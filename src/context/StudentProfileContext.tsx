import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StudentProfile, DEFAULT_STUDENT_PROFILE } from '../types/studentProfile';
import { getStoredStudentProfile, saveStoredStudentProfile } from '../utils/profileStorage';
import {
  auth,
  googleProvider,
  db,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  User,
} from '../lib/firebase';

export type CloudSyncStatus = 'synced' | 'saving' | 'offline' | 'unauthenticated';

interface StudentProfileContextType {
  profile: StudentProfile;
  currentUser: User | null;
  isSyncing: boolean;
  cloudSyncStatus: CloudSyncStatus;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  setClassId: (classId: string) => void;
  setSubjects: (subjects: string[]) => void;
  toggleSubject: (subjectName: string) => void;
  resetToDefaults: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export const StudentProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(getStoredStudentProfile());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('unauthenticated');
  // If the profile has never been configured by the user, automatically prompt them on app launch
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(!profile.isConfigured);

  // Sync profile to Firestore for logged-in user
  const syncProfileToCloud = useCallback(async (profileToSave: StudentProfile, uid?: string) => {
    const targetUid = uid || currentUser?.uid;
    if (!targetUid) return;

    try {
      setCloudSyncStatus('saving');
      const userRef = doc(db, 'users', targetUid);
      const dataToSave = {
        name: profileToSave.name || '',
        classId: profileToSave.classId || '12',
        board: profileToSave.board || 'BSEB (Bihar Board)',
        stream: profileToSave.stream || 'Arts',
        selectedSubjects: profileToSave.selectedSubjects || [],
        classSubjects: profileToSave.classSubjects || {},
        avatarEmoji: profileToSave.avatarEmoji || '🎓',
        targetYear: profileToSave.targetYear || 2026,
        lastUpdated: Date.now(),
      };
      await setDoc(userRef, dataToSave, { merge: true });
      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Failed to sync profile to Firestore:', err);
      setCloudSyncStatus('offline');
    }
  }, [currentUser?.uid]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setCloudSyncStatus('saving');
        try {
          setIsSyncing(true);
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const cloudData = snap.data();
            setProfile((local) => {
              const merged: StudentProfile = {
                ...local,
                ...cloudData,
                name: cloudData.name || user.displayName || local.name,
                classId: cloudData.classId || local.classId,
                stream: cloudData.stream || local.stream,
                selectedSubjects: cloudData.selectedSubjects || local.selectedSubjects,
                classSubjects: cloudData.classSubjects || local.classSubjects,
                isConfigured: true,
              };
              saveStoredStudentProfile(merged);
              return merged;
            });
            setCloudSyncStatus('synced');
          } else {
            // New user in Firestore: upload current local profile
            const currentLocal = getStoredStudentProfile();
            const initialToSave: StudentProfile = {
              ...currentLocal,
              name: currentLocal.name || user.displayName || 'विद्यार्थी',
            };
            setProfile(initialToSave);
            saveStoredStudentProfile(initialToSave);
            await syncProfileToCloud(initialToSave, user.uid);
          }
        } catch (err) {
          console.warn('Error reading user profile from Firestore:', err);
          setCloudSyncStatus('offline');
        } finally {
          setIsSyncing(false);
        }
      } else {
        setCloudSyncStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, [syncProfileToCloud]);

  useEffect(() => {
    const handleProfileChange = (e: CustomEvent<StudentProfile>) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };

    window.addEventListener('student-profile-changed' as any, handleProfileChange as any);
    return () => {
      window.removeEventListener('student-profile-changed' as any, handleProfileChange as any);
    };
  }, []);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const signInWithGoogle = async () => {
    try {
      setIsSyncing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      alert(err.message || 'Google साइन-इन विफल रहा।');
    } finally {
      setIsSyncing(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setCloudSyncStatus('unauthenticated');
    } catch (err) {
      console.error('Sign-Out failed:', err);
    }
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const activeClassId = updates.classId || prev.classId;
      const updatedClassSubjects = {
        ...(prev.classSubjects || {}),
        ...(updates.classSubjects || {}),
      };

      if (updates.selectedSubjects) {
        updatedClassSubjects[activeClassId] = updates.selectedSubjects;
      }

      const activeSubjects =
        updates.selectedSubjects ||
        updatedClassSubjects[activeClassId] ||
        prev.selectedSubjects;

      const updated: StudentProfile = {
        ...prev,
        ...updates,
        classId: activeClassId,
        classSubjects: updatedClassSubjects,
        selectedSubjects: activeSubjects,
        isConfigured: true,
      };
      saveStoredStudentProfile(updated);
      syncProfileToCloud(updated);
      return updated;
    });
  };

  const setClassId = (newClassId: string) => {
    setProfile((prev) => {
      // 1. Remember whatever subjects the user had active for the current/previous class
      const updatedClassSubjects = {
        ...(prev.classSubjects || {}),
        [prev.classId]: prev.selectedSubjects,
      };

      // 2. Look up the remembered subjects for the target newClassId
      let targetSubjects = updatedClassSubjects[newClassId];
      if (!targetSubjects || targetSubjects.length === 0) {
        // Sensible defaults based on class and stream if first time visiting this class
        if (newClassId === '10') {
          targetSubjects = ['Science', 'Mathematics', 'Social Science', 'Hindi'];
        } else if (prev.stream === 'Science') {
          targetSubjects = ['Biology', 'Physics', 'Chemistry', 'Mathematics'];
        } else if (prev.stream === 'Arts') {
          targetSubjects = ['Political Science', 'History', 'Geography', 'Hindi'];
        } else {
          targetSubjects = ['Mathematics', 'Economics', 'Hindi', 'English'];
        }
        updatedClassSubjects[newClassId] = targetSubjects;
      }

      const updated: StudentProfile = {
        ...prev,
        classId: newClassId,
        classSubjects: updatedClassSubjects,
        selectedSubjects: targetSubjects,
        isConfigured: true,
      };
      saveStoredStudentProfile(updated);
      syncProfileToCloud(updated);
      return updated;
    });
  };

  const setSubjects = (subjects: string[]) => {
    updateProfile({ selectedSubjects: subjects });
  };

  const toggleSubject = (subjectName: string) => {
    setProfile((prev) => {
      const current = prev.selectedSubjects || [];
      const exists = current.includes(subjectName);
      let updatedSubs: string[];
      if (exists) {
        if (current.length <= 1) return prev; // Keep at least one subject
        updatedSubs = current.filter((s) => s !== subjectName);
      } else {
        updatedSubs = [...current, subjectName];
      }
      const updatedClassSubjects = {
        ...(prev.classSubjects || {}),
        [prev.classId]: updatedSubs,
      };
      const updated: StudentProfile = {
        ...prev,
        selectedSubjects: updatedSubs,
        classSubjects: updatedClassSubjects,
        isConfigured: true,
      };
      saveStoredStudentProfile(updated);
      syncProfileToCloud(updated);
      return updated;
    });
  };

  const resetToDefaults = () => {
    saveStoredStudentProfile(DEFAULT_STUDENT_PROFILE);
    setProfile(DEFAULT_STUDENT_PROFILE);
    syncProfileToCloud(DEFAULT_STUDENT_PROFILE);
  };

  return (
    <StudentProfileContext.Provider
      value={{
        profile,
        currentUser,
        isSyncing,
        cloudSyncStatus,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        updateProfile,
        setClassId,
        setSubjects,
        toggleSubject,
        resetToDefaults,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
};

export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error('useStudentProfile must be used within a StudentProfileProvider');
  }
  return context;
};
