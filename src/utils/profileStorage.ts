import { StudentProfile, DEFAULT_STUDENT_PROFILE, DEFAULT_CLASS_SUBJECTS } from '../types/studentProfile';

const PROFILE_KEY = 'abhyaas_student_profile_v1';

export function getStoredStudentProfile(): StudentProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return { ...DEFAULT_STUDENT_PROFILE, isConfigured: false };
    const parsed = JSON.parse(data);

    const activeClassId = parsed.classId || DEFAULT_STUDENT_PROFILE.classId;

    // Load or initialize per-class subjects map
    const existingClassSubjects: Record<string, string[]> = parsed.classSubjects || {
      ...DEFAULT_CLASS_SUBJECTS,
      [activeClassId]:
        Array.isArray(parsed.selectedSubjects) && parsed.selectedSubjects.length > 0
          ? parsed.selectedSubjects
          : (DEFAULT_CLASS_SUBJECTS[activeClassId] || DEFAULT_STUDENT_PROFILE.selectedSubjects),
    };

    // Active subjects for the current class
    const activeSubjects =
      existingClassSubjects[activeClassId] && existingClassSubjects[activeClassId].length > 0
        ? existingClassSubjects[activeClassId]
        : Array.isArray(parsed.selectedSubjects) && parsed.selectedSubjects.length > 0
        ? parsed.selectedSubjects
        : DEFAULT_CLASS_SUBJECTS[activeClassId] || DEFAULT_STUDENT_PROFILE.selectedSubjects;

    return {
      ...DEFAULT_STUDENT_PROFILE,
      ...parsed,
      classId: activeClassId,
      classSubjects: existingClassSubjects,
      selectedSubjects: activeSubjects,
      isConfigured: parsed.isConfigured !== undefined ? parsed.isConfigured : true,
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
