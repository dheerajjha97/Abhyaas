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
            const data: SyllabusData = await res.json();
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
        const data: SyllabusData = await res.json();
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

