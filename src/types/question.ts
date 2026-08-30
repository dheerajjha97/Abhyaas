/**
 * Question Data Types for Abhyaas
 * Compatible with future Android RoomDB schema
 */

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  answer: string; // The correct option text or identifier
  explanation: string;
}

export interface ShortQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface LongQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface Paper {
  id: string;
  class: string; // "10", "11", "12"
  subject: string; // "Biology", "Physics", "Mathematics", "Chemistry", "English", "Hindi"
  board?: string; // "CBSE", "BSEB", "UP Board", "All Boards"
  year: number; // 2026, 2025, 2024
  paperName: string; // "Set A", "Sample Paper 1"
  mcqs: MCQ[];
  shortQuestions: ShortQuestion[];
  longQuestions: LongQuestion[];
}

export interface PaperSummary {
  id: string;
  class: string;
  subject: string;
  board?: string;
  year: number;
  paperName: string;
  mcqCount: number;
  shortCount: number;
  longCount: number;
  githubUrl?: string;
}

export type QuestionType = 'mcq' | 'short' | 'long';

export interface BookmarkedQuestion {
  id: string; // unique ID
  paperId: string;
  paperName: string;
  classId: string;
  subject: string;
  year: number;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  savedAt: number;
}

export interface QuizResultData {
  paperId: string;
  paperName: string;
  subject: string;
  classId: string;
  totalQuestions: number;
  score: number;
  correct: number;
  wrong: number;
  percentage: number;
  timestamp: number;
  answers: Record<string, { selected: string; isCorrect: boolean }>;
}

export interface SearchResultItem {
  questionId: string;
  paperId: string;
  paperName: string;
  subject: string;
  classId: string;
  year: number;
  type: QuestionType;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
}
