import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { PaperSummary } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { SubjectCard } from '../components/ui/SubjectCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration, IllustrationType } from '../components/ui/Illustration';
import { BookOpen, Sparkles, Filter } from 'lucide-react';

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
  Hindi: {
    name: 'Hindi',
    illustration: 'preparation',
    gradient: 'from-rose-500 to-pink-600',
  },
};

export const Subjects: React.FC = () => {
  const { classId = '12' } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Ensure standard subjects exist for class
  const defaultSubjects = classId === '10'
    ? ['Science', 'Mathematics', 'English', 'Hindi']
    : ['Biology', 'Physics', 'Chemistry', 'Mathematics'];

  defaultSubjects.forEach((sub) => subjectMap.set(sub, 0));

  papers.forEach((p) => {
    const current = subjectMap.get(p.subject) || 0;
    subjectMap.set(p.subject, current + 1);
  });

  const subjectsList = Array.from(subjectMap.entries()).map(([subjectName, count]) => {
    const config = SUBJECT_CONFIGS[subjectName] || {
      name: subjectName,
      illustration: 'books' as IllustrationType,
      gradient: 'from-indigo-500 to-purple-600',
    };
    return {
      name: subjectName,
      count: count === 0 ? 3 : count, // show default paper count if mock fallback
      config,
    };
  });

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar showBack title={`Class ${classId}`} subtitle="विषय का चयन करें" />

      {/* Hero Header */}
      <GlassCard variant="accent" padding="md" className="flex items-center justify-between gap-4 border-indigo-200">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
            <Sparkles className="w-3 h-3 text-amber-500" /> Class {classId} Board Prep
          </span>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            कौन-सा Subject पढ़ना है?
          </h2>
          <p className="text-xs text-slate-500">
            अपने पसंदीदा विषय के सभी सॉल्व्ड पेपर्स एवं क्विज़ एक्सेस करें।
          </p>
        </div>

        <div className="w-20 shrink-0">
          <Illustration name="books" size={75} />
        </div>
      </GlassCard>

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
