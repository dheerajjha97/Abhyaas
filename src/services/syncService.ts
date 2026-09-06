/**
 * SyncService:
 * Real-time synchronization engine that fetches the latest question papers,
 * revision notes, and syllabi from GitHub/CDN and stores them directly into
 * IndexedDB for high-speed offline access.
 */

import { questionRepository } from './questionRepository';
import { notesRepository } from './notesRepository';
import { syllabusRepository } from './syllabusRepository';
import { savePaperToCache, getCacheStats, CacheStats } from '../utils/db';

export interface SyncProgress {
  stage: 'checking' | 'papers' | 'notes' | 'syllabus' | 'complete' | 'error';
  message: string;
  percent: number;
  papersCount?: number;
  notesCount?: number;
  syllabusCount?: number;
}

export interface SyncResult {
  success: boolean;
  papersSynced: number;
  notesSynced: number;
  syllabusSynced: number;
  stats: CacheStats;
  message: string;
}

const CDN_MIRRORS = [
  'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  'https://cdn.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
  'https://fastly.jsdelivr.net/gh/dheerajjha97/AbhyaasData@main',
];

export async function syncAllFreshData(
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const report = (stage: SyncProgress['stage'], message: string, percent: number, extras: Partial<SyncProgress> = {}) => {
    if (onProgress) {
      onProgress({ stage, message, percent, ...extras });
    }
  };

  report('checking', 'GitHub रिपॉजिटरी से नवीनतम डेटा चेक किया जा रहा है...', 10);

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

    const paperPaths: string[] = [];
    if (treeData && Array.isArray(treeData.tree)) {
      treeData.tree.forEach((item: any) => {
        if (
          item &&
          item.type === 'blob' &&
          typeof item.path === 'string' &&
          item.path.toLowerCase().endsWith('.json') &&
          item.path.toLowerCase().includes('papers/')
        ) {
          paperPaths.push(item.path);
        }
      });
    }

    report(
      'papers',
      `${paperPaths.length || 'सभी'} प्रश्न पत्र खोजे गए। डाउनलोड व ऑफलाइन सेव हो रहे हैं...`,
      25,
      { papersCount: paperPaths.length }
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
    await questionRepository.getPapersList(undefined, undefined, true);

    // 3. Sync Notes (Political Science and other subjects)
    report('notes', 'रिवीजन नोट्स (Chapter Notes) सिंक हो रहे हैं...', 80);
    try {
      const polNotes = await notesRepository.getNotesForSubject('12', 'Political Science', true);
      notesSynced += polNotes.length;
    } catch (e) {
      console.warn('Notes sync warning:', e);
    }

    // 4. Sync Syllabus
    report('syllabus', 'पाठ्यक्रम एवं ब्लूप्रिंट (Syllabus) सिंक हो रहा है...', 90);
    const syllabusSubjects = ['History', 'Political Science', 'Geography'];
    for (const sub of syllabusSubjects) {
      try {
        const syl = await syllabusRepository.getSyllabus('12', sub, true);
        if (syl) syllabusSynced++;
      } catch {}
    }

    // 5. Final Stats
    const stats = await getCacheStats();
    report(
      'complete',
      `डेटा सिंक सफल! ${papersSynced || stats.paperCount} पेपर्स और ${notesSynced} नोट्स ऑफ़लाइन तैयार हैं।`,
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
      message: `सफलतापूर्वक ${papersSynced || stats.paperCount} प्रश्न पत्र, ${notesSynced} नोट्स और ${syllabusSynced} सिलेबस सिंक हो गए!`,
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
    };
  }
}
