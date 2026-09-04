import { questionRepository } from './questionRepository';
import { MCQ } from '../types/question';

export interface GeneratedMockTest {
  id: string;
  title: string;
  subject: string;
  classId: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: MCQ[];
  sourcePapersCount: number;
  createdAt: number;
}

export interface MockTestConfig {
  subject: string;
  classId: string;
  questionCount: number; // 15, 25, 35, 50, 70, 100
  timeLimitMinutes?: number;
  testType: 'quick' | 'standard' | 'full' | 'custom';
}

export const mockTestService = {
  /**
   * Generates a dynamic subject-wise mock test from GitHub repository question papers
   */
  async generateMockTest(config: MockTestConfig): Promise<GeneratedMockTest> {
    const { subject, classId, questionCount } = config;

    // 1. Find all available papers for this subject & class
    const paperSummaries = await questionRepository.getPapersList(classId, subject);

    if (paperSummaries.length === 0) {
      throw new Error(`विषय "${subject}" के लिए अभी कोई प्रश्न पत्र उपलब्ध नहीं है। कृपया दूसरा विषय चुनें।`);
    }

    // 2. Fetch all papers in parallel
    const paperPromises = paperSummaries.slice(0, 12).map((summary) =>
      questionRepository.getPaperById(summary.id)
    );
    const loadedPapers = await Promise.all(paperPromises);

    // 3. Extract and pool all MCQs
    const rawQuestions: MCQ[] = [];
    let validPapersCount = 0;

    for (const paper of loadedPapers) {
      if (paper && Array.isArray(paper.mcqs) && paper.mcqs.length > 0) {
        validPapersCount++;
        rawQuestions.push(...paper.mcqs);
      }
    }

    if (rawQuestions.length === 0) {
      throw new Error(`विषय "${subject}" के प्रश्न पत्रों में कोई वस्तुनिष्ठ (MCQ) प्रश्न नहीं मिले।`);
    }

    // 4. Deduplicate questions by normalized question text
    const seenTexts = new Set<string>();
    const uniqueQuestions: MCQ[] = [];

    for (const q of rawQuestions) {
      if (!q || !q.question || !Array.isArray(q.options) || q.options.length === 0) continue;
      const normText = q.question.trim().replace(/\s+/g, ' ').toLowerCase();
      if (!seenTexts.has(normText)) {
        seenTexts.add(normText);
        uniqueQuestions.push(q);
      }
    }

    // 5. Shuffle questions using Fisher-Yates
    const shuffled = [...uniqueQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 6. Select up to requested questionCount
    const selectedCount = Math.min(questionCount, shuffled.length);
    const selectedQuestions = shuffled.slice(0, selectedCount);

    // Calculate recommended time limit (approx 1 min per question, minimum 10 mins)
    const timeLimitMinutes =
      config.timeLimitMinutes || Math.max(10, Math.ceil(selectedCount * 1.1));

    const typeLabels: Record<string, string> = {
      quick: 'रैपिड मॉक टेस्ट (Rapid Mock)',
      standard: 'स्टैंडर्ड मॉक टेस्ट (Standard Mock)',
      full: 'बोर्ड परीक्षा सिमुलेशन (Board Exam Simulation)',
      custom: 'कस्टम अभ्यास टेस्ट (Custom Practice)',
    };

    const title = `${subject} ${typeLabels[config.testType] || 'मॉक टेस्ट'}`;

    return {
      id: `mock-${subject.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      title,
      subject,
      classId,
      totalQuestions: selectedCount,
      timeLimitMinutes,
      questions: selectedQuestions,
      sourcePapersCount: validPapersCount,
      createdAt: Date.now(),
    };
  },
};
