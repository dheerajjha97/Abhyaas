/**
 * SyncService:
 * Real-time synchronization engine that fetches the latest question papers,
 * revision notes, and syllabi from GitHub/CDN and stores them directly into
 * IndexedDB for high-speed offline access.
 */

import { questionRepository, normalizeSubject, normalizeClass } from './questionRepository';
import { notesRepository } from './notesRepository';
import { syllabusRepository } from './syllabusRepository';
import { savePaperToCache, getCacheStats, CacheStats } from '../utils/db';
import { getStoredStudentProfile } from '../utils/profileStorage';

export interface SyncProgress {
  stage: 'checking' | 'papers' | 'notes' | 'syllabus' | 'complete' | 'error';
  message: string;
  percent: number;
  papersCount?: number;
  notesCount?: number;
  syllabusCount?: number;
}

export interface SyncOptions {
  classId?: string;
  selectedSubjects?: string[];
  syncAll?: boolean;
}

export interface SyncResult {
  success: boolean;
  papersSynced: number;
  notesSynced: number;
  syllabusSynced: number;
  stats: CacheStats;
  message: string;
  selectedSubjectsCount?: number;
  isFilteredBySubjects?: boolean;
}

const CDN_MIRRORS = [
  'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  'https://cdn.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
  'https://fastly.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
];

/**
 * Detect subject from file path or filename
 */
function detectSubjectFromPath(relPath: string): string {
  const lower = relPath.toLowerCase();
  
  // 1. Check parent folder name
  const segments = relPath.split('/');
  if (segments.length >= 3) {
    const folderSub = segments[segments.length - 2];
    const normFolder = normalizeSubject(folderSub);
    if (normFolder) return normFolder;
  }

  // 2. Check filename keywords
  if (lower.includes('polscience') || lower.includes('pol-science') || lower.includes('pol_science') || lower.includes('political')) {
    return 'Political Science';
  }
  if (lower.includes('homescience') || lower.includes('home-science') || lower.includes('home_science') || lower.includes('home science')) {
    return 'Home Science';
  }
  if (lower.includes('history') || lower.includes('itihas')) return 'History';
  if (lower.includes('geography') || lower.includes('bhugol')) return 'Geography';
  if (lower.includes('hindi')) return 'Hindi';
  if (lower.includes('english')) return 'English';
  if (lower.includes('physics') || lower.includes('bhautik')) return 'Physics';
  if (lower.includes('chemistry') || lower.includes('rasayan')) return 'Chemistry';
  if (lower.includes('biology') || lower.includes('jeev')) return 'Biology';
  if (lower.includes('mathematics') || lower.includes('math') || lower.includes('ganit')) return 'Mathematics';
  if (lower.includes('economics') || lower.includes('arthashastra')) return 'Economics';
  if (lower.includes('sociology') || lower.includes('samajshastra')) return 'Sociology';
  if (lower.includes('psychology') || lower.includes('manovigyan')) return 'Psychology';
  if (lower.includes('philosophy') || lower.includes('darshan')) return 'Philosophy';
  if (lower.includes('music') || lower.includes('sangeet')) return 'Music';
  if (lower.includes('agriculture') || lower.includes('krishi')) return 'Agriculture';
  if (lower.includes('computer') || lower.includes('cs')) return 'Computer Science';
  if (lower.includes('accountancy') || lower.includes('accounts')) return 'Accountancy';
  if (lower.includes('business') || lower.includes('bst')) return 'Business Studies';
  if (lower.includes('entrepreneurship') || lower.includes('eps')) return 'Entrepreneurship';
  if (lower.includes('social') || lower.includes('sst')) return 'Social Science';
  if (lower.includes('science') || lower.includes('vigyan')) return 'Science';
  if (lower.includes('sanskrit')) return 'Sanskrit';
  if (lower.includes('urdu')) return 'Urdu';
  if (lower.includes('maithili')) return 'Maithili';

  return '';
}

/**
 * Checks if a GitHub paper path belongs to the student's selected class and subjects
 */
function isPaperMatchingFilters(
  relPath: string,
  targetClass?: string,
  selectedSubjects?: string[]
): boolean {
  const lower = relPath.toLowerCase();

  // Class filtering
  if (targetClass && targetClass !== 'all') {
    const normClass = normalizeClass(targetClass);
    if (normClass === '10') {
      if (!lower.includes('/x/') && !lower.includes('class10') && !lower.includes('class-10') && !lower.includes('class_10')) {
        return false;
      }
    } else if (normClass === '11') {
      if (!lower.includes('/xi/') && !lower.includes('class11') && !lower.includes('class-11') && !lower.includes('class_11')) {
        return false;
      }
    } else if (normClass === '12') {
      if (!lower.includes('/xii/') && !lower.includes('class12') && !lower.includes('class-12') && !lower.includes('class_12')) {
        return false;
      }
    }
  }

  // Subject filtering
  if (selectedSubjects && selectedSubjects.length > 0) {
    const detectedSub = detectSubjectFromPath(relPath);
    if (!detectedSub) return true; // Keep if uncertain to avoid missing papers

    const normDetected = normalizeSubject(detectedSub).toLowerCase();
    const normalizedSelected = selectedSubjects.map((s) => normalizeSubject(s).toLowerCase());

    const isMatch = normalizedSelected.some((sel) => {
      if (sel === normDetected) return true;
      if (normDetected.includes(sel) || sel.includes(normDetected)) return true;
      return false;
    });

    return isMatch;
  }

  return true;
}

export async function syncAllFreshData(
  onProgress?: (progress: SyncProgress) => void,
  options?: SyncOptions
): Promise<SyncResult> {
  const report = (stage: SyncProgress['stage'], message: string, percent: number, extras: Partial<SyncProgress> = {}) => {
    if (onProgress) {
      onProgress({ stage, message, percent, ...extras });
    }
  };

  // Determine filtering criteria
  const profile = getStoredStudentProfile();
  const syncAll = Boolean(options?.syncAll);
  const targetClass = options?.classId || profile.classId || '12';
  const selectedSubjects = syncAll
    ? undefined
    : (options?.selectedSubjects || profile.selectedSubjects || []);

  const isFiltered = !syncAll && selectedSubjects && selectedSubjects.length > 0;
  const subjectsDisplay = isFiltered ? selectedSubjects.join(', ') : 'सभी विषय';

  report('checking', `नवीनतम अध्ययन सामग्री चेक हो रही है (${isFiltered ? `Class ${targetClass} • चुने हुए विषय` : 'सभी विषय'})...`, 10);

  let papersSynced = 0;
  let notesSynced = 0;
  let syllabusSynced = 0;

  try {
    // 1. Fetch GitHub Tree with cache-busting
    const treeApiUrls = [
      `https://api.github.com/repos/dheerajjha97/AbhyaasData/git/trees/main?recursive=1&t=${Date.now()}`,
      `https://api.github.com/repos/dheerajjha97/AbhyaasData/git/trees/master?recursive=1&t=${Date.now()}`,
    ];

    let treeData: any = null;
    for (const treeUrl of treeApiUrls) {
      try {
        const res = await fetch(treeUrl, { cache: 'no-cache' });
        if (res.ok) {
          treeData = await res.json();
          break;
        }
      } catch {}
    }

    const allPaperPaths: string[] = [];
    if (treeData && Array.isArray(treeData.tree)) {
      treeData.tree.forEach((item: any) => {
        if (
          item &&
          item.type === 'blob' &&
          typeof item.path === 'string' &&
          item.path.toLowerCase().endsWith('.json') &&
          item.path.toLowerCase().includes('papers/')
        ) {
          allPaperPaths.push(item.path);
        }
      });
    }

    // Filter paper paths based on student's selected class and subjects
    const paperPaths = isFiltered
      ? allPaperPaths.filter((path) => isPaperMatchingFilters(path, targetClass, selectedSubjects))
      : allPaperPaths;

    const paperCountToDownload = paperPaths.length;

    report(
      'papers',
      isFiltered
        ? `आपके चुने गए विषयों (${selectedSubjects.length}) के ${paperCountToDownload} प्रश्न पत्र खोजे गए। डाउनलोड हो रहे हैं...`
        : `कुल ${paperCountToDownload} प्रश्न पत्र खोजे गए। डाउनलोड व ऑफलाइन सेव हो रहे हैं...`,
      25,
      { papersCount: paperCountToDownload }
    );

    // 2. Fetch and store papers in parallel chunks of 8
    const batchSize = 8;
    for (let i = 0; i < paperPaths.length; i += batchSize) {
      const batch = paperPaths.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (relPath) => {
          for (const mirror of CDN_MIRRORS) {
            try {
              const url = encodeURI(`${mirror}/${relPath}?t=${Date.now()}`);
              const res = await fetch(url, { cache: 'no-cache' });
              if (res.ok) {
                const rawJson = await res.json();
                const parsed = (questionRepository as any).parseRemotePaperJson(rawJson, relPath);
                if (parsed && parsed.id) {
                  await savePaperToCache(parsed);
                  papersSynced++;
                  break;
                }
              }
            } catch {}
          }
        })
      );

      const percent = Math.min(75, Math.round(25 + ((i + batch.length) / Math.max(1, paperPaths.length)) * 50));
      report(
        'papers',
        `प्रश्न पत्र डाउनलोड हो रहे हैं (${papersSynced}/${paperPaths.length})...`,
        percent,
        { papersCount: papersSynced }
      );
    }

    // Refresh Question Repository in-memory list
    await questionRepository.getPapersList(targetClass, undefined, true);

    // 3. Sync Notes for student's selected subjects (or all)
    report('notes', 'रिवीजन नोट्स (Chapter Notes) सिंक हो रहे हैं...', 80);
    const subjectsToSyncNotes = isFiltered
      ? selectedSubjects
      : ['Political Science', 'History', 'Geography', 'Hindi', 'Physics', 'Chemistry', 'Biology'];

    for (const sub of subjectsToSyncNotes) {
      try {
        const notes = await notesRepository.getNotesForSubject(targetClass, sub, true);
        if (notes && notes.length > 0) {
          notesSynced += notes.length;
        }
      } catch (e) {
        console.warn(`Notes sync warning for ${sub}:`, e);
      }
    }

    // 4. Sync Syllabus for student's selected subjects (or all)
    report('syllabus', 'पाठ्यक्रम एवं ब्लूप्रिंट (Syllabus) सिंक हो रहा है...', 90);
    const subjectsToSyncSyllabus = isFiltered
      ? selectedSubjects
      : ['History', 'Political Science', 'Geography', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'Mathematics'];

    for (const sub of subjectsToSyncSyllabus) {
      try {
        const syl = await syllabusRepository.getSyllabus(targetClass, sub, true);
        if (syl) syllabusSynced++;
      } catch {}
    }

    // 5. Final Stats
    const stats = await getCacheStats();
    const finalMsg = isFiltered
      ? `डेटा सिंक सफल! आपके ${selectedSubjects.length} विषयों के ${papersSynced} पेपर्स, ${notesSynced} नोट्स और ${syllabusSynced} सिलेबस ऑफ़लाइन उपलब्ध हैं।`
      : `डेटा सिंक सफल! कुल ${papersSynced || stats.paperCount} पेपर्स, ${notesSynced} नोट्स और ${syllabusSynced} सिलेबस ऑफ़लाइन उपलब्ध हैं।`;

    report(
      'complete',
      finalMsg,
      100,
      {
        papersCount: papersSynced || stats.paperCount,
        notesCount: notesSynced,
        syllabusCount: syllabusSynced,
      }
    );

    return {
      success: true,
      papersSynced: papersSynced || stats.paperCount,
      notesSynced,
      syllabusSynced,
      stats,
      message: finalMsg,
      selectedSubjectsCount: isFiltered ? selectedSubjects.length : undefined,
      isFilteredBySubjects: isFiltered,
    };
  } catch (err: any) {
    console.error('Data sync failed:', err);
    report('error', 'सिंक के दौरान समस्या आई, कृपया इंटरनेट कनेक्शन जांचें।', 100);
    const stats = await getCacheStats();
    return {
      success: false,
      papersSynced,
      notesSynced,
      syllabusSynced,
      stats,
      message: 'सिंकिंग में आंशिक त्रुटि आई, कृपया पुनः प्रयास करें।',
      isFilteredBySubjects: isFiltered,
    };
  }
}

