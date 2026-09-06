import { NoteData } from '../types/notes';
import { normalizeSubject, normalizeClass } from './questionRepository';
import { getAppSettings } from '../utils/bookmarkStorage';

const CDN_MIRRORS = [
  'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  'https://cdn.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
  'https://fastly.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
];

const NOTES_FILE_MAP: Record<string, string[]> = {
  'pol-science': [
    'class12_pol-science_chap1_notes.json',
    'class12_pol-science_chap2_notes.json',
  ],
  'political-science': [
    'class12_pol-science_chap1_notes.json',
    'class12_pol-science_chap2_notes.json',
  ],
  'political science': [
    'class12_pol-science_chap1_notes.json',
    'class12_pol-science_chap2_notes.json',
  ],
  'history': [
    'class12_history_chap1_notes.json',
  ],
  'geography': [
    'class12_geography_chap1_notes.json',
  ],
};

function getFolderConfig(classId: string, subjectInput: string): { folder: string; prefix: string; subjectFolder: string } {
  const cls = normalizeClass(classId);
  const roman = cls === '12' ? 'XII' : cls === '11' ? 'XI' : 'X';
  const subNorm = normalizeSubject(subjectInput).toLowerCase();

  let subjectFolder = 'Political Science';
  let prefix = `class${cls}_pol-science`;

  if (subNorm.includes('pol')) {
    subjectFolder = 'Political Science';
    prefix = `class${cls}_pol-science`;
  } else if (subNorm.includes('hist')) {
    subjectFolder = 'History';
    prefix = `class${cls}_history`;
  } else if (subNorm.includes('geo')) {
    subjectFolder = 'Geography';
    prefix = `class${cls}_geography`;
  } else if (subNorm.includes('hin')) {
    subjectFolder = 'Hindi';
    prefix = `class${cls}_hindi`;
  } else if (subNorm.includes('phy')) {
    subjectFolder = 'Physics';
    prefix = `class${cls}_physics`;
  } else if (subNorm.includes('chem')) {
    subjectFolder = 'Chemistry';
    prefix = `class${cls}_chemistry`;
  } else if (subNorm.includes('bio')) {
    subjectFolder = 'Biology';
    prefix = `class${cls}_biology`;
  } else if (subNorm.includes('math')) {
    subjectFolder = 'Mathematics';
    prefix = `class${cls}_math`;
  } else {
    subjectFolder = subjectInput;
    prefix = `class${cls}_${subNorm.replace(/\s+/g, '_')}`;
  }

  return {
    folder: `Notes/${roman}/${subjectFolder}`,
    prefix,
    subjectFolder,
  };
}

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

    const { folder, prefix } = getFolderConfig(classId, subjectInput);
    const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false) || Boolean(getAppSettings()?.offlineMode);

    // Collect candidates to fetch
    const fileSet = new Set<string>();

    // 1. Always include known files from NOTES_FILE_MAP
    const staticFiles = NOTES_FILE_MAP[subjectNorm] || NOTES_FILE_MAP[prefix] || (
      subjectNorm.includes('pol')
        ? ['class12_pol-science_chap1_notes.json', 'class12_pol-science_chap2_notes.json']
        : []
    );
    staticFiles.forEach((f) => fileSet.add(f));

    // 2. Discover newly uploaded chapters from GitHub Contents API if online
    if (!isOffline) {
      try {
        const ghUrl = `https://api.github.com/repos/dheerajjha97/AbhyaasData/contents/${encodeURI(folder)}${forceRefresh ? `?t=${Date.now()}` : ''}`;
        const ghRes = await fetch(ghUrl);
        if (ghRes.ok) {
          const items = await ghRes.json();
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              if (item && typeof item.name === 'string' && item.name.endsWith('.json')) {
                fileSet.add(item.name);
              }
            });
          }
        }
      } catch {
        // Ignore network / rate-limit failures and proceed with static & probe
      }

      // 3. Sequential probe for chapters up to 10 if not already in set
      for (let chap = 1; chap <= 10; chap++) {
        const probeName = `${prefix}_chap${chap}_notes.json`;
        if (!fileSet.has(probeName) && chap <= 4) {
          fileSet.add(probeName);
        }
      }
    }

    const filesToFetch = Array.from(fileSet);
    const notes: NoteData[] = [];
    const seenNoteIds = new Set<string>();

    // Fetch each file in parallel
    await Promise.all(
      filesToFetch.map(async (fileName) => {
        let fetchedNote: NoteData | null = null;

        // Try CDN mirrors if online
        if (!isOffline) {
          const cdnPath = `${folder}/${fileName}`;
          for (const mirror of CDN_MIRRORS) {
            try {
              const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
              const url = `${mirror}/${encodeURI(cdnPath)}${cacheBuster}`;
              const res = await fetch(url, {
                cache: forceRefresh ? 'no-cache' : 'default',
              });
              if (res.ok) {
                fetchedNote = await res.json();
                break;
              }
            } catch {}
          }
        }

        // Local fallback
        if (!fetchedNote) {
          try {
            const localUrl = `/data/notes/${fileName}${forceRefresh ? `?t=${Date.now()}` : ''}`;
            const res = await fetch(localUrl);
            if (res.ok) {
              fetchedNote = await res.json();
            }
          } catch {}
        }

        if (fetchedNote && fetchedNote.sections && fetchedNote.sections.length > 0) {
          const uniqueKey = `${fetchedNote.chapterNumber || fileName}`;
          if (!seenNoteIds.has(uniqueKey)) {
            seenNoteIds.add(uniqueKey);
            notes.push(fetchedNote);
          }
        }
      })
    );

    // Sort notes sequentially by chapterNumber
    notes.sort((a, b) => {
      const numA = Number(a.chapterNumber) || 0;
      const numB = Number(b.chapterNumber) || 0;
      return numA - numB;
    });

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

