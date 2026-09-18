import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { FormattedNoteContent } from '../components/ui/FormattedNoteContent';
import { NotesSkeleton } from '../components/ui/Skeleton';
import { notesRepository } from '../services/notesRepository';
import { getVisualEnrichmentForNote } from '../services/notesVisualService';
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
  ChevronDown,
  ChevronUp,
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
  Bookmark,
  Eye,
  EyeOff,
  Check,
  Target,
  Star,
  Lightbulb,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { SubjectCarousel } from '../components/ui/SubjectCarousel';
import { Toast, ToastMessage } from '../components/ui/Toast';

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

  // Reading Customization State
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isHighlightsOnly, setIsHighlightsOnly] = useState<boolean>(false);

  // Modern UI Modals & Drawers
  const [showIndexModal, setShowIndexModal] = useState<boolean>(false);
  const [showTOCDrawer, setShowTOCDrawer] = useState<boolean>(false);
  const [indexSearchQuery, setIndexSearchQuery] = useState<string>('');
  
  // Read / Mastered Chapters Tracker
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set());

  // Collapsible Section Key Points State
  const [expandedKeyPoints, setExpandedKeyPoints] = useState<Set<string>>(new Set());

  const toggleKeyPoints = (keyPointId: string) => {
    setExpandedKeyPoints((prev) => {
      const next = new Set(prev);
      if (next.has(keyPointId)) {
        next.delete(keyPointId);
      } else {
        next.add(keyPointId);
      }
      return next;
    });
  };

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
          message: `${selectedSubject} के नोट्स सफलतापूर्वक अपडेट हो गए! (${data.length} अध्याय उपलब्ध)`,
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
        title="रिवीजन नोट्स" 
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
              title="नवीनतम नोट्स रीफ़्रेश करें"
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

              {/* Customization controls (Font Size only) */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 px-1">फॉन्ट:</span>
                {(['sm', 'base', 'lg'] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-2 py-0.5 rounded-lg font-black text-[11px] flex items-center justify-center transition-all cursor-pointer ${
                      fontSize === size
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {size === 'sm' ? 'A-' : size === 'base' ? 'A' : 'A+'}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* 🌟 3. MASTER FULL-WIDTH STUDY NOTES VIEW (Full Wide Clean Modern Layout) */}
          {(() => {
            const visual = getVisualEnrichmentForNote(activeNote, selectedSubject);
            const chapterNumFormatted = String(activeNote.chapterNumber || activeNoteIndex + 1).padStart(2, '0');

            return (
              <div ref={notebookContainerRef} className="w-full space-y-6">

                {/* 🌟 A. VISUAL CHAPTER HEADER BANNER (Full Wide Modern Card) */}
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
                  
                  <div className="flex items-start justify-between gap-5">
                    
                    {/* Chapter Title & Number Badge */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1 bg-blue-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-2xs">
                          अध्याय
                        </span>
                        <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                          {chapterNumFormatted}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          • {activeNote.readTimeMinutes || 5} min read
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 block tracking-wide">
                          विस्तृत अध्ययन:
                        </span>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white leading-tight">
                          {activeNote.chapterTitleHindi || activeNote.title}
                        </h1>
                        {activeNote.chapterTitle && activeNote.chapterTitle !== activeNote.title && (
                          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                            ({activeNote.chapterTitle})
                          </p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* 📖 Chapter Overview Summary Strip */}
                  <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-900/70 flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">📖</span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-blue-100 leading-relaxed">
                      {visual.overviewSummary}
                    </p>
                  </div>

                  {/* 🌟 3-COLUMN FEATURE CARDS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    
                    {/* Card 1: 🎯 परीक्षा में महत्वपूर्ण */}
                    <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-black text-xs sm:text-sm">
                        <Target className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>परीक्षा में महत्वपूर्ण</span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {visual.examImportantPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-1.5 leading-snug">
                            <span className="text-rose-500 font-bold shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 2: ⭐ याद रखें */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-black text-xs sm:text-sm">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        <span>याद रखें</span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {visual.rememberPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-1.5 leading-snug">
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 3: 💡 मुख्य शब्द (Chips) */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm">
                        <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>मुख्य शब्द</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {visual.keyTerms.map((term, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold text-center truncate border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* 🌟 B. STRUCTURED SECTION CARDS (01, 02...) */}
                <div className="space-y-6">
                  {activeNote.sections.map((section, idx) => {
                    const secNumStr = String(section.sectionNumber || idx + 1).padStart(2, '0');
                    const isBookmarked = bookmarkedSections.has(section.id || `${activeNote.noteId}_${idx}`);
                    const secKeyPointId = `${activeNote.noteId || activeNoteIndex}_sec_${idx}`;
                    const isKeyPointsExpanded = expandedKeyPoints.has(secKeyPointId);

                    return (
                      <div
                        key={section.id || idx}
                        id={`note-section-${idx}`}
                        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 scroll-mt-24 transition-all hover:border-blue-300 dark:hover:border-blue-800"
                      >
                        
                        {/* Section Card Top Header Bar */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {secNumStr}
                            </span>
                            <div>
                              <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-snug">
                                {section.heading}
                              </h2>
                              {section.headingHindi && section.headingHindi !== section.heading && (
                                <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">
                                   {section.headingHindi}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const secId = section.id || `${activeNote.noteId}_${idx}`;
                              const next = new Set(bookmarkedSections);
                              if (next.has(secId)) {
                                next.delete(secId);
                                setToast({ id: Date.now().toString(), type: 'info', message: 'बुकमार्क हटाया गया' });
                              } else {
                                next.add(secId);
                                setToast({ id: Date.now().toString(), type: 'success', message: 'अनुभाग बुकमार्क में सहेजा गया 🔖' });
                              }
                              setBookmarkedSections(next);
                            }}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isBookmarked
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title={isBookmarked ? 'बुकमार्क हटाया गया' : 'बुकमार्क करें'}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                          </button>
                        </div>

                        {/* Section Main Content */}
                        <div className="w-full space-y-3.5">
                          {!isHighlightsOnly && (
                            <FormattedNoteContent content={section.content} fontSize={fontSize} />
                          )}

                          {/* "मुख्य बिंदु" Icon Strip */}
                          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-wrap items-center gap-3 text-xs text-slate-800 dark:text-amber-200">
                            <span className="font-black text-amber-900 dark:text-amber-300">मुख्य बिंदु:</span>
                            <span className="flex items-center gap-1 font-medium">
                              <span>✏️</span>
                              <span>अवधारणा स्पष्टता</span>
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <span>🏺</span>
                              <span>प्रमुख स्रोत व साक्ष्य</span>
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <span>🔍</span>
                              <span>परीक्षा विश्लेषण</span>
                            </span>
                          </div>
                        </div>

                        {/* 🌟 Collapsible Section Key Points Panel */}
                        {section.keyPoints && section.keyPoints.length > 0 && (
                          <div className="mt-3 overflow-hidden rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 dark:bg-slate-800/70 transition-all">
                            {/* Accordion Header / Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleKeyPoints(secKeyPointId)}
                              className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-blue-100/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="text-xs sm:text-sm font-black text-blue-950 dark:text-blue-200">
                                  स्मरण बिंदु (Section Key Points)
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900/80 text-[10px] font-bold text-blue-800 dark:text-blue-200">
                                  {section.keyPoints.length} मुख्य बिंदु
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 shrink-0">
                                <span>{isKeyPointsExpanded ? 'छुपाएं' : 'देखें'}</span>
                                {isKeyPointsExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </button>

                            {/* Accordion Content */}
                            {isKeyPointsExpanded && (
                              <div className="p-4 pt-1 border-t border-blue-200/60 dark:border-blue-900/40 space-y-2 animate-in fade-in duration-150">
                                {section.keyPoints.map((kp, kidx) => (
                                  <div 
                                    key={kidx} 
                                    className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-xl border border-blue-100/80 dark:border-slate-800/80 shadow-2xs"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                    <span>{kp}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* 🌟 C. BOTTOM REVISION STRIP & MCQS PRACTICE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-2">
                  
                  {/* ⚡ 2-Minute Revision Strip */}
                  <div className="lg:col-span-2 p-5 rounded-3xl bg-amber-100/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-amber-950 dark:text-amber-200 font-black text-xs sm:text-sm">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                      <span>⚡ 2-Minute Quick Revision:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visual.quickRevisionStrip.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-amber-900/60 shadow-2xs text-xs"
                        >
                          <span className="w-6 h-6 rounded-lg bg-amber-400/90 text-amber-950 font-black text-[11px] flex items-center justify-center shrink-0">
                            {item.label}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 📝 अभ्यास करें (Practice MCQs Card) */}
                  <div 
                    onClick={() => navigate(`/quick-revision/${encodeURIComponent(selectedSubject)}`)}
                    className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-purple-100/80 dark:hover:bg-purple-900/50 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">📝</span>
                      <div>
                        <span className="text-xs font-black text-purple-900 dark:text-purple-200 block">
                          अभ्यास करें
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                          रिवीजन & MCQs टेस्ट
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-black group-hover:translate-x-0.5 transition-transform shadow-2xs">
                      <span>10 MCQs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>

                {/* Bottom Chapter Completion / Next Chapter Jump */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      अध्याय {chapterNumFormatted} समाप्त हुआ!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      इस अध्याय को पूरा पढ़ने के बाद 'मार्क कम्प्लीट' पर टैप करें।
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

              </div>
            );
          })()}

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
