/**
 * Repository Pattern Architecture for Abhyaas
 * Decouples UI from data sources (GitHub JSON, IndexedDB Cache, future Android RoomDB)
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

// Fallback known paths from Papers/{Class}/{Subjects}/ in case GitHub tree API is offline/rate-limited
const KNOWN_PAPER_PATHS = [
  'Papers/XII/Biology/class12_biology_2026_set_a.json',
  'Papers/XII/History/class12_history_2023_set_a.json',
  'Papers/XII/Political Science/class12_polscience_2026_model_paper_.json',
];

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
      }
    });
  }

  /**
   * Parse remote schema 2.0 or 1.0 JSON format into standard internal Paper model
   */
  private parseRemotePaperJson(raw: any, rawPath?: string): Paper {
    if (raw.paper && Array.isArray(raw.questions)) {
      const meta = raw.paper;
      const rawClass = String(meta.classId || '').replace(/^class-?/, '') || '12';
      const rawSub = meta.subjectId || '';
      const formattedSubject = rawSub
        ? rawSub.charAt(0).toUpperCase() + rawSub.slice(1).replace(/-/g, ' ')
        : 'General';

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
              // Leave empty if raw JSON lacks explicit correctAnswer field
              answerText = '';
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
          question: q.textHindi || q.text || '',
          answer: q.modelAnswer || q.answerText || q.answer || '',
        }));

      const longQuestions = raw.questions
        .filter((q: any) => q.type === 'long')
        .map((q: any) => ({
          id: q.id || `long-${Math.random()}`,
          question: q.textHindi || q.text || '',
          answer: q.modelAnswer || q.answerText || q.answer || '',
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
    try {
      // 1. Check cached papers in IndexedDB
      const cached = await getAllCachedPapers();
      const cachedSummaries: PaperSummary[] = cached.map((p) => ({
        id: p.id,
        class: p.class,
        subject: p.subject,
        board: p.board,
        year: p.year,
        paperName: p.paperName,
        mcqCount: p.mcqs.length,
        shortCount: p.shortQuestions.length,
        longCount: p.longQuestions.length,
      }));

      // Merge map initialized with MOCK_SUMMARIES
      const mergedMap = new Map<string, PaperSummary>();
      MOCK_SUMMARIES.forEach((s) => mergedMap.set(s.id, s));
      cachedSummaries.forEach((s) => mergedMap.set(s.id, s));

      // 2. Discover files in GitHub repository dynamically via GitHub Tree API if online
      if (navigator.onLine && !getAppSettings().offlineMode) {
        try {
          const treeApiUrl = 'https://api.github.com/repos/dheerajjha97/AbhyaasData/git/trees/main?recursive=1';
          const res = await fetch(treeApiUrl, { cache: 'no-cache' });
          if (res.ok) {
            const treeData = await res.json();
            if (Array.isArray(treeData.tree)) {
              const jsonBlobs = treeData.tree.filter(
                (item: any) => item.type === 'blob' && item.path.startsWith('Papers/') && item.path.endsWith('.json')
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
                } catch (e) {
                  console.warn(`Could not fetch discovered paper ${relativePath}`, e);
                }
              }
            }
          }
        } catch {
          // Fallback to fetch pre-mapped known files
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
      }

      let result = Array.from(mergedMap.values());

      if (classId) {
        result = result.filter(
          (p) => p.class === classId || `class-${p.class}` === classId || p.class === classId.replace('class-', '')
        );
      }
      if (subjectId) {
        const targetSub = subjectId.toLowerCase().replace(/[-_]/g, ' ');
        result = result.filter(
          (p) =>
            p.subject.toLowerCase().replace(/[-_]/g, ' ').includes(targetSub) ||
            targetSub.includes(p.subject.toLowerCase().replace(/[-_]/g, ' '))
        );
      }

      return result;
    } catch (err) {
      console.warn('Error in getPapersList, using fallback:', err);
      let fallback = MOCK_SUMMARIES;
      if (classId) fallback = fallback.filter((p) => p.class === classId);
      if (subjectId) fallback = fallback.filter((p) => p.subject.toLowerCase() === subjectId.toLowerCase());
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
        `${this.repoBaseUrl}/Papers/XII/Biology/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/History/${paperId}.json`,
        `${this.repoBaseUrl}/Papers/XII/Political Science/${paperId}.json`,
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

    // Combine cached papers and mock papers
    const cached = await getAllCachedPapers();
    const paperMap = new Map<string, Paper>();
    MOCK_PAPERS.forEach((p) => paperMap.set(p.id, p));
    cached.forEach((p) => paperMap.set(p.id, p));

    const results: SearchResultItem[] = [];

    paperMap.forEach((paper) => {
      if (classId && paper.class !== classId) return;

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
