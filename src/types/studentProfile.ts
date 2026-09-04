export interface SubjectOption {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  bg: string;
  stream?: 'Science' | 'Arts' | 'Commerce' | 'General';
  classes: string[]; // ['10'], ['11', '12'], etc.
}

export const DEFAULT_CLASS_SUBJECTS: Record<string, string[]> = {
  '10': ['Science', 'Mathematics', 'Social Science', 'Hindi'],
  '11': ['Political Science', 'History', 'Geography', 'Hindi'],
  '12': ['Political Science', 'History', 'Geography', 'Hindi'],
};

export interface StudentProfile {
  name: string;
  classId: string; // '10', '11', '12'
  board: string; // 'BSEB (Bihar Board)', 'CBSE', 'UP Board', 'All State Boards'
  stream: 'Science' | 'Arts' | 'Commerce' | 'General';
  selectedSubjects: string[]; // List of subject names active for current classId
  classSubjects?: Record<string, string[]>; // Remembered chosen subjects per classId: { '10': [...], '11': [...], '12': [...] }
  avatarEmoji: string;
  targetYear?: number;
  lastUpdated?: number;
  isConfigured?: boolean; // True once the student has customized/confirmed their profile
}

export const ALL_AVAILABLE_SUBJECTS: SubjectOption[] = [
  // Class 11 & 12 Arts (कला संकाय)
  { id: 'sub-pol', name: 'Political Science', hindiName: 'राजनीति विज्ञान', emoji: '⚖️', bg: 'bg-blue-100 dark:bg-blue-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-hist', name: 'History', hindiName: 'इतिहास', emoji: '🏛️', bg: 'bg-orange-100 dark:bg-orange-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-geo', name: 'Geography', hindiName: 'भूगोल', emoji: '🗺️', bg: 'bg-teal-100 dark:bg-teal-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-hsci', name: 'Home Science', hindiName: 'गृह विज्ञान', emoji: '🏡', bg: 'bg-rose-100 dark:bg-rose-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-eco', name: 'Economics', hindiName: 'अर्थशास्त्र', emoji: '📊', bg: 'bg-yellow-100 dark:bg-yellow-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-soc', name: 'Sociology', hindiName: 'समाजशास्त्र', emoji: '👥', bg: 'bg-violet-100 dark:bg-violet-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-psy', name: 'Psychology', hindiName: 'मनोविज्ञान', emoji: '🧠', bg: 'bg-pink-100 dark:bg-pink-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-phil', name: 'Philosophy', hindiName: 'दर्शनशास्त्र', emoji: '🧘', bg: 'bg-cyan-100 dark:bg-cyan-950/60', stream: 'Arts', classes: ['11', '12'] },
  { id: 'sub-music', name: 'Music', hindiName: 'संगीत', emoji: '🎵', bg: 'bg-purple-100 dark:bg-purple-950/60', stream: 'Arts', classes: ['11', '12'] },

  // Class 11 & 12 Science (विज्ञान संकाय)
  { id: 'sub-phy', name: 'Physics', hindiName: 'भौतिकी', emoji: '⚛️', bg: 'bg-sky-100 dark:bg-sky-950/60', stream: 'Science', classes: ['11', '12'] },
  { id: 'sub-chem', name: 'Chemistry', hindiName: 'रसायन शास्त्र', emoji: '🧪', bg: 'bg-purple-100 dark:bg-purple-950/60', stream: 'Science', classes: ['11', '12'] },
  { id: 'sub-bio', name: 'Biology', hindiName: 'जीव विज्ञान', emoji: '🧬', bg: 'bg-emerald-100 dark:bg-emerald-950/60', stream: 'Science', classes: ['11', '12'] },
  { id: 'sub-math', name: 'Mathematics', hindiName: 'गणित', emoji: '📐', bg: 'bg-amber-100 dark:bg-amber-950/60', stream: 'Science', classes: ['10', '11', '12'] },
  { id: 'sub-agri', name: 'Agriculture', hindiName: 'कृषि विज्ञान', emoji: '🌾', bg: 'bg-lime-100 dark:bg-lime-950/60', stream: 'Science', classes: ['11', '12'] },
  { id: 'sub-cs', name: 'Computer Science', hindiName: 'कंप्यूटर साइंस', emoji: '💻', bg: 'bg-slate-200 dark:bg-slate-800/80', stream: 'Science', classes: ['11', '12'] },

  // Class 11 & 12 Commerce (वाणिज्य संकाय)
  { id: 'sub-acc', name: 'Accountancy', hindiName: 'लेखाशास्त्र', emoji: '📒', bg: 'bg-blue-100 dark:bg-blue-950/60', stream: 'Commerce', classes: ['11', '12'] },
  { id: 'sub-bst', name: 'Business Studies', hindiName: 'व्यवसाय अध्ययन', emoji: '💼', bg: 'bg-indigo-100 dark:bg-indigo-950/60', stream: 'Commerce', classes: ['11', '12'] },
  { id: 'sub-eps', name: 'Entrepreneurship', hindiName: 'उद्यमिता (EPS)', emoji: '🚀', bg: 'bg-amber-100 dark:bg-amber-950/60', stream: 'Commerce', classes: ['11', '12'] },
  { id: 'sub-comm-eco', name: 'Economics', hindiName: 'अर्थशास्त्र', emoji: '📊', bg: 'bg-yellow-100 dark:bg-yellow-950/60', stream: 'Commerce', classes: ['11', '12'] },

  // Class 10 Core (कक्षा 10)
  { id: 'sub-sci', name: 'Science', hindiName: 'विज्ञान', emoji: '🔬', bg: 'bg-emerald-100 dark:bg-emerald-950/60', stream: 'General', classes: ['10'] },
  { id: 'sub-sst', name: 'Social Science', hindiName: 'सामाजिक विज्ञान', emoji: '🌍', bg: 'bg-amber-100 dark:bg-amber-950/60', stream: 'General', classes: ['10'] },

  // Languages for All Classes (भाषा एवं अनिवार्य विषय)
  { id: 'sub-hin', name: 'Hindi', hindiName: 'हिन्दी', emoji: '📖', bg: 'bg-rose-100 dark:bg-rose-950/60', stream: 'General', classes: ['10', '11', '12'] },
  { id: 'sub-eng', name: 'English', hindiName: 'अंग्रेज़ी', emoji: '🔤', bg: 'bg-indigo-100 dark:bg-indigo-950/60', stream: 'General', classes: ['10', '11', '12'] },
  { id: 'sub-san', name: 'Sanskrit', hindiName: 'संस्कृत', emoji: '📜', bg: 'bg-stone-100 dark:bg-stone-800/60', stream: 'General', classes: ['10', '11', '12'] },
  { id: 'sub-urdu', name: 'Urdu', hindiName: 'उर्दू', emoji: '🖋️', bg: 'bg-emerald-100 dark:bg-emerald-950/60', stream: 'General', classes: ['10', '11', '12'] },
  { id: 'sub-maithili', name: 'Maithili', hindiName: 'मैथिली', emoji: '🌸', bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/60', stream: 'General', classes: ['10', '11', '12'] },
];

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'विद्यार्थी',
  classId: '12',
  board: 'BSEB (Bihar Board)',
  stream: 'Arts',
  selectedSubjects: ['Political Science', 'History', 'Geography', 'Hindi'],
  classSubjects: {
    '10': ['Science', 'Mathematics', 'Social Science', 'Hindi'],
    '11': ['Political Science', 'History', 'Geography', 'Hindi'],
    '12': ['Political Science', 'History', 'Geography', 'Hindi'],
  },
  avatarEmoji: '🎓',
  targetYear: 2026,
  isConfigured: false,
};
