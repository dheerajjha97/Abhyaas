import { Paper, PaperSummary } from '../types/question';
import rawData from './papersData.json';

export const MOCK_PAPERS: Paper[] = (rawData.papers || []) as unknown as Paper[];

export const MOCK_SUMMARIES: PaperSummary[] = (rawData.summaries || []) as unknown as PaperSummary[];
