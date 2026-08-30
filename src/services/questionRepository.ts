/**
 * Repository Pattern Architecture for Abhyaas
 * Decouples UI from data sources (GitHub JSON, IndexedDB Cache, Offline Paper Bank)
 */

import { Paper, PaperSummary, SearchResultItem } from '../types/question';
import { MOCK_PAPERS, MOCK_SUMMARIES } from '../data/mockPapers';
import { getPaperFromCache, savePaperToCache, getAllCachedPapers } from '../utils/db';
import { getAppSettings } from '../utils/bookmarkStorage';

export interface QuestionRepository {
  getPapersList(classId?: string, subjectId?: string): Promise<PaperSummary[]>;
  getPaperById(paperId: string): Promise<Paper | null>;
  searchQuestions(query: string, classId?: string): Promise<SearchResultItem[]>;
  prefetchPaper(paperId: string): Promise<void>;
}

// Known paths in GitHub repository (AbhyaasData)
const KNOWN_PAPER_PATHS = [
  'Papers/XII/Political Science/class12_polscience_2026_set_b.json',
  'Papers/XII/Political Science/class12_polscience_2026_set_h.json',
  'Papers/XII/Political Science/class12_polscience_2025_set_g.json',
  'Papers/XII/Political Science/class12_polscience_2024_set_a.json',
  'Papers/XII/Political Science/class12_polscience_2024_set_d.json',
  'Papers/XII/History/class12_history_2023_set_a.json',
];

const SUBJECT_ALIASES: Record<string, string> = {
  'polscience': 'Political Science',
  'pol-science': 'Political Science',
  'pol_science': 'Political Science',
  'politicalscience': 'Political Science',
  'political-science': 'Political Science',
  'political science': 'Political Science',
  'राजनीति विज्ञान': 'Political Science',
  'राजनीति शास्त्र': 'Political Science',

  'biology': 'Biology',
  'जीव विज्ञान': 'Biology',
  'bio': 'Biology',

  'physics': 'Physics',
  'भौतिकी': 'Physics',
  'भौतिक विज्ञान': 'Physics',
  'phy': 'Physics',

  'chemistry': 'Chemistry',
  'रसायन शास्त्र': 'Chemistry',
  'रसायन विज्ञान': 'Chemistry',
  'chem': 'Chemistry',

  'mathematics': 'Mathematics',
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'गणित': 'Mathematics',

  'history': 'History',
  'इतिहास': 'History',
  'hist': 'History',

  'geography': 'Geography',
  'भूगोल': 'Geography',
  'geo': 'Geography',

  'economics': 'Economics',
  'अर्थशास्त्र': 'Economics',
  'eco': 'Economics',

  'sociology': 'Sociology',
  'समाजशास्त्र': 'Sociology',

  'psychology': 'Psychology',
  'मनोविज्ञान': 'Psychology',

  'science': 'Science',
  'विज्ञान': 'Science',

  'social science': 'Social Science',
  'सामाजिक विज्ञान': 'Social Science',
  'sst': 'Social Science',

  'hindi': 'Hindi',
  'हिन्दी': 'Hindi',
  'हिंदी': 'Hindi',

  'english': 'English',
  'अंग्रेज़ी': 'English',
  'अंग्रेजी': 'English',

  'sanskrit': 'Sanskrit',
  'संस्कृत': 'Sanskrit',
};

function normalizeSubject(input?: string): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (SUBJECT_ALIASES[clean]) {
    return SUBJECT_ALIASES[clean];
  }
  const key = Object.keys(SUBJECT_ALIASES).find((k) => clean.includes(k) || k.includes(clean));
  if (key) {
    return SUBJECT_ALIASES[key];
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function normalizeClass(cls?: string): string {
  if (!cls) return '12';
  const c = String(cls).trim().toLowerCase().replace(/^class-?/, '');
  if (c === 'xii' || c === '12' || c === 'twelfth') return '12';
  if (c === 'xi' || c === '11' || c === 'eleventh') return '11';
  if (c === 'x' || c === '10' || c === 'tenth') return '10';
  return c;
}

export class GitHubQuestionRepository implements QuestionRepository {
  private repoBaseUrl: string;
  private paperPathMap = new Map<string, string>(); // paperId -> relative file path

  constructor() {
    this.repoBaseUrl = getAppSettings().githubRepoUrl;
    // Initialize default path mappings
    KNOWN_PAPER_PATHS.forEach((path) => {
      const filename = path.split('/').pop()?.replace(/\.json$/, '') || '';
      if (filename) {
        this.paperPathMap.set(filename, path);
        this.paperPathMap.set(filename.replace(/_/g, '-'), path);
        this.paperPathMap.set(filename.replace('class12_polscience', 'class-12_pol-science'), path);
        this.paperPathMap.set(filename.replace('class12_history', 'class-12_history'), path);
        this.paperPathMap.set(filename.replace('class12_polscience', 'class12_pol_science'), path);
      }
    });
  }

  /**
   * Parse remote schema 2.0 or 1.0 JSON format into standard internal Paper model
   */
  private parseRemotePaperJson(raw: any, rawPath?: string): Paper {
    if (raw.paper && Array.isArray(raw.questions)) {
      const meta = raw.paper;
      const rawClass = normalizeClass(String(meta.classId || ''));
      const rawSub = meta.subjectId || meta.subject || '';
      const formattedSubject = normalizeSubject(rawSub);

      const mcqs = raw.questions
        .filter((q: any) => q.type === 'mcq')
        .map((q: any) => {
          let optionsArr: string[] = [];
          let answerText = '';

          if (Array.isArray(q.options)) {
            optionsArr = q.options.map((opt: any) =>
              typeof opt === 'string'
                ? opt.trim()
                : (opt.textHindi || opt.text || opt.key || '').trim()
            );

            const rawCorrect =
              q.correctAnswer ??
              q.correctAnswerText ??
              q.answer ??
              q.correct_answer ??
              q.correct;

            if (rawCorrect !== undefined && rawCorrect !== null && rawCorrect !== '') {
              const rawStr = String(rawCorrect).trim();
              const keyUpper = rawStr.toUpperCase();

              // 1. Check if rawCorrect matches an option key (e.g. 'A', 'B', 'C', 'D') in options array objects
              const matchedOpt = q.options.find((opt: any) => {
                if (typeof opt === 'object' && opt) {
                  return (
                    (opt.key && opt.key.toUpperCase() === keyUpper) ||
                    (opt.id && opt.id.toLowerCase().endsWith(`-${rawStr.toLowerCase()}`))
                  );
                }
                return false;
              });

              if (matchedOpt) {
                answerText = (matchedOpt.textHindi || matchedOpt.text || matchedOpt.key || '').trim();
              } else {
                // 2. Check if key is A, B, C, D
                const keyIdx = ['A', 'B', 'C', 'D', 'E'].indexOf(keyUpper);
                if (keyIdx >= 0 && optionsArr[keyIdx]) {
                  answerText = optionsArr[keyIdx];
                } else {
                  // 3. Strip prefixes like "(D) " or "D. "
                  const cleanText = rawStr.replace(/^\(?([a-e0-9])\)?[\.\:\s\-]*/i, '').trim();
                  const optionMatch = optionsArr.find(
                    (opt) =>
                      opt.trim().toLowerCase() === cleanText.toLowerCase() ||
                      opt.trim().toLowerCase() === rawStr.toLowerCase()
                  );
                  answerText = optionMatch || cleanText || rawStr;
                }
              }
            } else {
              answerText = optionsArr[0] || '';
            }
          }

          return {
            id: q.id || `mcq-${Math.random()}`,
            question: (q.textHindi || q.text || '').trim(),
            options: optionsArr,
            answer: answerText,
            explanation: (
              q.explanationHindi ||
              q.explanation ||
              q.explanationText ||
              q.solution ||
              q.solutionHindi ||
              q.exp ||
              ''
            ).trim(),
          };
        });

      const shortQuestions = raw.questions
        .filter((q: any) => q.type === 'short')
        .map((q: any) => ({
          id: q.id || `short-${Math.random()}`,
          question: (q.textHindi || q.text || '').trim(),
          answer: (q.modelAnswer || q.answerText || q.answer || '').trim(),
        }));

      const longQuestions = raw.questions
        .filter((q: any) => q.type === 'long')
        .map((q: any) => ({
          id: q.id || `long-${Math.random()}`,
          question: (q.textHindi || q.text || '').trim(),
          answer: (q.modelAnswer || q.answerText || q.answer || '').trim(),
        }));

      const paperId = meta.id || (rawPath ? rawPath.split('/').pop()?.replace('.json', '') : '') || `paper-${Date.now()}`;

      return {
        id: paperId,
        class: rawClass,
        subject: formattedSubject,
        board: meta.board || 'Bihar Board (BSEB)',
        year: meta.year || 2026,
        paperName: meta.set ? `${meta.year || ''} ${meta.set}`.trim() : meta.title || 'Question Paper',
        mcqs,
        shortQuestions,
        longQuestions,
      };
    }

    return raw as Paper;
  }

  public async getPapersList(classId?: string, subjectId?: string): Promise<PaperSummary[]> {
    const targetClass = classId ? normalizeClass(classId) : undefined;
    const targetSubject = subjectId ? normalizeSubject(subjectId) : undefined;

    try {
      // 1. Check cached papers in IndexedDB
      const cached = await getAllCachedPapers();
      const cachedSummaries: PaperSummary[] = cached.map((p) => ({
        id: p.id,
        class: normalizeClass(p.class),
        subject: normalizeSubject(p.subject),
        board: p.board,
        year: p.year,
        paperName: p.paperName,
        mcqCount: p.mcqs?.length || 0,
        shortCount: p.shortQuestions?.length || 0,
        longCount: p.longQuestions?.length || 0,
      }));

      // Initialize map with all bundled mock summaries
      const mergedMap = new Map<string, PaperSummary>();
      MOCK_SUMMARIES.forEach((s) => {
        mergedMap.set(s.id, {
          ...s,
          class: normalizeClass(s.class),
          subject: normalizeSubject(s.subject),
        });
      });
      cachedSummaries.forEach((s) => mergedMap.set(s.id, s));

      // 2. Discover files from GitHub if online and not in offline mode
      if (navigator.onLine && !getAppSettings().offlineMode) {
        try {
          // Check GitHub Tree API for dynamic repository structure
          const treeApiUrls = [
            'https://api.github.com/repos/dheerajjha97/AbhyaasData/git/trees/main?recursive=1',
            'https://api.github.com/repos/dheerajjha97/AbhyaasData/git/trees/master?recursive=1',
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

          if (treeData && Array.isArray(treeData.tree)) {
            const jsonBlobs = treeData.tree.filter(
              (item: any) => item.type === 'blob' && (item.path.startsWith('Papers/') || item.path.startsWith('papers/')) && item.path.endsWith('.json')
            );

            for (const blob of jsonBlobs) {
              const relativePath: string = blob.path;
              const filename = relativePath.split('/').pop()?.replace(/\.json$/, '') || '';
              if (filename) {
                this.paperPathMap.set(filename, relativePath);
              }

              try {
                const paperRes = await fetch(`${this.repoBaseUrl}/${relativePath}`);
                if (paperRes.ok) {
                  const rawJson = await paperRes.json();
                  const parsed = this.parseRemotePaperJson(rawJson, relativePath);
                  this.paperPathMap.set(parsed.id, relativePath);
                  mergedMap.set(parsed.id, {
                    id: parsed.id,
                    class: parsed.class,
                    subject: parsed.subject,
                    board: parsed.board,
                    year: parsed.year,
                    paperName: parsed.paperName,
                    mcqCount: parsed.mcqs.length,
                    shortCount: parsed.shortQuestions.length,
                    longCount: parsed.longQuestions.length,
                  });
                }
              } catch {}
            }
          } else {
            // Fallback: Fetch directly from KNOWN_PAPER_PATHS
            for (const relativePath of KNOWN_PAPER_PATHS) {
              try {
                const paperRes = await fetch(`${this.repoBaseUrl}/${relativePath}`);
                if (paperRes.ok) {
                  const rawJson = await paperRes.json();
                  const parsed = this.parseRemotePaperJson(rawJson, relativePath);
                  this.paperPathMap.set(parsed.id, relativePath);
                  mergedMap.set(parsed.id, {
                    id: parsed.id,
                    class: parsed.class,
                    subject: parsed.subject,
                    board: parsed.board,
                    year: parsed.year,
                    paperName: parsed.paperName,
                    mcqCount: parsed.mcqs.length,
                    shortCount: parsed.shortQuestions.length,
                    longCount: parsed.longQuestions.length,
                  });
                }
              } catch {}
            }
          }
        } catch (netErr) {
          console.warn('Network fetch from GitHub encountered issue, utilizing local question bank:', netErr);
        }
      }

      let result = Array.from(mergedMap.values());

      if (targetClass) {
        result = result.filter((p) => normalizeClass(p.class) === targetClass);
      }
      if (targetSubject) {
        result = result.filter((p) => {
          const normP = normalizeSubject(p.subject);
          return normP.toLowerCase() === targetSubject.toLowerCase();
        });
      }

      // If no exact match after strict filtering, fallback to partial subject match
      if (result.length === 0 && targetSubject) {
        const partialSub = targetSubject.toLowerCase();
        result = Array.from(mergedMap.values()).filter((p) => {
          const cMatch = !targetClass || normalizeClass(p.class) === targetClass;
          const sMatch = normalizeSubject(p.subject).toLowerCase().includes(partialSub) ||
                         partialSub.includes(normalizeSubject(p.subject).toLowerCase());
          return cMatch && sMatch;
        });
      }

      return result;
    } catch (err) {
      console.warn('Error in getPapersList, using fallback:', err);
      let fallback = MOCK_SUMMARIES.map((s) => ({
        ...s,
        class: normalizeClass(s.class),
        subject: normalizeSubject(s.subject),
      }));

      if (targetClass) {
        fallback = fallback.filter((p) => p.class === targetClass);
      }
      if (targetSubject) {
        fallback = fallback.filter((p) => p.subject.toLowerCase() === targetSubject.toLowerCase());
      }
      return fallback;
    }
  }

  public async getPaperById(paperId: string): Promise<Paper | null> {
    const cachedPaper = await getPaperFromCache(paperId);

    if (!navigator.onLine || getAppSettings().offlineMode) {
      if (cachedPaper) return cachedPaper;
      return MOCK_PAPERS.find((p) => p.id === paperId) || null;
    }

    if (cachedPaper) {
      this.fetchRemotePaper(paperId)
        .then((remotePaper) => {
          if (remotePaper) {
            savePaperToCache(remotePaper);
          }
        })
        .catch(() => {});
      return cachedPaper;
    }

    const remotePaper = await this.fetchRemotePaper(paperId);
    if (remotePaper) {
      await savePaperToCache(remotePaper);
      return remotePaper;
    }

    const mockMatch = MOCK_PAPERS.find((p) => p.id === paperId);
    if (mockMatch) {
      await savePaperToCache(mockMatch);
      return mockMatch;
    }

    return null;
  }

  private async fetchRemotePaper(paperId: string): Promise<Paper | null> {
    try {
      const mappedPath =
        this.paperPathMap.get(paperId) ||
        this.paperPathMap.get(paperId.replace(/_/g, '-')) ||
        this.paperPathMap.get(paperId.replace(/-/g, '_'));

      const urlsToTry: string[] = [];

      if (mappedPath) {
        urlsToTry.push(`${this.repoBaseUrl}/${mappedPath}`);
      }

      urlsToTry.push(
        `${this.repoBaseUrl}/Papers/XII/Political Science/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Political Science/class12_polscience_2026_model_paper_.json`,
        `${this.repoBaseUrl}/Papers/XII/History/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Biology/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Physics/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Chemistry/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Mathematics/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Hindi/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/English/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/X/Science/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/X/Social Science/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/X/Mathematics/${paperId}.json`,
        `${this.repoBaseUrl}/papers/${paperId}.json`
      );

      for (const url of urlsToTry) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const rawJson = await res.json();
            return this.parseRemotePaperJson(rawJson, url);
          }
        } catch {}
      }
    } catch (err) {
      console.warn(`Failed fetching paper ${paperId} from GitHub:`, err);
    }
    return null;
  }

  public async prefetchPaper(paperId: string): Promise<void> {
    const paper = await this.getPaperById(paperId);
    if (paper) {
      await savePaperToCache(paper);
    }
  }

  public async searchQuestions(query: string, classId?: string): Promise<SearchResultItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const normClass = classId ? normalizeClass(classId) : undefined;

    // Combine cached papers and mock papers
    const cached = await getAllCachedPapers();
    const paperMap = new Map<string, Paper>();
    MOCK_PAPERS.forEach((p) => paperMap.set(p.id, p));
    cached.forEach((p) => paperMap.set(p.id, p));

    const results: SearchResultItem[] = [];

    paperMap.forEach((paper) => {
      if (normClass && normalizeClass(paper.class) !== normClass) return;

      // Search MCQs
      paper.mcqs?.forEach((m) => {
        if (m.question.toLowerCase().includes(q) || m.explanation?.toLowerCase().includes(q)) {
          results.push({
            questionId: m.id,
            paperId: paper.id,
            paperName: paper.paperName,
            subject: paper.subject,
            classId: paper.class,
            year: paper.year,
            type: 'mcq',
            question: m.question,
            answer: m.answer,
            options: m.options,
            explanation: m.explanation,
          });
        }
      });

      // Search Short Questions
      paper.shortQuestions?.forEach((sq) => {
        if (sq.question.toLowerCase().includes(q) || sq.answer.toLowerCase().includes(q)) {
          results.push({
            questionId: sq.id,
            paperId: paper.id,
            paperName: paper.paperName,
            subject: paper.subject,
            classId: paper.class,
            year: paper.year,
            type: 'short',
            question: sq.question,
            answer: sq.answer,
          });
        }
      });

      // Search Long Questions
      paper.longQuestions?.forEach((lq) => {
        if (lq.question.toLowerCase().includes(q) || lq.answer.toLowerCase().includes(q)) {
          results.push({
            questionId: lq.id,
            paperId: paper.id,
            paperName: paper.paperName,
            subject: paper.subject,
            classId: paper.class,
            year: paper.year,
            type: 'long',
            question: lq.question,
            answer: lq.answer,
          });
        }
      });
    });

    return results;
  }
}

// Singleton repository instance for app-wide usage
export const questionRepository = new GitHubQuestionRepository();
