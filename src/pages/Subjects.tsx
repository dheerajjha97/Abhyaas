import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository, normalizeSubject } from '../services/questionRepository';
import { PaperSummary } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { SubjectCard } from '../components/ui/SubjectCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration, IllustrationType } from '../components/ui/Illustration';
import { BookOpen, Sparkles, Filter, Layers } from 'lucide-react';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';

interface SubjectConfig {
  name: string;
  illustration: IllustrationType;
  gradient: string;
}

const SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  Biology: {
    name: 'Biology',
    illustration: 'biology',
    gradient: 'from-emerald-500 to-green-600',
  },
  Physics: {
    name: 'Physics',
    illustration: 'physics',
    gradient: 'from-sky-500 to-blue-600',
  },
  Mathematics: {
    name: 'Mathematics',
    illustration: 'math',
    gradient: 'from-amber-500 to-orange-600',
  },
  Chemistry: {
    name: 'Chemistry',
    illustration: 'chemistry',
    gradient: 'from-purple-500 to-indigo-600',
  },
  Agriculture: {
    name: 'Agriculture',
    illustration: 'biology',
    gradient: 'from-lime-500 to-emerald-600',
  },
  'Computer Science': {
    name: 'Computer Science',
    illustration: 'study',
    gradient: 'from-slate-600 to-zinc-700',
  },
  Science: {
    name: 'Science',
    illustration: 'books',
    gradient: 'from-teal-500 to-emerald-600',
  },
  English: {
    name: 'English',
    illustration: 'study',
    gradient: 'from-indigo-500 to-purple-600',
  },
  History: {
    name: 'History',
    illustration: 'preparation',
    gradient: 'from-amber-600 to-red-600',
  },
  'Political Science': {
    name: 'Political Science',
    illustration: 'study',
    gradient: 'from-blue-600 to-indigo-700',
  },
  'Home Science': {
    name: 'Home Science',
    illustration: 'study',
    gradient: 'from-pink-500 to-rose-600',
  },
  Geography: {
    name: 'Geography',
    illustration: 'preparation',
    gradient: 'from-teal-500 to-emerald-600',
  },
  Economics: {
    name: 'Economics',
    illustration: 'math',
    gradient: 'from-amber-500 to-yellow-600',
  },
  Sociology: {
    name: 'Sociology',
    illustration: 'study',
    gradient: 'from-violet-500 to-purple-600',
  },
  Psychology: {
    name: 'Psychology',
    illustration: 'books',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  Philosophy: {
    name: 'Philosophy',
    illustration: 'study',
    gradient: 'from-cyan-600 to-teal-700',
  },
  Music: {
    name: 'Music',
    illustration: 'study',
    gradient: 'from-purple-500 to-pink-600',
  },
  Accountancy: {
    name: 'Accountancy',
    illustration: 'math',
    gradient: 'from-blue-600 to-cyan-600',
  },
  'Business Studies': {
    name: 'Business Studies',
    illustration: 'study',
    gradient: 'from-indigo-600 to-blue-700',
  },
  Entrepreneurship: {
    name: 'Entrepreneurship',
    illustration: 'preparation',
    gradient: 'from-amber-500 to-orange-600',
  },
  'Social Science': {
    name: 'Social Science',
    illustration: 'preparation',
    gradient: 'from-amber-600 to-red-600',
  },
  Hindi: {
    name: 'Hindi',
    illustration: 'preparation',
    gradient: 'from-rose-500 to-pink-600',
  },
  Sanskrit: {
    name: 'Sanskrit',
    illustration: 'books',
    gradient: 'from-stone-500 to-amber-700',
  },
  Urdu: {
    name: 'Urdu',
    illustration: 'study',
    gradient: 'from-emerald-600 to-teal-700',
  },
  Maithili: {
    name: 'Maithili',
    illustration: 'study',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
};

export const Subjects: React.FC = () => {
  const { classId = '12' } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    questionRepository.getPapersList(classId).then((data) => {
      if (isMounted) {
        setPapers(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [classId]);

  // Group papers by subject
  const subjectMap = new Map<string, number>();

  // Ensure standard subjects exist for class from ALL_AVAILABLE_SUBJECTS
  const availableForClass = ALL_AVAILABLE_SUBJECTS.filter((sub) =>
    sub.classes.includes(classId)
  );

  availableForClass.forEach((sub) => {
    if (!subjectMap.has(sub.name)) {
      subjectMap.set(sub.name, 0);
    }
  });

  papers.forEach((p) => {
    const norm = normalizeSubject(p.subject);
    const current = subjectMap.get(norm) || subjectMap.get(p.subject) || 0;
    subjectMap.set(norm || p.subject, current + 1);
  });

  const subjectsList = Array.from(subjectMap.entries())
    .map(([subjectName, count]) => {
      const subjectInfo = ALL_AVAILABLE_SUBJECTS.find((s) => s.name === subjectName);
      const config = SUBJECT_CONFIGS[subjectName] || {
        name: subjectName,
        illustration: 'books' as IllustrationType,
        gradient: 'from-indigo-500 to-purple-600',
      };
      return {
        name: subjectName,
        hindiName: subjectInfo?.hindiName || '',
        stream: subjectInfo?.stream || 'General',
        count: count,
        config,
      };
    })
    .filter((sub) => {
      if (selectedStream === 'All') return true;
      if (selectedStream === 'Arts') return sub.stream === 'Arts';
      if (selectedStream === 'Science') return sub.stream === 'Science';
      if (selectedStream === 'Commerce') return sub.stream === 'Commerce';
      if (selectedStream === 'Languages') return sub.stream === 'General';
      return true;
    })
    .sort((a, b) => {
      // Prioritize subjects with available papers first
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar showBack title={`Class ${classId}`} subtitle="विषय का चयन करें" />

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
            <Sparkles className="w-3 h-3 text-amber-500" /> Class {classId} Board Prep
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            कौन-सा Subject पढ़ना है?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            अपने पसंदीदा विषय के सभी सॉल्व्ड पेपर्स एवं क्विज़ एक्सेस करें।
          </p>
        </div>

        <div className="w-16 shrink-0">
          <Illustration name="books" size={64} />
        </div>
      </div>

      {/* Stream Tabs (For Class 11 & 12) */}
      {classId !== '10' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'All', label: 'सभी विषय', emoji: '📚' },
            { id: 'Arts', label: 'कला (Arts)', emoji: '🏛️' },
            { id: 'Science', label: 'विज्ञान (Science)', emoji: '🔬' },
            { id: 'Commerce', label: 'वाणिज्य (Commerce)', emoji: '📊' },
            { id: 'Languages', label: 'भाषा (Languages)', emoji: '🔤' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStream(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer border ${
                selectedStream === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Subject List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-500" /> उपलब्ध विषय
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {subjectsList.length} Subjects
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-indigo-600">विषय लोड हो रहे हैं...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {subjectsList.map((sub) => (
              <SubjectCard
                key={sub.name}
                name={sub.name}
                paperCount={sub.count}
                classId={classId}
                illustrationType={sub.config.illustration}
                gradient={sub.config.gradient}
                onClick={() =>
                  navigate(`/class/${classId}/subject/${encodeURIComponent(sub.name)}/papers`)
                }
                onMockTest={() =>
                  navigate(`/mock-test?subject=${encodeURIComponent(sub.name)}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
