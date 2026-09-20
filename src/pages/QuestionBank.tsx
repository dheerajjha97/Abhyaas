import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormattedAnswer } from '../components/ui/FormattedAnswer';
import { SecurityWatermark } from '../components/security/ContentProtection';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import {
  getQuestionBankForSubject,
  QuestionBankItem,
} from '../services/questionBankService';
import { useStudentProfile } from '../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS } from '../types/studentProfile';
import { saveBookmark, removeBookmark, isBookmarked } from '../utils/bookmarkStorage';
import { shareToSocial } from '../utils/shareUtils';
import { QuestionBankHeader } from '../components/questionBank/QuestionBankHeader';
import { QuestionBankHero } from '../components/questionBank/QuestionBankHero';
import { QuestionStats } from '../components/questionBank/QuestionStats';
import { SubjectSelector } from '../components/questionBank/SubjectSelector';
import { QuestionSearch } from '../components/questionBank/QuestionSearch';
import {
  QuestionTypeFilters,
  QuestionFilterType,
} from '../components/questionBank/QuestionTypeFilters';
import { QuestionControls } from '../components/questionBank/QuestionControls';
import {
  Bookmark,
  Volume2,
  VolumeX,
  Copy,
  CheckCheck,
  Share2,
  Sparkles,
  Flame,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const navigate = useNavigate();
  const { profile } = useStudentProfile();

  // Selected Class from profile (Already known from previous state - NO class switcher on this page)
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
  const [typeFilter, setTypeFilter] = useState<QuestionFilterType>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
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
          message: 'प्रश्न लोड करने में समस्या आई। कृपया पुनः प्रयास करें।',
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

  // Repeated questions count
  const repeatedQuestions = useMemo(() => {
    return allQuestions.filter((q) => q.isRepeated);
  }, [allQuestions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    let list = allQuestions;

    if (typeFilter === 'short') {
      list = shortQuestions;
    } else if (typeFilter === 'long') {
      list = longQuestions;
    } else if (typeFilter === 'repeated') {
      list = repeatedQuestions;
    }

    if (onlyBookmarked) {
      list = list.filter((q) => bookmarkedSet.has(q.id));
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.years.some((y) => y.toString().includes(query))
    );
  }, [
    allQuestions,
    shortQuestions,
    longQuestions,
    repeatedQuestions,
    typeFilter,
    onlyBookmarked,
    bookmarkedSet,
    searchQuery,
  ]);

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
    const textToCopy =
      `📌 [${item.subject} • ${item.type === 'short' ? 'लघु उत्तरीय (2 अंक)' : 'दीर्घ उत्तरीय (5 अंक)'}]\n` +
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
    const cleanAnswer = item.answer.replace(/[#*]/g, '').slice(0, 800);
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
    const text =
      `📖 *${item.subject} - महत्वपूर्ण ${item.type === 'short' ? 'लघु' : 'दीर्घ'} उत्तरीय प्रश्न*\n\n` +
      `❓ *प्रश्न:* ${item.question}\n` +
      `🎯 *बोर्ड परीक्षा:* ${item.years.join(', ')} (${item.frequency} बार रिपीटेड)\n\n` +
      `💡 *मॉडल उत्तर:* ${item.answer.slice(0, 200)}...\n\n` +
      `📲 पूरा उत्तर पढ़ने के लिए अभ्यास ऐप देखें:`;

    await shareToSocial({
      title: `${item.subject} बोर्ड प्रश्नोत्तर`,
      text,
    });
  };

  const activeSubjectObj = availableSubjects.find(
    (s) => s.name.toLowerCase() === activeSubject.toLowerCase()
  );

  const activeFilterCount = (onlyBookmarked ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-28 animate-in fade-in max-w-4xl mx-auto px-1 sm:px-2">
      <SecurityWatermark />
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* 1. TOP HEADER */}
      <QuestionBankHeader
        title="Question Bank"
        subtitle="विषयवार प्रश्न बैंक"
        onBack={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
      />

      {/* 2. HERO SECTION */}
      <QuestionBankHero
        selectedClass={selectedClass}
        subjectName={activeSubject}
        subjectHindiName={activeSubjectObj?.hindiName || activeSubject}
        shortCount={shortQuestions.length}
        longCount={longQuestions.length}
        repeatedCount={repeatedQuestions.length}
      />

      {/* 3. SUMMARY STATISTICS */}
      <QuestionStats
        totalCount={allQuestions.length}
        shortCount={shortQuestions.length}
        longCount={longQuestions.length}
      />

      {/* 4. SUBJECT SELECTION (NO CLASS SWITCHER) */}
      <SubjectSelector
        subjects={availableSubjects}
        activeSubject={activeSubject}
        onSelectSubject={handleSelectSubject}
      />

      {/* 5. SEARCH + QUESTION FILTER AREA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search Input */}
        <QuestionSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          subjectName={activeSubjectObj?.hindiName || activeSubject}
        />

        {/* Filter Chips / Cards */}
        <QuestionTypeFilters
          activeFilter={typeFilter}
          onFilterChange={setTypeFilter}
          totalCount={allQuestions.length}
          shortCount={shortQuestions.length}
          longCount={longQuestions.length}
          repeatedCount={repeatedQuestions.length}
        />

        {/* 6. CONTROL ROW */}
        <QuestionControls
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onToggleFilterModal={() => setShowFilterDrawer((prev) => !prev)}
          onRefresh={() => loadQuestionBank(true)}
          isRefreshing={loading}
          activeFilterCount={activeFilterCount}
        />

        {/* Interactive Filter Drawer / Sheet (when 'फ़िल्टर' is clicked) */}
        {showFilterDrawer && (
          <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setOnlyBookmarked((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  onlyBookmarked
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>केवल बुकमार्क किए गए ({bookmarkedSet.size})</span>
              </button>

              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {expandedIds.size > 0 ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>सभी उत्तर समेटें</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>सभी उत्तर खोलें</span>
                  </>
                )}
              </button>
            </div>

            {(onlyBookmarked || typeFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setOnlyBookmarked(false);
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                फ़िल्टर रीसेट करें
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-3"
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
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs my-4">
          <div className="w-28 h-28 mx-auto">
            <Illustration name="empty" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            कोई प्रश्न नहीं मिला
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}" के लिए कोई मेल खाता प्रश्न नहीं मिला। कृपया दूसरा कीवर्ड खोजें।`
              : onlyBookmarked
              ? 'इस विषय में आपने अभी तक कोई प्रश्न बुकमार्क नहीं किया है।'
              : `इस विषय में अभी तक कोई प्रश्न लोड नहीं हुआ है। कृपया रीफ्रेश करें या दूसरा विषय चुनें।`}
          </p>
          {(searchQuery || onlyBookmarked || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setOnlyBookmarked(false);
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              सभी फ़िल्टर हटाएं
            </button>
          )}
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>
              कुल <span className="text-slate-900 dark:text-white font-black">{filteredQuestions.length}</span> अद्वितीय प्रश्न उपलब्ध
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
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        {item.type === 'short' ? 'लघु उत्तरीय • 2 अंक' : 'दीर्घ उत्तरीय • 5 अंक'}
                      </span>

                      {/* Frequency Badge */}
                      {item.frequency > 1 ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
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
                        aria-label={isSpeakingThis ? 'आवाज़ बंद करें' : 'उत्तर सुनें'}
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
                        aria-label={isBookmarkedItem ? 'सहेजे गए से हटाएं' : 'सहेजें'}
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
                        aria-label="प्रश्न व उत्तर कॉपी करें"
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
                        aria-label="शेयर करें"
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
