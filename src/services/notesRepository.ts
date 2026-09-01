import { NoteData } from '../types/notes';
import { normalizeSubject, normalizeClass } from './questionRepository';

const CDN_MIRRORS = [
  'https://cdn.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
  'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  'https://fastly.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
];

const NOTES_FILE_MAP: Record<string, string[]> = {
  'pol-science': ['class12_pol-science_chap1_notes.json'],
  'political-science': ['class12_pol-science_chap1_notes.json'],
  'political science': ['class12_pol-science_chap1_notes.json'],
};

class NotesRepository {
  private cache = new Map<string, NoteData[]>();

  async getNotesForSubject(classId: string, subjectInput: string): Promise<NoteData[]> {
    const cls = normalizeClass(classId);
    const subjectNorm = normalizeSubject(subjectInput).toLowerCase();
    const cacheKey = `${cls}_${subjectNorm}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const files = NOTES_FILE_MAP[subjectNorm] || (subjectNorm.includes('pol') ? ['class12_pol-science_chap1_notes.json'] : []);
    const notes: NoteData[] = [];

    for (const fileName of files) {
      // 1. Local fetch
      let fetched = false;
      try {
        const localUrl = `/data/notes/${fileName}`;
        const res = await fetch(localUrl);
        if (res.ok) {
          const data: NoteData = await res.json();
          notes.push(data);
          fetched = true;
        }
      } catch {}

      // 2. CDN fetch
      if (!fetched) {
        const cdnPath = `Notes/XII/Political Science/${fileName}`;
        for (const mirror of CDN_MIRRORS) {
          try {
            const url = `${mirror}/${encodeURI(cdnPath)}`;
            const res = await fetch(url);
            if (res.ok) {
              const data: NoteData = await res.json();
              notes.push(data);
              break;
            }
          } catch {}
        }
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
