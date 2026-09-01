import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { notesRepository } from '../services/notesRepository';
import { NoteData } from '../types/notes';
import { BookOpen, Clock, Tag, Award, Sparkles, CheckCircle2, ChevronLeft, Bookmark } from 'lucide-react';

export const NotesView: React.FC = () => {
  const { classId = '12', subjectId = 'pol-science' } = useParams<{ classId: string; subjectId: string }>();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<NoteData[]>([]);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    notesRepository.getNotesForSubject(classId, subjectId).then((data) => {
      if (isMounted) {
        setNotes(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [classId, subjectId]);

  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <HeaderBar title="Revision Notes" subtitle="नोट्स लोड हो रहे हैं..." />
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">अध्याय नोट्स लोड हो रहे हैं...</p>
        </div>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="space-y-4 pb-24">
        <HeaderBar title="Revision Notes" subtitle="अध्यायवार नोट्स" />
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl p-6 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">नोट्स जल्द उपलब्ध होंगे</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {subjectId} (Class {classId}) के अध्यायवार रिवीजन नोट्स तैयार किए जा रहे हैं।
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer"
          >
            वापस जाएँ
          </button>
        </div>
      </div>
    );
  }

  const activeNote = notes[activeNoteIndex];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar
        title={`${activeNote.subjectName || subjectId} Notes`}
        subtitle={`Class ${activeNote.classId || classId} • ${activeNote.chapterTitle || 'Chapter Revision'}`}
      />

      {/* Chapter Selector if multiple chapters exist */}
      {notes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {notes.map((note, idx) => (
            <button
              key={note.noteId}
              onClick={() => setActiveNoteIndex(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeNoteIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/80 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              अध्याय {note.chapterNumber || idx + 1}: {note.chapterTitle || `Notes ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
              {activeNote.board || 'Bihar Board (BSEB)'} • {activeNote.academicYear || '2025-2026'}
            </span>
            {activeNote.readTimeMinutes && (
              <span className="text-[11px] font-bold flex items-center gap-1 opacity-90">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeNote.readTimeMinutes} min read</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black">{activeNote.title}</h1>
          {activeNote.chapterTitle && (
            <p className="text-xs sm:text-sm font-semibold text-indigo-100">
              अध्याय {activeNote.chapterNumber}: {activeNote.chapterTitle}
            </p>
          )}

          {activeNote.tags && activeNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {activeNote.tags.map((tag) => (
                <span key={tag} className="bg-white/10 text-indigo-100 text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Sections */}
      <div className="space-y-4">
        {activeNote.sections.map((section, idx) => (
          <GlassCard key={section.id || idx} className="p-4 sm:p-5 space-y-3 border border-indigo-100/70 dark:border-slate-800">
            <div className="flex items-center gap-2 border-b border-indigo-100 dark:border-slate-800 pb-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                {section.sectionNumber || idx + 1}
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                {section.heading}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {section.content}
            </div>

            {section.keyPoints && section.keyPoints.length > 0 && (
              <div className="mt-3 bg-indigo-50/70 dark:bg-slate-900/80 rounded-2xl p-3 border border-indigo-100 dark:border-slate-700 space-y-1.5">
                <span className="text-[11px] font-extrabold text-indigo-800 dark:text-indigo-300 block">
                  मुख्य बिंदु (Key Points):
                </span>
                <div className="space-y-1">
                  {section.keyPoints.map((kp, kidx) => (
                    <div key={kidx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
