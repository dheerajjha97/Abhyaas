export interface NoteSection {
  id: string;
  sectionNumber?: number;
  heading: string;
  headingHindi?: string;
  type?: string;
  content: string;
  keyPoints?: string[];
}

export interface FormulaOrConcept {
  id?: string;
  title: string;
  formula?: string;
  description?: string;
}

export interface NoteData {
  noteId: string;
  title: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  chapterTitleHindi?: string;
  board?: string;
  academicYear?: string;
  noteType?: string;
  author?: string;
  readTimeMinutes?: number;
  tags?: string[];
  keyTakeaways?: string[];
  formulas?: FormulaOrConcept[];
  sections: NoteSection[];
  stats?: {
    views?: number;
    likes?: number;
  };
}
