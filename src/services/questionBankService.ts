import { questionRepository, resolvePaperSubject, normalizeSubject } from './questionRepository';
import { Paper, ShortQuestion, LongQuestion } from '../types/question';

export interface QuestionBankItem {
  id: string;
  type: 'short' | 'long';
  subject: string;
  classId: string;
  question: string;
  answer: string;
  normalizedKey: string;
  years: number[];
  paperIds: string[];
  paperNames: string[];
  frequency: number; // how many papers this question appeared in
  marks: number; // 2 for short, 5 for long
  isRepeated: boolean; // frequency > 1
}

export interface SubjectBankSummary {
  subject: string;
  classId: string;
  shortCount: number;
  longCount: number;
  totalCount: number;
  repeatedCount: number;
  paperCount: number;
  years: number[];
}

// In-memory cache for fast tab switching
const bankCache = new Map<
  string,
  {
    shortQuestions: QuestionBankItem[];
    longQuestions: QuestionBankItem[];
    allQuestions: QuestionBankItem[];
    timestamp: number;
  }
>();

/**
 * Normalizes question text for robust de-duplication:
 * - Removes leading numbers: "1.", "प्र. 1", "Q1.", "(क)", etc.
 * - Removes marks notations: "[2 अंक]", "(5 Marks)", etc.
 * - Removes punctuation and collapses whitespace
 * - Strips common redundant instruction suffixes ("सविस्तार समझाएं", "लिखें", etc.)
 */
export function normalizeQuestionText(raw: string): string {
  if (!raw) return '';

  let text = raw.trim();

  // 1. Remove standard question prefixes like "प्रश्न 1:", "Q. 12", "1.", "(i)", "(क)"
  text = text.replace(/^(?:प्रश्न|प्र\.|Q(?:ue)?\.?|\d+[\.\)\-:]|\([a-zA-Z\dक-हivxIVX]+\))\s*/gi, '');
  text = text.replace(/^(?:उत्तर|Ans(?:wer)?|Solution)\s*[:\-]\s*/gi, '');

  // 2. Remove marks notations like "[2 अंक]", "(5 marks)"
  text = text.replace(/\[\s*\d+\s*(?:अंक|marks?|pts?)\s*\]/gi, '');
  text = text.replace(/\(\s*\d+\s*(?:अंक|marks?|pts?)\s*\)/gi, '');

  // 3. Lowercase & strip standard Hindi/English punctuation
  text = text.toLowerCase();
  text = text.replace(/[।?!,.:;'"“”‘’\-\(\)\[\]\/\\_—–]/g, ' ');

  // 4. Strip common filler suffixes
  text = text.replace(
    /\s*(?:सविस्तार\s*(?:समझाएं|बताएं)|विस्तारपूर्वक\s*(?:लिखें|बताएं)|पर\s*प्रकाश\s*डालें|की\s*विवेचना\s*करें|का\s*वर्णन\s*करें|संक्षेप\s*में\s*(?:लिखें|बताएं)|स्पष्ट\s*करें|व्याख्या\s*करें|बताइए|लिखिए|लिखें|क्या\s*है|किसे\s*कहते\s*हैं|से\s*आप\s*क्या\s*समझते\s*हैं)\s*$/gi,
    ''
  );

  // 5. Collapse all whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Calculates token-level Jaccard similarity between two strings
 */
function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  const setA = new Set(a.split(' ').filter((w) => w.length > 1));
  const setB = new Set(b.split(' ').filter((w) => w.length > 1));

  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection++;
  });

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Merges and de-duplicates raw questions of a specific type (short or long)
 */
function deduplicateQuestions(
  rawList: Array<{
    q: ShortQuestion | LongQuestion;
    type: 'short' | 'long';
    paperId: string;
    paperName: string;
    year: number;
    subject: string;
    classId: string;
  }>
): QuestionBankItem[] {
  const result: QuestionBankItem[] = [];

  for (const item of rawList) {
    const rawQText = item.q.question?.trim() || '';
    const rawAnsText = item.q.answer?.trim() || '';
    if (!rawQText) continue;

    const norm = normalizeQuestionText(rawQText);
    const marks = item.type === 'short' ? 2 : 5;

    // Check if we already have this question in result
    let matchIdx = -1;

    // 1. Exact normalized key match
    matchIdx = result.findIndex(
      (r) => r.type === item.type && (r.normalizedKey === norm || r.question.trim() === rawQText)
    );

    // 2. High similarity match (> 0.85 token overlap) if length > 15 chars
    if (matchIdx === -1 && norm.length > 15) {
      matchIdx = result.findIndex(
        (r) => r.type === item.type && tokenSimilarity(r.normalizedKey, norm) >= 0.85
      );
    }

    if (matchIdx !== -1) {
      // Merge with existing question
      const existing = result[matchIdx];
      existing.frequency += 1;
      existing.isRepeated = true;

      if (!existing.years.includes(item.year)) {
        existing.years.push(item.year);
        existing.years.sort((a, b) => b - a);
      }

      if (!existing.paperIds.includes(item.paperId)) {
        existing.paperIds.push(item.paperId);
      }

      if (!existing.paperNames.includes(item.paperName)) {
        existing.paperNames.push(item.paperName);
      }

      // If new answer is longer or more structured, keep the better one
      if (rawAnsText.length > existing.answer.length + 30) {
        existing.answer = rawAnsText;
      }
    } else {
      // Add as new unique question
      result.push({
        id: `qb-${item.type}-${item.classId}-${result.length + 1}`,
        type: item.type,
        subject: item.subject,
        classId: item.classId,
        question: rawQText,
        answer: rawAnsText || 'इस प्रश्न का मॉडल उत्तर शीघ्र ही अपडेट किया जाएगा।',
        normalizedKey: norm,
        years: [item.year],
        paperIds: [item.paperId],
        paperNames: [item.paperName],
        frequency: 1,
        marks,
        isRepeated: false,
      });
    }
  }

  // Sort by frequency (most repeated first), then newest year
  return result.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    const maxYearA = a.years[0] || 0;
    const maxYearB = b.years[0] || 0;
    return maxYearB - maxYearA;
  });
}

/**
 * Fetches and builds the unique question bank for a specific subject
 */
export async function getQuestionBankForSubject(
  subjectName: string,
  classId: string = '12',
  forceRefresh: boolean = false
): Promise<{
  shortQuestions: QuestionBankItem[];
  longQuestions: QuestionBankItem[];
  allQuestions: QuestionBankItem[];
}> {
  const normSubject = normalizeSubject(subjectName);
  const cacheKey = `${classId}_${normSubject.toLowerCase()}`;

  if (!forceRefresh && bankCache.has(cacheKey)) {
    const cached = bankCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < 1000 * 60 * 30) {
      // Cache valid for 30 minutes
      return cached;
    }
  }

  // 1. Get all paper summaries for class
  const summaries = await questionRepository.getPapersList(classId);

  // Filter papers for this subject
  const matchingPapers = summaries.filter((s) => {
    const paperSub = resolvePaperSubject(s);
    return normalizeSubject(paperSub).toLowerCase() === normSubject.toLowerCase();
  });

  // 2. Load all matching papers in parallel
  const paperPromises = matchingPapers.map((s) => questionRepository.getPaperById(s.id));
  const fullPapers: Paper[] = (await Promise.all(paperPromises)).filter((p): p is Paper => Boolean(p));

  // 3. Extract raw short and long questions
  const rawShorts: Array<{
    q: ShortQuestion;
    type: 'short';
    paperId: string;
    paperName: string;
    year: number;
    subject: string;
    classId: string;
  }> = [];

  const rawLongs: Array<{
    q: LongQuestion;
    type: 'long';
    paperId: string;
    paperName: string;
    year: number;
    subject: string;
    classId: string;
  }> = [];

  fullPapers.forEach((p) => {
    const paperYear = Number(p.year) || 2026;
    const paperName = p.paperName || `${paperYear} Paper`;

    (p.shortQuestions || []).forEach((sq) => {
      rawShorts.push({
        q: sq,
        type: 'short',
        paperId: p.id,
        paperName,
        year: paperYear,
        subject: normSubject,
        classId,
      });
    });

    (p.longQuestions || []).forEach((lq) => {
      rawLongs.push({
        q: lq,
        type: 'long',
        paperId: p.id,
        paperName,
        year: paperYear,
        subject: normSubject,
        classId,
      });
    });
  });

  // 4. De-duplicate questions
  const shortQuestions = deduplicateQuestions(rawShorts);
  const longQuestions = deduplicateQuestions(rawLongs);
  const allQuestions = [...shortQuestions, ...longQuestions].sort((a, b) => {
    if (b.frequency !== a.frequency) return b.frequency - a.frequency;
    return (b.years[0] || 0) - (a.years[0] || 0);
  });

  const result = {
    shortQuestions,
    longQuestions,
    allQuestions,
    timestamp: Date.now(),
  };

  bankCache.set(cacheKey, result);
  return result;
}

/**
 * Returns available subjects list with unique question counts
 */
export async function getQuestionBankSummaries(
  classId: string = '12'
): Promise<SubjectBankSummary[]> {
  const summaries = await questionRepository.getPapersList(classId);

  // Group papers by subject
  const subjectMap = new Map<
    string,
    {
      paperCount: number;
      years: Set<number>;
    }
  >();

  summaries.forEach((s) => {
    const sub = resolvePaperSubject(s);
    if (!subjectMap.has(sub)) {
      subjectMap.set(sub, { paperCount: 0, years: new Set() });
    }
    const cur = subjectMap.get(sub)!;
    cur.paperCount += 1;
    if (s.year) cur.years.add(Number(s.year));
  });

  const results: SubjectBankSummary[] = [];

  for (const [sub, info] of subjectMap.entries()) {
    // Check if cached
    const normSub = normalizeSubject(sub);
    const cacheKey = `${classId}_${normSub.toLowerCase()}`;
    const cached = bankCache.get(cacheKey);

    const shortCount = cached ? cached.shortQuestions.length : 0;
    const longCount = cached ? cached.longQuestions.length : 0;
    const repeatedCount = cached
      ? cached.allQuestions.filter((q) => q.isRepeated).length
      : 0;

    results.push({
      subject: sub,
      classId,
      shortCount,
      longCount,
      totalCount: shortCount + longCount,
      repeatedCount,
      paperCount: info.paperCount,
      years: Array.from(info.years).sort((a, b) => b - a),
    });
  }

  return results.sort((a, b) => b.paperCount - a.paperCount);
}
