import { StudentProfile, DEFAULT_STUDENT_PROFILE } from '../types/studentProfile';

const PROFILE_KEY = 'abhyaas_student_profile_v1';

export function getStoredStudentProfile(): StudentProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return { ...DEFAULT_STUDENT_PROFILE, isConfigured: false };
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_STUDENT_PROFILE,
      ...parsed,
      isConfigured: parsed.isConfigured !== undefined ? parsed.isConfigured : true,
      // Ensure at least one subject exists
      selectedSubjects:
        Array.isArray(parsed.selectedSubjects) && parsed.selectedSubjects.length > 0
          ? parsed.selectedSubjects
          : DEFAULT_STUDENT_PROFILE.selectedSubjects,
    };
  } catch (e) {
    console.error('Failed to load student profile', e);
    return { ...DEFAULT_STUDENT_PROFILE, isConfigured: false };
  }
}

export function saveStoredStudentProfile(profile: StudentProfile): void {
  try {
    const dataToSave = {
      ...profile,
      isConfigured: true,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(dataToSave));
    // Dispatch a storage event or custom event for reactive tabs/components
    window.dispatchEvent(new CustomEvent('student-profile-changed', { detail: dataToSave }));
  } catch (e) {
    console.error('Failed to save student profile', e);
  }
}
