/**
 * LocalStorage management for Bookmarks & Quiz Results
 */

import { BookmarkedQuestion, QuizResultData, MistakeQuestion } from '../types/question';

const BOOKMARKS_KEY = 'abhyaas_bookmarks_v1';
const QUIZ_RESULTS_KEY = 'abhyaas_quiz_results_v1';
const SETTINGS_KEY = 'abhyaas_settings_v1';
const MISTAKES_KEY = 'abhyaas_mistakes_v1';

export interface AppSettings {
  githubRepoUrl: string;
  theme: 'light' | 'dark' | 'system';
  offlineMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  githubRepoUrl: 'https://raw.githubusercontent.com/dheerajjha97/AbhyaasData/main',
  theme: 'light',
  offlineMode: false,
};

export function getBookmarks(): BookmarkedQuestion[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<BookmarkedQuestion, 'savedAt'>): void {
  const bookmarks = getBookmarks();
  const exists = bookmarks.some((b) => b.id === bookmark.id);
  if (!exists) {
    const updated = [
      { ...bookmark, savedAt: Date.now() },
      ...bookmarks
    ];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  }
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks();
  const updated = bookmarks.filter((b) => b.id !== id);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
}

export function isBookmarked(id: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some((b) => b.id === id);
}

export function getQuizResults(): QuizResultData[] {
  try {
    const data = localStorage.getItem(QUIZ_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveQuizResult(result: QuizResultData): void {
  const results = getQuizResults();
  const updated = [result, ...results.filter((r) => r.paperId !== result.paperId)].slice(0, 30);
  localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(updated));
}

export function getAppSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): void {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

// ----------------------------------------------------
// Mistake Notebook ("गलती सुधार डायरी") Functions
// ----------------------------------------------------

export function getMistakes(): MistakeQuestion[] {
  try {
    const data = localStorage.getItem(MISTAKES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMistakes(newMistakes: MistakeQuestion[]): void {
  try {
    const existing = getMistakes();
    // Merge by id (keep latest timestamp if repeated mistake)
    const mistakeMap = new Map<string, MistakeQuestion>();
    existing.forEach((m) => mistakeMap.set(m.id, m));
    newMistakes.forEach((m) => mistakeMap.set(m.id, m));

    // Keep up to 100 recent mistakes
    const sorted = Array.from(mistakeMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    localStorage.setItem(MISTAKES_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Failed saving mistakes:', err);
  }
}

export function removeMistake(id: string): void {
  const existing = getMistakes();
  const updated = existing.filter((m) => m.id !== id);
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
}

export function clearAllMistakes(): void {
  localStorage.removeItem(MISTAKES_KEY);
}
