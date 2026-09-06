import React, { useState, useRef, useEffect } from 'react';
import { ALL_AVAILABLE_SUBJECTS, SubjectOption } from '../../types/studentProfile';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { normalizeSubject } from '../../services/questionRepository';
import { SlidersHorizontal, Plus, ChevronRight, Check } from 'lucide-react';

export interface SubjectCarouselProps {
  classId: string;
  selectedSubject: string;
  onSelectSubject: (subjectName: string) => void;
  className?: string;
  showManageButton?: boolean;
}

export const SubjectCarousel: React.FC<SubjectCarouselProps> = ({
  classId,
  selectedSubject,
  onSelectSubject,
  className = '',
  showManageButton = true,
}) => {
  const { profile, openProfileModal } = useStudentProfile();
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // All subjects valid for this class
  const availableSubjects = ALL_AVAILABLE_SUBJECTS.filter((sub) =>
    sub.classes.includes(classId)
  );

  // Active student subjects for this class
  const studentSubjectNames = (
    classId === profile.classId
      ? profile.selectedSubjects
      : profile.classSubjects?.[classId]
  ) || profile.selectedSubjects || [];

  // Filter and order according to student's selection
  const studentSubjects = studentSubjectNames
    .map((name) =>
      availableSubjects.find(
        (s) =>
          s.name.toLowerCase() === name.toLowerCase() ||
          s.id.toLowerCase() === name.toLowerCase() ||
          normalizeSubject(s.name).toLowerCase() === normalizeSubject(name).toLowerCase()
      )
    )
    .filter((s): s is SubjectOption => Boolean(s));

  // Determine which subjects to show
  let displayedSubjects: SubjectOption[] = [];

  if (showAll || studentSubjects.length === 0) {
    displayedSubjects = availableSubjects;
  } else {
    // Show student's chosen subjects
    displayedSubjects = [...studentSubjects];

    // If currently selected subject is from another stream or URL param, include it so it's visible & active
    const isCurrentInList = displayedSubjects.some(
      (sub) =>
        sub.name.toLowerCase() === selectedSubject.toLowerCase() ||
        sub.id.toLowerCase() === selectedSubject.toLowerCase() ||
        normalizeSubject(sub.name).toLowerCase() === normalizeSubject(selectedSubject).toLowerCase()
    );

    if (!isCurrentInList) {
      const currentOpt = availableSubjects.find(
        (sub) =>
          sub.name.toLowerCase() === selectedSubject.toLowerCase() ||
          sub.id.toLowerCase() === selectedSubject.toLowerCase() ||
          normalizeSubject(sub.name).toLowerCase() === normalizeSubject(selectedSubject).toLowerCase()
      );
      if (currentOpt) {
        displayedSubjects.push(currentOpt);
      }
    }
  }

  // Scroll active subject into view if needed
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector('[data-selected="true"]') as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedSubject, showAll]);

  const isSelected = (sub: SubjectOption) =>
    selectedSubject.toLowerCase() === sub.name.toLowerCase() ||
    selectedSubject.toLowerCase() === sub.id.toLowerCase() ||
    normalizeSubject(selectedSubject).toLowerCase() === normalizeSubject(sub.name).toLowerCase();

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        ref={containerRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1"
      >
        {displayedSubjects.map((sub) => {
          const selected = isSelected(sub);
          const isChosenByStudent = studentSubjectNames.some(
            (n) => n.toLowerCase() === sub.name.toLowerCase() || normalizeSubject(n).toLowerCase() === normalizeSubject(sub.name).toLowerCase()
          );

          return (
            <button
              key={sub.id}
              data-selected={selected ? 'true' : 'false'}
              onClick={() => onSelectSubject(sub.name)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                selected
                  ? 'bg-blue-600 text-white shadow-xs border border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
              }`}
            >
              <span>{sub.emoji}</span>
              <span>{sub.name}</span>
              {showAll && isChosenByStudent && !selected && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" title="आपका चुना हुआ विषय" />
              )}
            </button>
          );
        })}

        {/* Toggle between Student Subjects and All Available Subjects */}
        {studentSubjects.length > 0 && availableSubjects.length > studentSubjects.length && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className={`px-3 py-2 rounded-full text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer active:scale-95 border ${
              showAll
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {showAll ? (
              <>
                <Check className="w-3 h-3 text-blue-600" />
                <span>केवल मेरे विषय</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>अन्य विषय (+{availableSubjects.length - studentSubjects.length})</span>
              </>
            )}
          </button>
        )}

        {/* Edit profile subjects shortcut */}
        {showManageButton && (
          <button
            type="button"
            onClick={openProfileModal}
            title="अपने चुने हुए विषय बदलें"
            className="px-2.5 py-2 rounded-full text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">विषय बदलें</span>
          </button>
        )}
      </div>
    </div>
  );
};
