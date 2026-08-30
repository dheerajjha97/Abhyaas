import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, DEFAULT_STUDENT_PROFILE } from '../types/studentProfile';
import { getStoredStudentProfile, saveStoredStudentProfile } from '../utils/profileStorage';

interface StudentProfileContextType {
  profile: StudentProfile;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  setClassId: (classId: string) => void;
  setSubjects: (subjects: string[]) => void;
  toggleSubject: (subjectName: string) => void;
  resetToDefaults: () => void;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export const StudentProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(getStoredStudentProfile());
  // If the profile has never been configured by the user, automatically prompt them on app launch
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(!profile.isConfigured);

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

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates, isConfigured: true };
      saveStoredStudentProfile(updated);
      return updated;
    });
  };

  const setClassId = (classId: string) => {
    // When changing class, check if existing subjects match class, or set default subjects
    let defaultSubjects = profile.selectedSubjects;
    if (classId === '10') {
      defaultSubjects = ['Science', 'Mathematics', 'Social Science', 'Hindi'];
    } else if (profile.selectedSubjects.some((s) => s === 'Science' || s === 'Social Science')) {
      defaultSubjects = ['Biology', 'Physics', 'Chemistry', 'Mathematics'];
    }

    updateProfile({
      classId,
      selectedSubjects: defaultSubjects,
    });
  };

  const setSubjects = (subjects: string[]) => {
    updateProfile({ selectedSubjects: subjects });
  };

  const toggleSubject = (subjectName: string) => {
    const current = profile.selectedSubjects;
    const exists = current.includes(subjectName);
    let updated: string[];
    if (exists) {
      if (current.length <= 1) return; // Keep at least one subject
      updated = current.filter((s) => s !== subjectName);
    } else {
      updated = [...current, subjectName];
    }
    updateProfile({ selectedSubjects: updated });
  };

  const resetToDefaults = () => {
    saveStoredStudentProfile(DEFAULT_STUDENT_PROFILE);
    setProfile(DEFAULT_STUDENT_PROFILE);
  };

  return (
    <StudentProfileContext.Provider
      value={{
        profile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        updateProfile,
        setClassId,
        setSubjects,
        toggleSubject,
        resetToDefaults,
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
