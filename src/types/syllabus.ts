export interface SyllabusTopic {
  id: string;
  topicNumber: string;
  title: string;
  completed?: boolean;
  order?: number;
}

export interface SyllabusChapter {
  id: string;
  chapterNumber: number;
  unitNumber?: number;
  unitTitle?: string;
  title: string;
  topics: SyllabusTopic[];
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  chapters: SyllabusChapter[];
}

export interface SyllabusMeta {
  id: string;
  title: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  board?: string;
  academicYear?: string;
  stream?: string;
  totalMarks?: number;
  totalUnits?: number;
  totalChapters?: number;
  totalTopics?: number;
}

export interface SyllabusData {
  schemaVersion?: string;
  contentType?: string;
  generatedAt?: string;
  syllabus: SyllabusMeta;
  units: SyllabusUnit[];
  chapters?: SyllabusChapter[];
}
