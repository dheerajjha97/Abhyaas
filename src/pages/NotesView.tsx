import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Layers,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SlidersHorizontal,
  Search,
  X,
  Flame,
  HelpCircle,
  Share2,
  BookmarkCheck,
  Eye,
  EyeOff,
  Check
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

  // Notebook Customization State
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isHighlightsOnly, setIsHighlightsOnly] = useState<boolean>(false);

  // Modern UI Modals & Drawers
  const [showIndexModal, setShowIndexModal] = useState<boolean>(false);
  const [showTOCDrawer, setShowTOCDrawer] = useState<boolean>(false);
  const [indexSearchQuery, setIndexSearchQuery] = useState<string>('');
  
  // Read / Mastered Chapters Tracker
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());

  // Audio TTS Reader State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [currentSpeechText, setCurrentSpeechText] = useState<string>('');

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const notebookContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paramSubjectId) {
      setSelectedSubject(decodeURIComponent(paramSubjectId));
    }
  }, [paramSubjectId]);

  // Load read status from localStorage
  useEffect(() => {
    const key = `abhyaas_read_chapters_${classId}_${selectedSubject}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setReadChapters(new Set(JSON.parse(saved)));
      } else {
        setReadChapters(new Set());
      }
    } catch {
      setReadChapters(new Set());
    }
  }, [classId, selectedSubject]);

  const toggleChapterReadStatus = (noteId: string) => {
    const next = new Set(readChapters);
    if (next.has(noteId)) {
      next.delete(noteId);
      setToast({ id: Date.now().toString(), type: 'info', message: 'अध्याय को अपठित (Unread) मार्क किया गया' });
    } else {
      next.add(noteId);
      setToast({ id: Date.now().toString(), type: 'success', message: 'शाबाश! यह अध्याय पूरा पढ़ा गया (Completed) ⭐' });
    }
    setReadChapters(next);
    const key = `abhyaas_read_chapters_${classId}_${selectedSubject}`;
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(next)));
    } catch {}
  };

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
    // Cancel any playing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [classId, selectedSubject]);

  // Reading Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((el.scrollTop / totalHeight) * 100)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeNote = notes[activeNoteIndex];

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

  // Smooth scroll to specific section inside current note
  const scrollToSection = (sectionIndex: number) => {
    setShowTOCDrawer(false);
    const targetElement = document.getElementById(`note-section-${sectionIndex}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Audio Speech Synthesis Handler
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      setToast({ id: Date.now().toString(), type: 'error', message: 'ऑडियो वाचक आपके ब्राउज़र में उपलब्ध नहीं है।' });
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!activeNote) return;

    // Collect text from active note
    const titleText = `${activeNote.title}. ${getChapterDisplayTitle(activeNote, activeNoteIndex)}. `;
    const takeawaysText = activeNote.keyTakeaways ? `मुख्य निष्कर्ष: ${activeNote.keyTakeaways.join('. ')}. ` : '';
    const sectionsText = activeNote.sections
      .map((s, idx) => `अनुभाग ${idx + 1}: ${s.heading}. ${s.content.replace(/[#*`_]/g, '')}`)
      .join('. ');

    const fullTextToRead = `${titleText} ${takeawaysText} ${sectionsText}`.slice(0, 4000); // comfortable chunk
    setCurrentSpeechText(fullTextToRead);

    const utterance = new SpeechSynthesisUtterance(fullTextToRead);
    utterance.lang = 'hi-IN';
    utterance.rate = audioSpeed;
    
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setToast({ id: Date.now().toString(), type: 'success', message: 'अध्याय वाचन पूरा हुआ! ⭐' });
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
    setToast({ id: Date.now().toString(), type: 'info', message: 'ऑडियो वाचन शुरू हुआ...' });
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setToast({ id: Date.now().toString(), type: 'info', message: `गति ${newSpeed}x सेट की गई। पुनः प्ले करें।` });
    }
  };

  // Filtered chapters for the index modal
  const filteredChapters = notes.map((n, idx) => ({
    note: n,
    idx,
    title: getChapterDisplayTitle(n, idx),
  })).filter((item) => {
    if (!indexSearchQuery.trim()) return true;
    const q = indexSearchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.note.title && item.note.title.toLowerCase().includes(q)) ||
      (item.note.chapterNumber && String(item.note.chapterNumber).includes(q)) ||
      item.note.sections?.some((s) => s.heading.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Reading Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800 z-50 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <HeaderBar 
        showBack={Boolean(paramSubjectId)}
        title="रिवीजन नोटबुक" 
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
          
          {/* 🌟 1. MODERN SMART CHAPTER COMMAND BAR (Replaces Clunky Tabs) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              {/* Current Chapter Selector Trigger */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => setShowIndexModal(true)}
                  className="flex items-center gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-900 transition-all cursor-pointer group text-left min-w-0 flex-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {activeNote.chapterNumber || activeNoteIndex + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        अध्याय {activeNote.chapterNumber || activeNoteIndex + 1} / {notes.length}
                      </span>
                      {readChapters.has(activeNote.noteId || String(activeNoteIndex)) && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> पूरा पढ़ा
                        </span>
                      )}
                    </div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {getChapterDisplayTitle(activeNote, activeNoteIndex)}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-blue-200 dark:border-slate-700 shadow-2xs shrink-0 flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">सभी अध्याय</span>
                  </span>
                </button>
              </div>

              {/* Prev / Next Fast Jumpers */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (activeNoteIndex > 0) {
                      setActiveNoteIndex(activeNoteIndex - 1);
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsPlayingAudio(false);
                    }
                  }}
                  disabled={activeNoteIndex === 0}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                  title="पिछला अध्याय"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला</span>
                </button>

                {/* Section Outline (TOC) Trigger */}
                <button
                  onClick={() => setShowTOCDrawer(true)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="इस अध्याय के अनुभाग (Table of Contents)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>अनुभाग ({activeNote.sections?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    if (activeNoteIndex < notes.length - 1) {
                      setActiveNoteIndex(activeNoteIndex + 1);
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsPlayingAudio(false);
                    }
                  }}
                  disabled={activeNoteIndex === notes.length - 1}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-white flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="अगला अध्याय"
                >
                  <span>अगला</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Stepper Dots Bar for Desktop/Tablet */}
            {notes.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 pt-1 overflow-x-auto pb-0.5 no-scrollbar">
                {notes.map((note, idx) => {
                  const isCurrent = activeNoteIndex === idx;
                  const isRead = readChapters.has(note.noteId || String(idx));
                  return (
                    <button
                      key={note.noteId || idx}
                      onClick={() => {
                        setActiveNoteIndex(idx);
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        setIsPlayingAudio(false);
                      }}
                      title={`अध्याय ${note.chapterNumber || idx + 1}: ${getChapterDisplayTitle(note, idx)}`}
                      className={`h-7 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs scale-105 ring-2 ring-blue-500/20'
                          : isRead
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isRead && !isCurrent ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span>Ch {note.chapterNumber || idx + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 🌟 2. READING SUPERPOWERS TOOLBAR (Audio Reader, Highlights Toggle, Theme & Font) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              
              {/* Audio Play & Speed Controls */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <button
                  onClick={handleToggleAudio}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-600 text-white animate-pulse shadow-2xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-2xs'
                  }`}
                  title="ऑडियो वाचक (Listen Aloud)"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>रोकें (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>सुनें (Audio)</span>
                    </>
                  )}
                </button>

                {/* Speed selector */}
                {[1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleChangeSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      audioSpeed === spd
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Highlights Only Mode Toggle */}
              <button
                onClick={() => setIsHighlightsOnly(!isHighlightsOnly)}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isHighlightsOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
                title="केवल मुख्य परीक्षा बिंदु देखें"
              >
                <Flame className={`w-3.5 h-3.5 ${isHighlightsOnly ? 'fill-slate-950' : 'text-amber-500'}`} />
                <span>{isHighlightsOnly ? '⚡ केवल मुख्य बिंदु ऑन' : '⚡ 2-Min मुख्य बिंदु'}</span>
              </button>

              {/* Mark as Completed Button */}
              <button
                onClick={() => toggleChapterReadStatus(activeNote.noteId || String(activeNoteIndex))}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  readChapters.has(activeNote.noteId || String(activeNoteIndex))
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>{readChapters.has(activeNote.noteId || String(activeNoteIndex)) ? 'पढ़ा हुआ ⭐' : 'पढ़ा हुआ मार्क करें'}</span>
              </button>

              {/* Customization controls (Paper style & Font) */}
              <div className="flex items-center gap-2">
                {/* Paper Style */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaperStyle('ruled')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      paperStyle === 'ruled' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="लाइन्ड पेपर"
                  >
                    📝
                  </button>
                  <button
                    onClick={() => setPaperStyle('sepia')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      paperStyle === 'sepia' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="सेपिया पेपर"
                  >
                    📜
                  </button>
                  <button
                    onClick={() => setPaperStyle('plain')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      paperStyle === 'plain' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="प्लेन पेपर"
                  >
                    📄
                  </button>
                </div>

                {/* Font size */}
                <div className="flex items-center gap-1">
                  {(['sm', 'base', 'lg'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`w-6 h-6 rounded-lg font-black text-[10px] flex items-center justify-center transition-all cursor-pointer ${
                        fontSize === size
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {size === 'sm' ? 'A-' : size === 'base' ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* 🌟 3. MASTER NOTEBOOK SHEET (Realistic Ruled Notebook Layout) */}
          <div ref={notebookContainerRef} className="relative rounded-3xl overflow-hidden border-2 border-slate-300/80 dark:border-slate-700/80 shadow-xl">
            
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
                  <Clock className="w-3 h-3 text-amber-400" />
                  {activeNote.readTimeMinutes || 5} min
                </span>
                <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                  अध्याय {activeNote.chapterNumber || activeNoteIndex + 1}
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

              {/* Notebook Header Stamp */}
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
                    <button
                      onClick={() =>
                        navigate(`/quick-revision/${encodeURIComponent(selectedSubject)}`)
                      }
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 text-xs font-bold cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>रिवीजन फ्लैशकार्ड्स</span>
                    </button>
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

              {/* KEY TAKEAWAYS (Sticky Note) */}
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
                    id={`note-section-${idx}`}
                    className="space-y-3.5 pb-6 border-b border-slate-200/80 dark:border-slate-800 last:border-none scroll-mt-24"
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

                    {/* Rich Formatted Note Content (Hidden if in Highlights Only Mode) */}
                    {!isHighlightsOnly && (
                      <div className="pl-1 sm:pl-2">
                        <FormattedNoteContent content={section.content} fontSize={fontSize} />
                      </div>
                    )}

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

              {/* Bottom Navigation & Chapter Complete Card */}
              <div className="ml-6 sm:ml-10 mt-10 pt-6 border-t-2 border-slate-300/80 dark:border-slate-700 space-y-4">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      अध्याय {activeNote.chapterNumber || activeNoteIndex + 1} समाप्त हुआ!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      क्या आपने सभी बिंदुओं को समझ लिया? अगले अध्याय पर जाएँ या रिवीजन कार्ड्स देखें।
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleChapterReadStatus(activeNote.noteId || String(activeNoteIndex))}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{readChapters.has(activeNote.noteId || String(activeNoteIndex)) ? 'पढ़ा हुआ ✅' : 'मार्क कम्प्लीट'}</span>
                    </button>

                    {activeNoteIndex < notes.length - 1 && (
                      <button
                        onClick={() => {
                          setActiveNoteIndex(activeNoteIndex + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          if (window.speechSynthesis) window.speechSynthesis.cancel();
                          setIsPlayingAudio(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                      >
                        <span>अगला अध्याय</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1">
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

        </div>
      )}

      {/* 🌟 4. CHAPTER INDEX MODAL (अध्याय सूचकांक / All Chapters Drawer) */}
      {showIndexModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  {selectedSubject} • Class {classId}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-blue-600" />
                  <span>सम्पूर्ण अध्याय सूचकांक ({notes.length} Chapters)</span>
                </h3>
              </div>

              <button
                onClick={() => setShowIndexModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter in chapters */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="अध्याय या टॉपिक खोजें..."
                  value={indexSearchQuery}
                  onChange={(e) => setIndexSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Chapter List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  कोई अध्याय नहीं मिला।
                </div>
              ) : (
                filteredChapters.map(({ note, idx, title }) => {
                  const isCurrent = activeNoteIndex === idx;
                  const isRead = readChapters.has(note.noteId || String(idx));
                  return (
                    <div
                      key={note.noteId || idx}
                      onClick={() => {
                        setActiveNoteIndex(idx);
                        setShowIndexModal(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                        setIsPlayingAudio(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 shadow-2xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : isRead
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isRead ? <Check className="w-4 h-4" /> : note.chapterNumber || idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400">
                              अध्याय {note.chapterNumber || idx + 1}
                            </span>
                            {isRead && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                • पढ़ा हुआ ⭐
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {note.sections?.length || 0} अनुभाग • {note.readTimeMinutes || 5} min read
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-slate-300'}`} />
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>कुल प्रगति: {readChapters.size} / {notes.length} अध्याय पढ़े गए</span>
              <button
                onClick={() => setShowIndexModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 5. SECTION TOC (Table of Contents) DRAWER */}
      {showTOCDrawer && activeNote && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  अध्याय {activeNote.chapterNumber || activeNoteIndex + 1}
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  अनुभाग रूपरेखा (Table of Contents)
                </h3>
              </div>

              <button
                onClick={() => setShowTOCDrawer(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sections List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">
                किसी भी अनुभाग पर टैप करके सीधे उस पैराग्राफ पर पहुँचें:
              </p>

              {activeNote.sections.map((section, sidx) => (
                <button
                  key={section.id || sidx}
                  onClick={() => scrollToSection(sidx)}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer flex items-start gap-2.5 group"
                >
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {section.sectionNumber || sidx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {section.heading}
                    </h5>
                    {section.headingHindi && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {section.headingHindi}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-right">
              <button
                onClick={() => setShowTOCDrawer(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
