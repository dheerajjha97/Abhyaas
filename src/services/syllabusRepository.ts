import { SyllabusData } from '../types/syllabus';
import { normalizeSubject, normalizeClass } from './questionRepository';
import { getAppSettings } from '../utils/bookmarkStorage';

const CDN_MIRRORS = [
  'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  'https://cdn.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
  'https://fastly.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
];

// Map of canonical subject names to file names
const SYLLABUS_FILE_MAP: Record<string, string> = {
  'geography': 'class12_geography_syllabus_20252026.json',
  'history': 'class12_history_syllabus_20252026.json',
  'pol-science': 'class12_polscience_syllabus_20252026.json',
  'political-science': 'class12_polscience_syllabus_20252026.json',
  'political science': 'class12_polscience_syllabus_20252026.json',
  'polscience': 'class12_polscience_syllabus_20252026.json',
};

export interface MarksScheme {
  totalMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  hasPractical: boolean;
  stream: string;
}

export function getSubjectMarksScheme(subjectInput: string, classId?: string): MarksScheme {
  const norm = (subjectInput || '').toLowerCase().trim();
  const isClass10 = classId === '10';

  if (isClass10) {
    if (norm.includes('sci') || norm.includes('विज्ञान') || norm.includes('social') || norm.includes('सामाजिक')) {
      return { totalMarks: 100, theoryMarks: 80, practicalMarks: 20, hasPractical: true, stream: 'General' };
    }
    return { totalMarks: 100, theoryMarks: 100, practicalMarks: 0, hasPractical: false, stream: 'General' };
  }

  // Class 11 & 12 Practical Subjects:
  // Geography, Physics, Chemistry, Biology, Home Science, Psychology, Agriculture, Computer Science, EPS
  const isPractical =
    norm.includes('geo') || norm.includes('भूगोल') ||
    norm.includes('phy') || norm.includes('भौतिक') ||
    norm.includes('chem') || norm.includes('रसायन') ||
    norm.includes('bio') || norm.includes('जीव') ||
    norm.includes('hsci') || norm.includes('home') || norm.includes('गृह') ||
    norm.includes('psy') || norm.includes('मनोविज्ञान') ||
    norm.includes('agri') || norm.includes('कृषि') ||
    norm.includes('cs') || norm.includes('computer') || norm.includes('कंप्यूटर') ||
    norm.includes('eps') || norm.includes('उद्यमिता');

  // Music in BSEB: 30 Theory + 70 Practical = 100 Total
  if (norm.includes('music') || norm.includes('संगीत')) {
    return { totalMarks: 100, theoryMarks: 30, practicalMarks: 70, hasPractical: true, stream: 'Arts (कला संकाय)' };
  }

  if (isPractical) {
    let stream = 'Arts (कला संकाय)';
    if (norm.includes('phy') || norm.includes('chem') || norm.includes('bio') || norm.includes('agri') || norm.includes('cs')) {
      stream = 'Science (विज्ञान संकाय)';
    } else if (norm.includes('eps')) {
      stream = 'Commerce (वाणिज्य संकाय)';
    }
    return { totalMarks: 100, theoryMarks: 70, practicalMarks: 30, hasPractical: true, stream };
  }

  // Non-Practical Subjects: Political Science, History, Economics, Hindi, English, Math, Sociology, Philosophy, etc.
  // In BSEB & all boards, non-practical subjects have 100 Theory marks and 0 practical marks. Total marks is always 100.
  let stream = 'Arts (कला संकाय)';
  if (norm.includes('math') || norm.includes('गणित')) stream = 'Science / Arts';
  else if (norm.includes('acc') || norm.includes('bst') || norm.includes('business')) stream = 'Commerce (वाणिज्य संकाय)';
  else if (norm.includes('hindi') || norm.includes('eng') || norm.includes('संस') || norm.includes('urdu') || norm.includes('maithili')) stream = 'भाषा (Language)';

  return { totalMarks: 100, theoryMarks: 100, practicalMarks: 0, hasPractical: false, stream };
}

function normalizeSyllabus(data: SyllabusData, subjectInput: string, classId: string): SyllabusData {
  if (!data || !data.syllabus) return data;
  const scheme = getSubjectMarksScheme(subjectInput || data.syllabus.subjectName || data.syllabus.subjectId, classId);

  // If the dataset erroneously has 70 marks for non-practical subjects or 70 total for practical subjects,
  // enforce the official board examination pattern:
  return {
    ...data,
    syllabus: {
      ...data.syllabus,
      totalMarks: 100, // Total subject marks is ALWAYS 100 in board exams
      theoryMarks: scheme.theoryMarks,
      practicalMarks: scheme.practicalMarks,
      // Fix accidental "Science (PCB / PCM)" on Arts subjects like Political Science & History
      stream: (data.syllabus.stream && !data.syllabus.stream.includes('Science (PCB / PCM)'))
        ? data.syllabus.stream
        : scheme.stream,
    },
  };
}

class SyllabusRepository {
  private cache = new Map<string, SyllabusData>();

  clearCache(): void {
    this.cache.clear();
  }

  async getSyllabus(
    classId: string,
    subjectInput: string,
    forceRefresh: boolean = false
  ): Promise<SyllabusData | null> {
    const cls = normalizeClass(classId);
    const subjectNorm = normalizeSubject(subjectInput).toLowerCase();
    const cacheKey = `${cls}_${subjectNorm}`;

    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Determine filename
    let fileName = SYLLABUS_FILE_MAP[subjectNorm];
    if (!fileName) {
      if (subjectNorm.includes('geo')) fileName = 'class12_geography_syllabus_20252026.json';
      else if (subjectNorm.includes('hist')) fileName = 'class12_history_syllabus_20252026.json';
      else if (subjectNorm.includes('pol')) fileName = 'class12_polscience_syllabus_20252026.json';
    }

    if (!fileName) {
      return null;
    }

    const isOffline = typeof navigator !== 'undefined' && (!navigator.onLine || getAppSettings().offlineMode);

    // 1. If online, ALWAYS try GitHub / CDN mirrors first to get latest updates
    if (!isOffline) {
      const cdnPath = `Syllabus/XII/${fileName}`;
      for (const mirror of CDN_MIRRORS) {
        try {
          const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
          const url = `${mirror}/${encodeURI(cdnPath)}${cacheBuster}`;
          const res = await fetch(url, {
            cache: forceRefresh ? 'no-cache' : 'default',
          });
          if (res.ok) {
            const rawData: SyllabusData = await res.json();
            const data = normalizeSyllabus(rawData, subjectNorm, classId);
            this.cache.set(cacheKey, data);
            return data;
          }
        } catch {
          // Continue to next mirror
        }
      }
    }

    // 2. Fallback: local bundled data (for offline or if GitHub is unreachable)
    try {
      const localUrl = `/data/syllabus/${fileName}${forceRefresh ? `?t=${Date.now()}` : ''}`;
      const res = await fetch(localUrl);
      if (res.ok) {
        const rawData: SyllabusData = await res.json();
        const data = normalizeSyllabus(rawData, subjectNorm, classId);
        this.cache.set(cacheKey, data);
        return data;
      }
    } catch {
      // Local fetch failed
    }

    return null;
  }


  getAvailableSyllabiSubjects(): string[] {
    return ['History', 'Political Science', 'Geography'];
  }
}

export const syllabusRepository = new SyllabusRepository();

