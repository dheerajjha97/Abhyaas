import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentProfile } from '../context/StudentProfileContext';
import { HeaderBar } from '../components/ui/HeaderBar';
import { Toast, ToastMessage } from '../components/ui/Toast';
import {
  generateQuickRevisionGuide,
  QuickRevisionGuide,
  Flashcard,
  HighYieldQuestion,
} from '../services/revisionService';
import { normalizeSubject } from '../services/questionRepository';
import { FormattedAnswer } from '../components/ui/FormattedAnswer';
import { shareQuickRevisionQuestion } from '../utils/shareUtils';
import { SecurityWatermark } from '../components/security/ContentProtection';
import {
  Zap,
  Flame,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Sparkles,
  Volume2,
  VolumeX,
  Shuffle,
  Eye,
  EyeOff,
  Award,
  Layers,
  HelpCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

export const QuickRevision: React.FC = () => {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const navigate = useNavigate();
  const { profile } = useStudentProfile();

  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjectId ? decodeURIComponent(subjectId) : profile.selectedSubjects[0] || 'Political Science'
  );

  const [activeTab, setActiveTab] = useState<'flashcards' | 'high_yield' | 'chapters' | 'long_answers'>('flashcards');
  const [guide, setGuide] = useState<QuickRevisionGuide | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set<string>());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // High Yield filter
  const [filterMarks, setFilterMarks] = useState<'all' | '5' | '2' | '1'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set<string>());

  // Chapter accordion
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set<string>(['ch-1']));

  // Load guide data on subject or class change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setCardIndex(0);
    setIsFlipped(false);

    generateQuickRevisionGuide(profile.classId, selectedSubject)
      .then((data) => {
        if (isMounted) {
          setGuide(data);
          setLoading(false);
          // Auto expand first chapter
          if (data.chapters.length > 0) {
            setExpandedChapters(new Set([data.chapters[0].chapterId]));
          }
        }
      })
      .catch((err) => {
        console.error('Error generating revision guide:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [profile.classId, selectedSubject]);

  // Load mastered cards from localStorage
  useEffect(() => {
    const storageKey = `abhyaas_mastered_cards_${profile.classId}_${selectedSubject}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMasteredCards(new Set<string>(JSON.parse(saved)));
      } else {
        setMasteredCards(new Set<string>());
      }
    } catch {
      setMasteredCards(new Set<string>());
    }
  }, [profile.classId, selectedSubject]);

  const saveMasteredState = (newSet: Set<string>) => {
    setMasteredCards(newSet);
    const storageKey = `abhyaas_mastered_cards_${profile.classId}_${selectedSubject}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
    } catch {}
  };

  const handleToggleMastered = (cardId: string) => {
    const next = new Set<string>(masteredCards);
    if (next.has(cardId)) {
      next.delete(cardId);
      setToast({ id: Date.now().toString(), type: 'info', message: 'कार्ड को पुन: अभ्यास सूची में डाला गया' });
    } else {
      next.add(cardId);
      setToast({ id: Date.now().toString(), type: 'success', message: 'शाबाश! यह कार्ड याद हो गया (Mastered) ⭐' });
    }
    saveMasteredState(next);
  };

  const handleNextCard = () => {
    if (!guide || guide.flashcards.length === 0) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % guide.flashcards.length);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handlePrevCard = () => {
    if (!guide || guide.flashcards.length === 0) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + guide.flashcards.length) % guide.flashcards.length);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleShuffleCards = () => {
    if (!guide) return;
    const shuffled = [...guide.flashcards].sort(() => Math.random() - 0.5);
    setGuide({ ...guide, flashcards: shuffled });
    setCardIndex(0);
    setIsFlipped(false);
    setToast({ id: Date.now().toString(), type: 'info', message: 'कार्ड्स को शफ़ल (Shuffle) कर दिया गया' });
  };

  const handleSpeakCard = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setToast({ id: Date.now().toString(), type: 'error', message: 'ऑडियो सुविधा आपके ब्राउज़र में उपलब्ध नहीं है' });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleExpandQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleExpandChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShareQuestion = async (q: HighYieldQuestion) => {
    const result = await shareQuickRevisionQuestion({
      subject: selectedSubject,
      classId: profile.classId,
      question: q.question,
      answer: q.answer,
      marks: q.marks,
      subjectId,
    });

    if (result.success) {
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: result.method === 'native' ? 'प्रश्न व ऐप लिंक शेयर किया गया!' : 'प्रश्न व ऐप लिंक कॉपी हो गया!',
      });
    }
  };

  const currentCard: Flashcard | undefined = guide?.flashcards[cardIndex];

  const filteredHighYield = guide?.highYieldQuestions.filter((q) => {
    if (filterMarks === 'all') return true;
    if (filterMarks === '5') return q.marks === 5;
    if (filterMarks === '2') return q.marks === 2;
    if (filterMarks === '1') return q.marks === 1;
    return true;
  }) || [];

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Bar */}
      <HeaderBar
        title="Quick Revision Guide"
        subtitle={`Class ${profile.classId} • ${selectedSubject} • अंतिम समय की त्वरित तैयारी`}
      />

      {/* Subject Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 sm:p-3 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {profile.selectedSubjects.map((sub) => {
            const isSelected = normalizeSubject(selectedSubject).toLowerCase() === normalizeSubject(sub).toLowerCase();
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {selectedSubject} के सभी पेपर्स से त्वरित रिवीज़न गाइड तैयार हो रही है...
          </p>
          <p className="text-xs text-slate-400">महत्वपूर्ण प्रश्नों का संकलन व फ्लैशकार्ड्स जनरेट हो रहे हैं</p>
        </div>
      ) : guide ? (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">पेपर्स विश्लेषित</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{guide.totalPapersAnalyzed}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">मुख्य प्रश्न</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{guide.highYieldQuestions.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">रिवीज़न कार्ड्स</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{guide.flashcards.length}</span>
            </div>
          </div>

          {/* Navigation Mode Segmented Tabs */}
          <div className="bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-1">
            {[
              { id: 'flashcards', label: 'स्मरण कार्ड (Cards)', icon: Zap },
              { id: 'high_yield', label: 'टॉप प्रश्न (Top Qs)', icon: Flame },
              { id: 'chapters', label: 'अध्याय-वार (Chapters)', icon: Layers },
              { id: 'long_answers', label: '5-अंक रूपरेखा (5 Marks)', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: INTERACTIVE FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-3">
              {/* Flashcard Header Controls */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">
                  कार्ड {cardIndex + 1} / {guide.flashcards.length}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
                    ⭐ {masteredCards.size} याद हो गए
                  </span>
                  <button
                    onClick={handleShuffleCards}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="कार्ड्स शफ़ल करें"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* The Interactive Flip Card */}
              {currentCard && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[260px] sm:min-h-[300px] p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                    isFlipped
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentCard.topic}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900">
                        {currentCard.marks} अंक • {currentCard.year}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeakCard(isFlipped ? currentCard.back : currentCard.front);
                        }}
                        className={`p-1 rounded-lg cursor-pointer ${
                          isSpeaking ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                        title="सुनें (Read Aloud)"
                      >
                        {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Card Center Content */}
                  <div className="py-4 my-auto max-h-[380px] sm:max-h-[460px] overflow-y-auto pr-1">
                    {!isFlipped ? (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          <HelpCircle className="w-3.5 h-3.5" /> प्रश्न / संकल्पना (Tap to Reveal Answer)
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {currentCard.front}
                        </h3>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 sticky top-0 bg-blue-50/90 dark:bg-blue-950/90 py-0.5 z-10">
                          <CheckCircle2 className="w-3.5 h-3.5" /> आदर्श उत्तर / मुख्य बिंदु (Model Answer)
                        </div>
                        <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                          {currentCard.back}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      {isFlipped ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isFlipped ? 'टैप करके प्रश्न देखें' : 'टैप करके उत्तर देखें'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMastered(currentCard.id);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 border ${
                        masteredCards.has(currentCard.id)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{masteredCards.has(currentCard.id) ? 'याद है (Mastered)' : 'याद हो गया?'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Previous / Next Navigation Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handlePrevCard}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला कार्ड (Prev)</span>
                </button>
                <button
                  onClick={handleNextCard}
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                >
                  <span>अगला कार्ड (Next)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TOP HIGH-YIELD QUESTIONS */}
          {activeTab === 'high_yield' && (
            <div className="space-y-3">
              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'सभी प्रश्न' },
                  { id: '5', label: '🔥 5-अंक दीर्घ उत्तरीय' },
                  { id: '2', label: '⚡ 2-अंक लघु उत्तरीय' },
                  { id: '1', label: '🎯 1-अंक वस्तुनिष्ठ' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setFilterMarks(chip.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      filterMarks === chip.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-2.5">
                {filteredHighYield.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border text-center text-slate-500 text-xs">
                    इस फ़िल्टर के लिए कोई प्रश्न नहीं मिला।
                  </div>
                ) : (
                  filteredHighYield.map((q, idx) => {
                    const isExpanded = expandedQuestions.has(q.id);
                    return (
                      <div
                        key={q.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => handleToggleExpandQuestion(q.id)}
                          className="p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                                Q{idx + 1} • {q.marks} अंक
                              </span>
                              {q.repeatCount >= 2 && (
                                <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-rose-600" /> {q.repeatCount} बार पूछा गया ({q.years.join(', ')})
                                </span>
                              )}
                              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {q.topic}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                              {q.question}
                            </h4>
                          </div>

                          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0">
                            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-blue-600" />}
                          </button>
                        </div>

                        {/* Expandable Model Answer */}
                        {isExpanded && (
                          <div className="px-3.5 sm:px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                📖 आदर्श उत्तर (Model Answer):
                              </span>
                              <div className="pt-1">
                                <FormattedAnswer content={q.answer} fontSize="sm" />
                              </div>
                            </div>

                            {/* Key Takeaway Bullets */}
                            {q.keyPoints && q.keyPoints.length > 0 && (
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
                                  ⭐ मुख्य बिंदु (Exam Key Points):
                                </span>
                                <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                                  {q.keyPoints.map((pt, pidx) => (
                                    <li key={pidx}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Share button */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleShareQuestion(q)}
                                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>शेयर करें</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHAPTER-WISE REVISION SUMMARIES */}
          {activeTab === 'chapters' && (
            <div className="space-y-3">
              {guide.chapters.map((ch) => {
                const isExpanded = expandedChapters.has(ch.chapterId);
                return (
                  <div
                    key={ch.chapterId}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden"
                  >
                    <div
                      onClick={() => handleToggleExpandChapter(ch.chapterId)}
                      className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                            Unit {ch.chapterNumber}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                            वेटेज: {ch.weightage}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {ch.chapterTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ch.questions.length} महत्वपूर्ण प्रश्न • {ch.keyTakeaways.length} मुख्य संकल्पनाएं
                        </p>
                      </div>

                      <button className="p-1 text-slate-400">
                        <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90 text-blue-600' : ''}`} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                        {/* Key takeaways */}
                        {ch.keyTakeaways.length > 0 && (
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> इस इकाई के मुख्य बिंदु (Quick Takeaways):
                            </span>
                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                              {ch.keyTakeaways.map((takeaway, tidx) => (
                                <li key={tidx}>{takeaway}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Chapter Questions */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            पूछे गए प्रश्न ({ch.questions.length}):
                          </span>
                          {ch.questions.map((cq, cqidx) => (
                            <div key={cq.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span className="text-blue-600">{cq.marks} अंक ({cq.years.join(', ')})</span>
                                <button
                                  onClick={() => handleShareQuestion(cq)}
                                  className="text-slate-400 hover:text-blue-600 flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" /> शेयर
                                </button>
                              </div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{cq.question}</p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{cq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: 5-MARK LONG ANSWER FRAMEWORKS */}
          {activeTab === 'long_answers' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 space-y-1">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" /> 5 अंक वाले प्रश्नों में पूरे अंक कैसे प्राप्त करें?
                </h4>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-200 leading-relaxed">
                  दीर्घ उत्तरीय प्रश्नों में पैराग्राफ लिखने के बजाय <strong>मुख्य हेडिंग्स और बुलेट पॉइंट्स</strong> बनाएं। नीचे दिए गए महत्वपूर्ण प्रश्नों की रूपरेखा देखें:
                </p>
              </div>

              <div className="space-y-3">
                {guide.top5MarkFormulasOrPoints.map((framework, fidx) => (
                  <div
                    key={fidx}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-md">
                        5 MARKS
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {framework.sampleQuestion}
                      </h4>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                        📝 उत्तर लिखने की आदर्श रूपरेखा (Answer Structure):
                      </span>
                      <div className="space-y-1.5">
                        {framework.points.map((pt, pidx) => (
                          <div key={pidx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                            <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {pidx + 1}
                            </span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
