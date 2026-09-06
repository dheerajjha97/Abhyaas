import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { FormattedNoteContent } from '../components/ui/FormattedNoteContent';
import { NotesSkeleton } from '../components/ui/Skeleton';
import { notesRepository } from '../services/notesRepository';
import { NoteData } from '../types/notes';
import { 
  BookOpen, 
  Clock, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  Sparkles,
  Bookmark,
  Calendar,
  Layers,
  FileText,
  Printer
} from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { SubjectCarousel } from '../components/ui/SubjectCarousel';
import { Toast, ToastMessage } from '../components/ui/Toast';

type PaperStyle = 'ruled' | 'sepia' | 'plain';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

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

  // Notebook Customization State
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [fontSize, setFontSize] = useState<FontSize>('base');

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

  const activeNote = notes[activeNoteIndex];

  // Colors for chapter tabs
  const tabColors = [
    { bg: 'bg-amber-400 text-amber-950 border-amber-500', active: 'ring-amber-500/30' },
    { bg: 'bg-sky-400 text-sky-950 border-sky-500', active: 'ring-sky-500/30' },
    { bg: 'bg-emerald-400 text-emerald-950 border-emerald-500', active: 'ring-emerald-500/30' },
    { bg: 'bg-purple-400 text-purple-950 border-purple-500', active: 'ring-purple-500/30' },
    { bg: 'bg-rose-400 text-rose-950 border-rose-500', active: 'ring-rose-500/30' },
  ];

  // Paper background class
  const paperClass = {
    ruled: 'notebook-ruled-paper',
    sepia: 'notebook-sepia-paper',
    plain: 'notebook-plain-paper',
  }[paperStyle];

  const currentDateStr = new Date().toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <HeaderBar 
        showBack={Boolean(paramSubjectId)}
        title="रिवीजन नोटबुक (Study Journal)" 
        subtitle={`Class ${classId} • ${selectedSubject}`} 
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              title="नोट्स प्रिंट करें"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-xs font-bold cursor-pointer hidden sm:flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट</span>
            </button>
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
          </div>
        }
      />

      {/* Horizontal Subject Switcher Carousel */}
      <SubjectCarousel
        classId={classId}
        selectedSubject={selectedSubject}
        onSelectSubject={(name) => setSelectedSubject(name)}
      />

      {loading ? (
        <NotesSkeleton />
      ) : !notes || notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mx-auto text-blue-600 border border-blue-100 dark:border-blue-900 shadow-2xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
              {selectedSubject} के नोट्स जल्द आ रहे हैं
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Class {classId} के लिए {selectedSubject} की डिजिटल नोटबुक तैयार की जा रही है।
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {selectedSubject.toLowerCase() !== 'political science' && (
              <button
                onClick={() => setSelectedSubject('Political Science')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Political Science नोटबुक खोलें</span>
              </button>
            )}
            <button
              onClick={openProfileModal}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              विषय सूची बदलें
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Notebook Floating Controls Bar */}
          <div className="flex items-center justify-between gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs text-xs">
            {/* Paper Theme Buttons */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline mr-1">
                पेज स्टाइल:
              </span>
              <button
                onClick={() => setPaperStyle('ruled')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  paperStyle === 'ruled'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                📝 लाइन्ड
              </button>
              <button
                onClick={() => setPaperStyle('sepia')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  paperStyle === 'sepia'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100'
                }`}
              >
                📜 सेपिया
              </button>
              <button
                onClick={() => setPaperStyle('plain')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  paperStyle === 'plain'
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                📄 प्लेन
              </button>
            </div>

            {/* Font Size Buttons */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline mr-1">
                फ़ॉन्ट:
              </span>
              {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                    fontSize === size
                      ? 'bg-blue-600 text-white shadow-2xs ring-2 ring-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {size === 'sm' ? 'A-' : size === 'base' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Sticky Index Tabs (Sticking out of the Notebook Spine) */}
          {notes.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 px-2 no-scrollbar">
              {notes.map((note, idx) => {
                const isSelected = activeNoteIndex === idx;
                const displayTitle = getChapterDisplayTitle(note, idx);
                const colorTheme = tabColors[idx % tabColors.length];

                return (
                  <button
                    key={note.noteId || idx}
                    onClick={() => setActiveNoteIndex(idx)}
                    className={`px-4 py-2 rounded-t-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border-t-2 border-x-2 active:scale-95 shrink-0 ${
                      isSelected
                        ? `${colorTheme.bg} shadow-md translate-y-0.5 z-10 scale-102 ring-2 ${colorTheme.active}`
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 opacity-85'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span>अध्याय {note.chapterNumber || idx + 1}: {displayTitle}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* MASTER NOTEBOOK SHEET */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-300/80 dark:border-slate-700/80 shadow-xl">
            
            {/* Top Notebook Binding Bar with Perforations */}
            <div className="bg-slate-800 dark:bg-slate-950 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block shadow-2xs" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-2xs" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-2xs" />
                </div>
                <span className="text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-slate-200">
                  अभ्यास स्टडी रजिस्टर • Class {classId}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {currentDateStr}
                </span>
                <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                  पृष्ठ {activeNote.chapterNumber || activeNoteIndex + 1}
                </span>
              </div>
            </div>

            {/* Notebook Inner Paper Sheet */}
            <div className={`p-4 sm:p-7 md:p-9 relative notebook-left-margin ${paperClass} min-h-[500px]`}>
              
              {/* Left Spiral Binding Rings Visual Effect (on Desktop) */}
              <div className="hidden sm:flex flex-col justify-between absolute left-2 top-10 bottom-10 w-4 pointer-events-none z-10 opacity-70">
                {Array.from({ length: 14 }).map((_, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400/80 dark:bg-slate-600 shadow-inner border border-slate-500/40" />
                    <div className="w-4 h-1.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-sm shadow-xs -ml-1 transform -rotate-6" />
                  </div>
                ))}
              </div>

              {/* Notebook Header Stamp (Like real classmate registers) */}
              <div className="ml-6 sm:ml-10 mb-6 pb-4 border-b-2 border-red-400/40 dark:border-red-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 px-3 py-1 rounded-xl text-red-700 dark:text-red-300 text-xs font-black">
                    <Layers className="w-3.5 h-3.5" />
                    <span>विषय: {selectedSubject}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-300/80 dark:border-amber-800">
                      {activeNote.board || 'BSEB Board'}
                    </span>
                    {activeNote.readTimeMinutes && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {activeNote.readTimeMinutes} min read
                      </span>
                    )}
                  </div>
                </div>

                {/* Notebook Big Title with Marker Underline */}
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 leading-tight">
                    {activeNote.title}
                  </h1>
                  <p className="text-sm sm:text-base font-extrabold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <span className="notebook-highlight-yellow">
                      अध्याय {activeNote.chapterNumber || activeNoteIndex + 1}: {getChapterDisplayTitle(activeNote, activeNoteIndex)}
                    </span>
                  </p>
                </div>

                {/* Tags Styled as Notebook Sticky Tape */}
                {activeNote.tags && activeNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-amber-100/80 dark:bg-slate-800 text-amber-950 dark:text-amber-200 text-[10px] font-black px-2 py-0.5 rounded border border-amber-200/80 dark:border-slate-700 shadow-2xs font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* KEY TAKEAWAYS (Styled as a Classic Yellow Sticky Memo / Post-It) */}
              {activeNote.keyTakeaways && activeNote.keyTakeaways.length > 0 && (
                <div className="ml-6 sm:ml-10 mb-8 relative p-4 sm:p-5 rounded-2xl bg-amber-100/90 dark:bg-amber-950/40 border border-amber-300/90 dark:border-amber-800/80 shadow-md space-y-2.5 transform -rotate-0.5 hover:rotate-0 transition-transform">
                  {/* Sticky Tape at Top */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-amber-200/60 dark:bg-amber-400/20 backdrop-blur-xs border border-amber-300/60 rounded-xs shadow-2xs pointer-events-none" />

                  <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-black text-xs sm:text-sm">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
                    <span>📌 परीक्षा के लिए महत्वपूर्ण निष्कर्ष (Key Takeaways):</span>
                  </div>

                  <div className="space-y-2 pl-1">
                    {activeNote.keyTakeaways.map((kt, ktIdx) => (
                      <div key={ktIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-900 dark:text-amber-100 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTE SECTIONS (Ruled Notebook Flow) */}
              <div className="ml-6 sm:ml-10 space-y-8">
                {activeNote.sections.map((section, idx) => (
                  <div 
                    key={section.id || idx} 
                    className="space-y-3.5 pb-6 border-b border-slate-200/80 dark:border-slate-800 last:border-none"
                  >
                    {/* Section Header */}
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        {section.sectionNumber || idx + 1}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-950 dark:text-white leading-snug">
                          {section.heading}
                        </h2>
                        {section.headingHindi && (
                          <p className="text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-400">
                            {section.headingHindi}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rich Formatted Note Content with Font-Size prop */}
                    <div className="pl-1 sm:pl-2">
                      <FormattedNoteContent content={section.content} fontSize={fontSize} />
                    </div>

                    {/* Key Points (Styled as Highlighter Box) */}
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-blue-50/90 dark:bg-slate-800/80 border-2 border-blue-200/90 dark:border-blue-900/60 shadow-2xs space-y-2">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-blue-900 dark:text-blue-300">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>रिवीजन पॉइंट्स (Key Summary Points):</span>
                        </div>
                        <div className="space-y-1.5 pl-1">
                          {section.keyPoints.map((kp, kidx) => (
                            <div key={kidx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                              <span>{kp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notebook Footer Signoff */}
              <div className="ml-6 sm:ml-10 mt-10 pt-6 border-t-2 border-slate-300/80 dark:border-slate-700 text-center space-y-1">
                <p className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-wider">
                  — ● पृष्ठ {activeNote.chapterNumber || activeNoteIndex + 1} समाप्त • अभ्यास रिवीजन रजिस्टर ● —
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  नोट्स को दोहराएं और क्विज प्रैक्टिस से अपनी तैयारी मजबूत करें
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

