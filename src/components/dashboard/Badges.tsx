import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { VirtualBadge, evaluateStudentBadges, BadgeTier, BadgeCategory } from '../../types/badge';
import {
  Flame,
  Crown,
  Zap,
  Target,
  Star,
  BookOpen,
  Trophy,
  Clock,
  Lock,
  CheckCircle2,
  Award,
  Sparkles,
  X,
  Play,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BadgesProps {
  compact?: boolean;
  onViewAll?: () => void;
  defaultExpanded?: boolean;
}

const TIER_COLORS: Record<
  BadgeTier,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    label: string;
    labelHi: string;
  }
> = {
  bronze: {
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    border: 'border-amber-200/80 dark:border-amber-900/60',
    text: 'text-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-800 dark:text-amber-200',
    label: 'Bronze',
    labelHi: 'कांस्य',
  },
  silver: {
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-300/80 dark:border-slate-700',
    text: 'text-slate-800 dark:text-slate-200',
    badgeBg: 'bg-slate-200 dark:bg-slate-700',
    badgeText: 'text-slate-800 dark:text-slate-200',
    label: 'Silver',
    labelHi: 'रजत',
  },
  gold: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-200',
    badgeBg: 'bg-amber-200 dark:bg-amber-800/70',
    badgeText: 'text-amber-900 dark:text-amber-100',
    label: 'Gold',
    labelHi: 'स्वर्ण',
  },
  diamond: {
    bg: 'bg-blue-50/70 dark:bg-blue-950/30',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-200',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
    badgeText: 'text-blue-800 dark:text-blue-200',
    label: 'Diamond',
    labelHi: 'डायमंड',
  },
};

export const Badges: React.FC<BadgesProps> = ({
  compact = false,
  onViewAll,
  defaultExpanded = false,
}) => {
  const navigate = useNavigate();
  const { progress } = useStudentProgress();
  const { profile } = useStudentProfile();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedBadge, setSelectedBadge] = useState<VirtualBadge | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Evaluate badges based on active StudentProgressData from Firestore
  const allBadges = useMemo(() => {
    return evaluateStudentBadges(progress);
  }, [progress]);

  const unlockedCount = useMemo(() => {
    return allBadges.filter((b) => b.isUnlocked).length;
  }, [allBadges]);

  const filteredBadges = useMemo(() => {
    if (filterCategory === 'unlocked') return allBadges.filter((b) => b.isUnlocked);
    if (filterCategory === 'locked') return allBadges.filter((b) => !b.isUnlocked);
    return allBadges;
  }, [allBadges, filterCategory]);

  const renderBadgeIcon = (iconName: VirtualBadge['iconName'], isUnlocked: boolean, className: string = 'w-6 h-6') => {
    const props = { className };
    switch (iconName) {
      case 'Flame':
        return <Flame {...props} className={`${className} ${isUnlocked ? 'fill-amber-500 text-amber-500 animate-pulse' : 'text-slate-400'}`} />;
      case 'Crown':
        return <Crown {...props} className={`${className} ${isUnlocked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />;
      case 'Zap':
        return <Zap {...props} className={`${className} ${isUnlocked ? 'fill-blue-500 text-blue-500' : 'text-slate-400'}`} />;
      case 'Target':
        return <Target {...props} className={`${className} ${isUnlocked ? 'text-rose-500' : 'text-slate-400'}`} />;
      case 'Star':
        return <Star {...props} className={`${className} ${isUnlocked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />;
      case 'BookOpen':
        return <BookOpen {...props} className={`${className} ${isUnlocked ? 'text-emerald-500' : 'text-slate-400'}`} />;
      case 'Trophy':
        return <Trophy {...props} className={`${className} ${isUnlocked ? 'fill-amber-400 text-amber-600' : 'text-slate-400'}`} />;
      case 'Clock':
        return <Clock {...props} className={`${className} ${isUnlocked ? 'text-indigo-500' : 'text-slate-400'}`} />;
      default:
        return <Award {...props} className={`${className} ${isUnlocked ? 'text-blue-500' : 'text-slate-400'}`} />;
    }
  };

  // Compact Mode (for Home Overview card snippet)
  if (compact) {
    const topBadges = allBadges.slice(0, 4);
    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              अर्जित वर्चुअल बैज (Badges)
            </span>
            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {unlockedCount} / {allBadges.length} अनलॉक
            </span>
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>सभी देखें</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Compact Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {topBadges.map((badge) => {
            const tierStyle = TIER_COLORS[badge.tier];
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  badge.isUnlocked
                    ? `${tierStyle.bg} ${tierStyle.border}`
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg border ${
                    badge.isUnlocked
                      ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-700 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {badge.isUnlocked ? badge.emoji : <Lock className="w-4 h-4 text-slate-400" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate">
                    {badge.name}
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {badge.isUnlocked ? '✓ ' + badge.nameHi : badge.statusText}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal for badge inspection */}
        {selectedBadge && (
          <BadgeDetailModal
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
            onTakeTest={() => {
              setSelectedBadge(null);
              navigate('/mock-test');
            }}
          />
        )}
      </div>
    );
  }

  // Full Mode - Rendered as a single cohesive collapsible card containing all achievements
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-all">
      {/* Clickable Header for Collapsing / Expanding */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-850/50 select-none transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
              <span>वर्चुअल बैज एवं उपलब्धियां</span>
              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                {unlockedCount} / {allBadges.length} अर्जित
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isExpanded
                ? 'मॉक टेस्ट, स्ट्रीक और अभ्यास से मेडल अनलॉक करें'
                : `${Math.round((unlockedCount / allBadges.length) * 100)}% बैज पूर्ण • क्लिक करके देखें`}
            </p>
          </div>
        </div>

        {/* Right Controls: Mini Progress Pill + Collapse Toggle Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isExpanded && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {Math.round((unlockedCount / allBadges.length) * 100)}% पूर्ण
              </span>
              <div className="w-14 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-amber-500 h-full rounded-full"
                  style={{ width: `${Math.round((unlockedCount / allBadges.length) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200/80 dark:border-slate-700/80">
            <span>{isExpanded ? 'समेटें' : 'देखें'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Collapsible Content Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="badges-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800/80">
              {/* Quick Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-3">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  उपलब्धि फ़िल्टर:
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterCategory === 'all'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    सभी ({allBadges.length})
                  </button>
                  <button
                    onClick={() => setFilterCategory('unlocked')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterCategory === 'unlocked'
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    अनलॉक ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setFilterCategory('locked')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      filterCategory === 'locked'
                        ? 'bg-slate-700 text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    प्रगति पर ({allBadges.length - unlockedCount})
                  </button>
                </div>
              </div>

              {/* Single Overall Progress Bar */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-850/60 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>कुल बैज उपलब्धि दर</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">
                    {Math.round((unlockedCount / allBadges.length) * 100)}% पूर्ण
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 h-full rounded-full transition-all duration-500 shadow-2xs"
                    style={{ width: `${Math.round((unlockedCount / allBadges.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Badges Shelf: Clean, unified row items inside this single card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
                {filteredBadges.map((badge) => {
                  const tierStyle = TIER_COLORS[badge.tier];
                  return (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none group ${
                        badge.isUnlocked
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 shadow-2xs'
                          : 'bg-slate-50/70 dark:bg-slate-850/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {/* Left: Tile + Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border relative ${
                            badge.isUnlocked
                              ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 shadow-2xs'
                              : 'bg-slate-200/70 dark:bg-slate-800 border-slate-300/70 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {badge.isUnlocked ? (
                            <>
                              <span>{badge.emoji}</span>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black border border-white dark:border-slate-900 shadow-2xs">
                                ✓
                              </div>
                            </>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate leading-tight">
                              {badge.name}
                            </h5>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              ({badge.nameHi})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${tierStyle.badgeBg} ${tierStyle.badgeText} border-slate-200/60 dark:border-slate-700`}
                            >
                              {tierStyle.labelHi}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                              {badge.criteriaTextHi}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill, mini progress & chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        {badge.isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
                            अनलॉक ✓
                          </span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                              {badge.progressPercent}%
                            </span>
                            <div className="w-14 sm:w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${badge.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
          onTakeTest={() => {
            setSelectedBadge(null);
            navigate('/mock-test');
          }}
        />
      )}
    </div>
  );
};

interface BadgeDetailModalProps {
  badge: VirtualBadge;
  onClose: () => void;
  onTakeTest: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose, onTakeTest }) => {
  const tierStyle = TIER_COLORS[badge.tier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Hero Visual */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-block">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl border-2 ${
                badge.isUnlocked
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/60 dark:to-amber-900/40 border-amber-400 dark:border-amber-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              {badge.isUnlocked ? badge.emoji : <Lock className="w-8 h-8 text-slate-400" />}
            </div>

            {badge.isUnlocked && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs border-2 border-white dark:border-slate-900">
                ✓
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {tierStyle.labelHi} श्रेणी ({tierStyle.label} Tier)
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {badge.name}
            </h3>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {badge.nameHi}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div
          className={`p-3.5 rounded-2xl border ${
            badge.isUnlocked
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5">
              {badge.isUnlocked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span>{badge.isUnlocked ? 'उपलब्धि हासिल की गई!' : 'अनलॉक की प्रगति'}</span>
            </span>
            <span className="font-black text-blue-600 dark:text-blue-400">
              {badge.isUnlocked ? '100%' : `${badge.progressPercent}%`}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {badge.descriptionHi}
          </p>

          {!badge.isUnlocked && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2.5">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${badge.progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Criteria Info */}
        <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="font-bold text-slate-700 dark:text-slate-300">अनलॉक करने की शर्त:</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            • {badge.criteriaTextHi} ({badge.criteriaText})
          </div>
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
            वर्तमान स्थिति: <span className="text-blue-600 dark:text-blue-400">{badge.statusText}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {badge.isUnlocked ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs active:scale-[0.98] cursor-pointer transition-all"
            >
              शानदार! जारी रखें
            </button>
          ) : (
            <button
              onClick={onTakeTest}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>मॉक टेस्ट देकर बैज अनलॉक करें</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
