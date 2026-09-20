import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { HeaderBar } from '../components/ui/HeaderBar';
import { FormattedAnswer } from '../components/ui/FormattedAnswer';
import { SecurityWatermark } from '../components/security/ContentProtection';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import {
  getQuestionBankForSubject,
  QuestionBankItem,
} from '../services/questionBankService';
import { normalizeSubject, resolvePaperSubject } from '../services/questionRepository';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { saveBookmark, removeBookmark, isBookmarked } from '../utils/bookmarkStorage';
import { shareShortQuestion, shareToSocial } from '../utils/shareUtils';
import {
  Search,
  BookOpen,
  Filter,
  Eye,
  EyeOff,
  Bookmark,
  Volume2,
  VolumeX,
  Copy,
  CheckCheck,
  Share2,
  Sparkles,
  Flame,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  Type,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

type QuestionTypeFilter = 'all' | 'short' | 'long' | 'repeated';

export const QuestionBank: React.FC = () => {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, setStudentClass } = useStudentProfile();

  // Active Subject & Class state
  const selectedClass = profile.classId || '12';
  const availableSubjects = useMemo(() => {
    return ALL_AVAILABLE_SUBJECTS.filter((sub) => sub.classes.includes(selectedClass));
  }, [selectedClass]);

  const defaultSubject = useMemo(() => {
    if (subjectId) {
      const decoded = decodeURIComponent(subjectId);
      const match = availableSubjects.find(
        (s) => s.name.toLowerCase() === decoded.toLowerCase() || s.hindiName === decoded
      );
      if (match) return match.name;
    }
    return availableSubjects[0]?.name || 'Political Science';
  }, [subjectId, availableSubjects]);

  const [activeSubject, setActiveSubject] = useState<string>(defaultSubject);

  // Sync if URL param changes
  useEffect(() => {
    if (subjectId) {
      const decoded = decodeURIComponent(subjectId);
      const match = availableSubjects.find(
        (s) => s.name.toLowerCase() === decoded.toLowerCase() || s.hindiName === decoded
      );
      if (match) {
        setActiveSubject(match.name);
      }
    }
  }, [subjectId, availableSubjects]);

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [shortQuestions, setShortQuestions] = useState<QuestionBankItem[]>([]);
  const [longQuestions, setLongQuestions] = useState<QuestionBankItem[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);

  // UI / Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<QuestionTypeFilter>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());

  // Load question bank for active subject
  const loadQuestionBank = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        const data = await getQuestionBankForSubject(activeSubject, selectedClass, forceRefresh);
        setShortQuestions(data.shortQuestions);
        setLongQuestions(data.longQuestions);
        setAllQuestions(data.allQuestions);

        // Check bookmarks for all loaded questions
        const bSet = new Set<string>();
        data.allQuestions.forEach((q) => {
          if (isBookmarked(q.id)) {
            bSet.add(q.id);
          }
        });
        setBookmarkedSet(bSet);
      } catch (err) {
        console.error('Failed to load question bank:', err);
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: 'प्रश्न लोड करने में समस्या आई। पुनः प्रयास करें।',
        });
      } finally {
        setLoading(false);
      }
    },
    [activeSubject, selectedClass]
  );

  useEffect(() => {
    loadQuestionBank();
  }, [loadQuestionBank]);

  // Stop speech when unmounting or changing subject
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeSubject]);

  // Handle subject change
  const handleSelectSubject = (subName: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setActiveSubject(subName);
    setSearchQuery('');
    setExpandedIds(new Set());
    navigate(`/question-bank/${encodeURIComponent(subName)}`, { replace: true });
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    let list = allQuestions;

    if (typeFilter === 'short') {
      list = shortQuestions;
    } else if (typeFilter === 'long') {
      list = longQuestions;
    } else if (typeFilter === 'repeated') {
      list = allQuestions.filter((q) => q.isRepeated);
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.years.some((y) => y.toString().includes(query))
    );
  }, [allQuestions, shortQuestions, longQuestions, typeFilter, searchQuery]);

  // Accordion toggle
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expand / Collapse All
  const handleToggleExpandAll = () => {
    if (expandedIds.size === filteredQuestions.length && filteredQuestions.length > 0) {
      setExpandedIds(new Set());
    } else {
      const allIds = new Set(filteredQuestions.map((q) => q.id));
      setExpandedIds(allIds);
    }
  };

  // Bookmark toggle
  const handleToggleBookmark = (item: QuestionBankItem) => {
    const isCurrentlyBookmarked = bookmarkedSet.has(item.id);
    if (isCurrentlyBookmarked) {
      removeBookmark(item.id);
      setBookmarkedSet((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'प्रश्न सहेजे गए से हटा दिया गया',
      });
    } else {
      saveBookmark({
        id: item.id,
        paperId: item.paperIds[0] || `qb-${item.subject}`,
        paperName: `${item.subject} Question Bank (${item.years.join(', ')})`,
        classId: item.classId,
        subject: item.subject,
        year: item.years[0] || 2026,
        type: item.type,
        question: item.question,
        answer: item.answer,
      });
      setBookmarkedSet((prev) => new Set(prev).add(item.id));
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'प्रश्न सफलता से सहेज लिया गया (Bookmarked)',
      });
    }
  };

  // Copy to clipboard
  const handleCopyQuestion = (item: QuestionBankItem) => {
    const textToCopy = `📌 [${item.subject} • ${item.type === 'short' ? 'लघु उत्तरीय (2 अंक)' : 'दीर्घ उत्तरीय (5 अंक)'}]\n` +
      `❓ प्रश्न: ${item.question}\n` +
      `🗓️ बोर्ड परीक्षा: ${item.years.join(', ')} (${item.frequency} बार पूछा गया)\n\n` +
      `💡 उत्तर:\n${item.answer}\n\n` +
      `-- अभ्यास (Abhyaas PYQ ऐप)`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'प्रश्न व उत्तर कॉपी कर लिया गया',
    });
  };

  // Text-to-Speech audio reading
  const handleToggleSpeech = (item: QuestionBankItem) => {
    if (!('speechSynthesis' in window)) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'आपके ब्राउज़र में आवाज़ (Text-to-Speech) समर्थित नहीं है',
      });
      return;
    }

    if (speakingId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanQuestion = item.question.replace(/[#*]/g, '');
    const cleanAnswer = item.answer.replace(/[#*]/g, '').slice(0, 800); // speak first 800 chars for comfort
    const speechText = `प्रश्न: ${cleanQuestion}. उत्तर: ${cleanAnswer}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(item.id);
    window.speechSynthesis.speak(utterance);
  };

  // Share question
  const handleShare = async (item: QuestionBankItem) => {
    const text = `📖 *${item.subject} - महत्वपूर्ण ${item.type === 'short' ? 'लघु' : 'दीर्घ'} उत्तरीय प्रश्न*\n\n` +
      `❓ *प्रश्न:* ${item.question}\n` +
      `🎯 *बोर्ड परीक्षा:* ${item.years.join(', ')} (${item.frequency} बार रिपीटेड)\n\n` +
      `💡 *मॉडल उत्तर:* ${item.answer.slice(0, 200)}...\n\n` +
      `📲 पूरा उत्तर पढ़ने के लिए अभ्यास ऐप देखें:`;

    await shareToSocial({
      title: `${item.subject} बोर्ड प्रश्नोत्तर`,
      text,
    });
  };

  const activeSubjectObj = availableSubjects.find((s) => s.name === activeSubject);

  return (
    <div className="space-y-4 sm:space-y-5 pb-28 animate-in fade-in max-w-4xl mx-auto px-1 sm:px-2">
      <SecurityWatermark />
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Top Header */}
      <HeaderBar
        showBack
        title="Question Bank (विषयवार प्रश्न बैंक)"
        subtitle="सभी वर्षों के यूनीक लघु एवं दीर्घ उत्तरीय प्रश्नोत्तर (बिना दोहराव)"
      />

      {/* Hero Overview Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 text-white rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20">
                100% De-duplicated • मॉडल उत्तर
              </span>
              <span className="text-[11px] font-bold text-blue-100">
                कक्षा {selectedClass} • {activeSubjectObj?.hindiName || activeSubject}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {activeSubjectObj?.hindiName || activeSubject} मास्टर प्रश्न बैंक
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              पिछले सभी वर्षों के प्रश्नपत्रों से संकलित अद्वितीय लघु एवं दीर्घ उत्तरीय प्रश्न, दोहराव-रहित और आधिकारिक मॉडल उत्तरों सहित।
            </p>
          </div>

          {/* Quick Counter Pills */}
          <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15">
            <div className="text-center px-2 sm:px-3">
              <div className="text-lg sm:text-xl font-black">{shortQuestions.length}</div>
              <div className="text-[10px] font-medium text-blue-200">लघु उत्तरीय</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2 sm:px-3">
              <div className="text-lg sm:text-xl font-black">{longQuestions.length}</div>
              <div className="text-[10px] font-medium text-blue-200">दीर्घ उत्तरीय</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2 sm:px-3">
              <div className="text-lg sm:text-xl font-black text-amber-300">
                {allQuestions.filter((q) => q.isRepeated).length}
              </div>
              <div className="text-[10px] font-medium text-amber-200">रिपीटेड (VVI)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Selector Switcher */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>कक्षा चुनें:</span>
        </span>
        <div className="flex items-center gap-1">
          {['10', '11', '12'].map((cId) => (
            <button
              key={cId}
              onClick={() => {
                setStudentClass(cId);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedClass === cId
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Class {cId}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Subject Pill Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
          <span>विषय का चयन करें:</span>
          <span className="text-[11px] font-medium text-slate-500">
            {availableSubjects.length} विषय उपलब्ध
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {availableSubjects.map((sub) => {
            const isSelected = activeSubject.toLowerCase() === sub.name.toLowerCase();
            return (
              <button
                key={sub.id}
                onClick={() => handleSelectSubject(sub.name)}
                className={`snap-start px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{sub.hindiName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sub.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Type Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`खोजें: "${activeSubjectObj?.hindiName || activeSubject}" का कोई भी प्रश्न या विषय...`}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>सभी</span>
              <span className="text-[10px] opacity-80">({allQuestions.length})</span>
            </button>

            <button
              onClick={() => setTypeFilter('short')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'short'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>लघु उत्तरीय (2 अंक)</span>
              <span className="text-[10px] opacity-80">({shortQuestions.length})</span>
            </button>

            <button
              onClick={() => setTypeFilter('long')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'long'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>दीर्घ उत्तरीय (5 अंक)</span>
              <span className="text-[10px] opacity-80">({longQuestions.length})</span>
            </button>

            <button
              onClick={() => setTypeFilter('repeated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'repeated'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-900/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>रिपीटेड (PYQ VVI)</span>
              <span className="text-[10px] opacity-80">
                ({allQuestions.filter((q) => q.isRepeated).length})
              </span>
            </button>
          </div>

          {/* Quick utility actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Expand / Collapse all */}
            <button
              onClick={handleToggleExpandAll}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              title={expandedIds.size > 0 ? 'सभी उत्तर छुपाएं' : 'सभी उत्तर खोलें'}
            >
              {expandedIds.size > 0 ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">सभी छुपाएं</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">सभी खोलें</span>
                </>
              )}
            </button>

            {/* Font size toggles */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  fontSize === 'sm'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="छोटा फ़ॉन्ट"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  fontSize === 'base'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="सामान्य फ़ॉन्ट"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  fontSize === 'lg'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="बड़ा फ़ॉन्ट"
              >
                A+
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => loadQuestionBank(true)}
              disabled={loading}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
              title="पुनः रीफ्रेश करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        /* Empty state */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs my-4">
          <div className="w-32 h-32 mx-auto">
            <Illustration name="empty" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            कोई प्रश्न नहीं मिला
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}" के लिए कोई मेल खाता प्रश्न नहीं मिला। कृपया दूसरा कीवर्ड खोजें।`
              : `इस विषय में अभी तक कोई प्रश्न लोड नहीं हुआ है। कृपया रीफ्रेश करें या दूसरा विषय चुनें।`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              सर्च फ़िल्टर हटाएं
            </button>
          )}
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>
              कुल {filteredQuestions.length} अद्वितीय प्रश्न प्रदर्शित
            </span>
            {searchQuery && (
              <span className="text-blue-600 dark:text-blue-400">
                सर्च परिणाम: "{searchQuery}"
              </span>
            )}
          </div>

          {filteredQuestions.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            const isBookmarkedItem = bookmarkedSet.has(item.id);
            const isSpeakingThis = speakingId === item.id;
            const isCopiedThis = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Card Header & Question */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  {/* Meta Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                        #{index + 1}
                      </span>

                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.type === 'short'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                        }`}
                      >
                        {item.type === 'short' ? 'लघु उत्तरीय • 2 अंक' : 'दीर्घ उत्तरीय • 5 अंक'}
                      </span>

                      {/* Frequency Badge */}
                      {item.frequency > 1 ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-current" />
                          <span>{item.frequency} बार पूछा गया ({item.years.join(', ')})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          वर्ष: {item.years[0] || 2026}
                        </span>
                      )}
                    </div>

                    {/* Quick Card Actions: Audio, Bookmark, Copy, Share */}
                    <div className="flex items-center gap-1">
                      {/* Audio listen */}
                      <button
                        onClick={() => handleToggleSpeech(item)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isSpeakingThis
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={isSpeakingThis ? 'आवाज़ बंद करें' : 'उत्तर सुनें'}
                      >
                        {isSpeakingThis ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Bookmark */}
                      <button
                        onClick={() => handleToggleBookmark(item)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isBookmarkedItem
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={isBookmarkedItem ? 'सहेजे गए से हटाएं' : 'सहेजें (Bookmark)'}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${isBookmarkedItem ? 'fill-current' : ''}`}
                        />
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopyQuestion(item)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        title="प्रश्न व उत्तर कॉपी करें"
                      >
                        {isCopiedThis ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(item)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        title="शेयर करें"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h3
                    className={`font-black text-slate-900 dark:text-white leading-relaxed ${
                      fontSize === 'sm'
                        ? 'text-xs sm:text-sm'
                        : fontSize === 'lg'
                        ? 'text-base sm:text-lg'
                        : 'text-sm sm:text-base'
                    }`}
                  >
                    {item.question}
                  </h3>

                  {/* Toggle Answer Button */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isExpanded ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>उत्तर छुपाएं</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>मॉडल उत्तर एवं मुख्य बिंदु देखें</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] opacity-70">
                      {isExpanded ? '▲ बंद करें' : '▼ खोलें'}
                    </span>
                  </button>
                </div>

                {/* Answer Area (Expanded) */}
                {isExpanded && (
                  <div className="bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>आधिकारिक मॉडल उत्तर (Step Marking Format):</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.type === 'short' ? '30-50 शब्द' : '150-250 शब्द'}
                      </span>
                    </div>

                    {/* Formatted Answer Body */}
                    <div
                      className={`text-slate-800 dark:text-slate-200 leading-relaxed ${
                        fontSize === 'sm'
                          ? 'text-xs'
                          : fontSize === 'lg'
                          ? 'text-base'
                          : 'text-sm'
                      }`}
                    >
                      <FormattedAnswer text={item.answer} />
                    </div>

                    {/* Paper Appearance References */}
                    {item.paperNames && item.paperNames.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          स्रोतः {item.paperNames.slice(0, 2).join(', ')}
                          {item.paperNames.length > 2 && ` (+${item.paperNames.length - 2} अन्य पेपर्स)`}
                        </span>
                        <button
                          onClick={() => handleCopyQuestion(item)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                        >
                          उत्तर कॉपी करें
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
