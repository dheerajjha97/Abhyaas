import { NoteData } from '../types/notes';
import { normalizeSubject, normalizeClass } from './questionRepository';
import { getAppSettings } from '../utils/bookmarkStorage';

const CDN_MIRRORS = [
  'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  'https://cdn.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
  'https://fastly.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
];

const NOTES_FILE_MAP: Record<string, string[]> = {
  'pol-science': ['class12_pol-science_chap1_notes.json'],
  'political-science': ['class12_pol-science_chap1_notes.json'],
  'political science': ['class12_pol-science_chap1_notes.json'],
};

class NotesRepository {
  private cache = new Map<string, NoteData[]>();

  clearCache(): void {
    this.cache.clear();
  }

  async getNotesForSubject(
    classId: string,
    subjectInput: string,
    forceRefresh: boolean = false
  ): Promise<NoteData[]> {
    const cls = normalizeClass(classId);
    const subjectNorm = normalizeSubject(subjectInput).toLowerCase();
    const cacheKey = `${cls}_${subjectNorm}`;

    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const files = NOTES_FILE_MAP[subjectNorm] || (subjectNorm.includes('pol') ? ['class12_pol-science_chap1_notes.json'] : []);
    const notes: NoteData[] = [];
    const isOffline = typeof navigator !== 'undefined' && (!navigator.onLine || getAppSettings().offlineMode);

    for (const fileName of files) {
      let fetched = false;

      // 1. Remote GitHub fetch first if online
      if (!isOffline) {
        const cdnPath = `Notes/XII/Political Science/${fileName}`;
        for (const mirror of CDN_MIRRORS) {
          try {
            const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
            const url = `${mirror}/${encodeURI(cdnPath)}${cacheBuster}`;
            const res = await fetch(url, {
              cache: forceRefresh ? 'no-cache' : 'default',
            });
            if (res.ok) {
              const data: NoteData = await res.json();
              notes.push(data);
              fetched = true;
              break;
            }
          } catch {}
        }
      }

      // 2. Local fallback if offline or remote failed
      if (!fetched) {
        try {
          const localUrl = `/data/notes/${fileName}${forceRefresh ? `?t=${Date.now()}` : ''}`;
          const res = await fetch(localUrl);
          if (res.ok) {
            const data: NoteData = await res.json();
            notes.push(data);
            fetched = true;
          }
        } catch {}
      }
    }

    if (notes.length > 0) {
      this.cache.set(cacheKey, notes);
    }
    return notes;
  }

  getAvailableNotesSubjects(): string[] {
    return ['Political Science'];
  }
}

export const notesRepository = new NotesRepository();

