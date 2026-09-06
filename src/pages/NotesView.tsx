import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { FormattedNoteContent } from '../components/ui/FormattedNoteContent';
import { NotesSkeleton } from '../components/ui/Skeleton';
import { notesRepository } from '../services/notesRepository';
import { NoteData } from '../types/notes';
import { BookOpen, Clock, Zap, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { SubjectCarousel } from '../components/ui/SubjectCarousel';
import { Toast, ToastMessage } from '../components/ui/Toast';

function getChapterDisplayTitle(note: NoteData, idx: number): string {
  if (note.chapterTitleHindi && note.chapterTitleHindi.trim()) {
    return note.chapterTitleHindi.trim();
  }
  if (note.chapterTitle && note.chapterTitle.trim() && note.chapterTitle.toLowerCase() !== 'chapter notes') {
    return note.chapterTitle.trim();
  }
  const firstHeading = note.sections?.[0]?.heading;
  if (firstHeading && firstHeading.trim() && firstHeading.toLowerCase() !== 'chapter overview & summary') {
    return firstHeading.trim();
  }
  const firstLine = note.sections?.[0]?.content?.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 5 && firstLine.length < 80) {
    return firstLine.replace(/^[#*\s:–-]+|[#*\s:–-]+$/g, '');
  }
  return `अध्याय ${note.chapterNumber || idx + 1}`;
}

export const NotesView: React.FC = () => {
  const { classId: paramClassId, subjectId: paramSubjectId } = useParams<{ classId?: string; subjectId?: string }>();
  const navigate = useNavigate();
  const { profile, openProfileModal } = useStudentProfile();

  const classId = paramClassId || profile.classId || '12';
  const availableSubjects = ALL_AVAILABLE_SUBJECTS.filter((sub) => sub.classes.includes(classId));
  const studentSubjectNames = (
    classId === profile.classId
      ? profile.selectedSubjects
      : profile.classSubjects?.[classId]
  ) || profile.selectedSubjects || [];

  const initialSubject = paramSubjectId 
    ? decodeURIComponent(paramSubjectId) 
    : (studentSubjectNames[0] || availableSubjects[0]?.name || 'Political Science');

  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (paramSubjectId) {
      setSelectedSubject(decodeURIComponent(paramSubjectId));
    }
  }, [paramSubjectId]);

  const loadNotes = async (force: boolean = false) => {
    if (force) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await notesRepository.getNotesForSubject(classId, selectedSubject, force);
      setNotes(data);
      setActiveNoteIndex(0);
      if (force) {
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: `${selectedSubject} के नोट्स GitHub से सफलतापूर्वक अपडेट हो गए! (${data.length} अध्याय उपलब्ध)`,
        });
      }
    } catch {
      if (force) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: 'नोट्स अपडेट करने में समस्या आई।',
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotes(false);
  }, [classId, selectedSubject]);

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <HeaderBar 
        showBack={Boolean(paramSubjectId)}
        title="रिवीजन नोट्स (Revision Notes)" 
        subtitle={`Class ${classId} • Quick Chapter Notes`} 
        rightAction={
          <button
            onClick={() => loadNotes(true)}
            disabled={isRefreshing || loading}
            title="GitHub से नवीनतम नोट्स रीफ़्रेश करें"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">रीफ़्रेश</span>
          </button>
        }
      />

      {/* Horizontal Subject Switcher Carousel with Student Subjects */}
      <SubjectCarousel
        classId={classId}
        selectedSubject={selectedSubject}
        onSelectSubject={(name) => setSelectedSubject(name)}
      />

      {loading ? (
        <NotesSkeleton />
      ) : !notes || notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 text-center space-y-3 shadow-2xs">
          <BookOpen className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
            {selectedSubject} के नोट्स जल्द उपलब्ध होंगे
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Class {classId} के लिए {selectedSubject} के अध्यायवार नोट्स जोड़े जा रहे हैं। कृपया कोई अन्य विषय चुनें।
          </p>
          <div className="pt-1 flex flex-wrap justify-center gap-2">
            {selectedSubject.toLowerCase() !== 'political science' && (
              <button
                onClick={() => setSelectedSubject('Political Science')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Political Science नोट्स देखें
              </button>
            )}
            <button
              onClick={openProfileModal}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              विषय सूची बदलें
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chapter Selector if multiple chapters exist */}
          {notes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
              {notes.map((note, idx) => {
                const isSelected = activeNoteIndex === idx;
                const displayTitle = getChapterDisplayTitle(note, idx);
                return (
                  <button
                    key={note.noteId || idx}
                    onClick={() => setActiveNoteIndex(idx)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs border border-blue-600 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      अध्याय {note.chapterNumber || idx + 1}
                    </span>
                    <span className="truncate max-w-[200px] sm:max-w-xs">{displayTitle}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Header Banner - Clean Solid Surface */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {notes[activeNoteIndex].board || 'Bihar Board (BSEB)'} • {notes[activeNoteIndex].academicYear || '2025-2026'}
              </span>
              {notes[activeNoteIndex].readTimeMinutes && (
                <span className="text-[11px] font-bold flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{notes[activeNoteIndex].readTimeMinutes} min read</span>
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {notes[activeNoteIndex].title}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
              अध्याय {notes[activeNoteIndex].chapterNumber || activeNoteIndex + 1}: {getChapterDisplayTitle(notes[activeNoteIndex], activeNoteIndex)}
            </p>

            {notes[activeNoteIndex].tags && notes[activeNoteIndex].tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {notes[activeNoteIndex].tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Key Takeaways / Overview Summary if available */}
          {notes[activeNoteIndex].keyTakeaways && notes[activeNoteIndex].keyTakeaways.length > 0 && (
            <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>अध्याय के महत्वपूर्ण निष्कर्ष (Key Takeaways)</span>
              </div>
              <div className="space-y-1.5 pl-1">
                {notes[activeNoteIndex].keyTakeaways.map((kt, ktIdx) => (
                  <div key={ktIdx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{kt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Sections */}
          <div className="space-y-4">
            {notes[activeNoteIndex].sections.map((section, idx) => (
              <div key={section.id || idx} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {section.sectionNumber || idx + 1}
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-snug">
                      {section.heading}
                    </h2>
                    {section.headingHindi && (
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {section.headingHindi}
                      </p>
                    )}
                  </div>
                </div>

                <FormattedNoteContent content={section.content} />

                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="mt-3 bg-blue-50/70 dark:bg-slate-800/60 rounded-2xl p-3 border border-blue-100 dark:border-slate-700 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-blue-800 dark:text-blue-300 block">
                      मुख्य बिंदु (Key Points):
                    </span>
                    <div className="space-y-1">
                      {section.keyPoints.map((kp, kidx) => (
                        <div key={kidx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};
