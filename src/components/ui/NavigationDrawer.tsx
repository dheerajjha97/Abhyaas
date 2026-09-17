import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  FileText,
  BookOpen,
  Layers,
  Zap,
  Sparkles,
  Bookmark,
  Search,
  Settings2,
  Share2,
  GraduationCap,
  LogOut,
  LogIn,
  ShieldCheck,
  Moon,
  Sun,
  Flame,
  Target,
  ChevronRight,
  ExternalLink,
  BookMarked,
  Bell,
} from 'lucide-react';
import { useDrawer } from '../../context/DrawerContext';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';
import { BrandLogo } from './BrandLogo';

export const NavigationDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const {
    profile,
    currentUser,
    openProfileModal,
    signInWithGoogle,
    signOutUser,
    openLoginPrompt,
  } = useStudentProfile();
  const { progress } = useStudentProgress();
  const { unreadCount } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        localStorage.getItem('abhyaas_theme') === 'dark';
    }
    return false;
  });

  // Sync dark mode class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('abhyaas_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('abhyaas_theme', 'light');
      }
      return next;
    });
  };

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleNavClick = (to: string) => {
    navigate(to);
    closeDrawer();
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'अभ्यास (Abhyaas PYQ)',
          text: 'बिहार बोर्ड 10वीं और 12वीं परीक्षा की बेहतरीन तैयारी - सॉल्व्ड PYQ, चैप्टर नोट्स और फ्री मॉक टेस्ट!',
          url: 'https://abhyaaspyq.in',
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText('https://abhyaaspyq.in');
      alert('लिंक कॉपी हो गया: https://abhyaaspyq.in');
    }
  };

  const navItems = [
    { label: 'होम (Dashboard)', to: '/', icon: Home, badge: 'मुख्य' },
    { label: 'PYQ प्रश्न पत्र', to: '/papers', icon: FileText, badge: 'सॉल्व्ड' },
    { label: 'रिवीजन नोट्स', to: '/notes', icon: BookOpen, badge: 'NCERT' },
    { label: 'पाठ्यक्रम (Syllabus)', to: '/syllabus', icon: Layers, badge: 'ब्लूप्रिंट' },
    { label: 'मॉक टेस्ट जनरेटर', to: '/mock-test', icon: Zap, badge: 'OMR टेस्ट' },
    { label: 'क्विक रिवीजन गाइड', to: '/quick-revision', icon: Sparkles, badge: 'हाईलाइट्स' },
    { label: 'सहेजे गए प्रश्न', to: '/bookmarks', icon: Bookmark, badge: 'बुकमार्क' },
    { label: 'गलती डायरी (Mistakes)', to: '/mistakes', icon: BookMarked, badge: 'रिव्यू' },
    { label: 'सर्च करें (खोजें)', to: '/search', icon: Search, badge: 'खोज' },
    { label: 'सेटिंग्स व अधिक', to: '/more', icon: Settings2, badge: 'About' },
  ];

  const getIsActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside
        className="absolute inset-y-0 left-0 max-w-xs sm:max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-out border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Top Header Card with App Title & Close Button */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white relative shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={36} rounded="rounded-xl" className="border border-white/30 shadow-xs" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight leading-none text-white">
                    Abhyaas
                  </span>
                  <span className="text-[10px] font-bold text-blue-900 bg-white/90 px-1.5 py-0.2 rounded-full shadow-2xs">
                    अभ्यास
                  </span>
                </div>
                <p className="text-[10px] text-blue-100 font-medium mt-0.5">
                  BSEB Board Exam Platform
                </p>
              </div>
            </div>

            <button
              onClick={closeDrawer}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shadow-xs"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Student Profile Card (Clickable to open profile/class modal) */}
          <div
            onClick={() => {
              openProfileModal();
              closeDrawer();
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            title="विद्यार्थी प्रोफाइल व कक्षा बदलें"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center text-lg font-black shadow-xs border-2 border-white/40 shrink-0 overflow-hidden">
                {profile.photoURL || currentUser?.photoURL ? (
                  <img
                    src={profile.photoURL || currentUser?.photoURL}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  profile.avatarEmoji || '🎓'
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold truncate text-white">
                    {profile.name || currentUser?.displayName || 'विद्यार्थी'}
                  </span>
                  {currentUser && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-blue-100 font-medium truncate">
                  कक्षा {profile.classId}वीं {profile.stream ? `• ${profile.stream}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-blue-100 text-[10px] font-bold">
              <span>बदलें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Quick Study Stats Mini-Bar */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-white/15">
            <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-blue-100 leading-none">स्टडी स्ट्रीक</p>
                <p className="text-xs font-black text-white truncate">
                  {progress.studyStreakDays || 1} दिन
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-xl">
              <Target className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-blue-100 leading-none">हल किए प्रश्न</p>
                <p className="text-xs font-black text-white truncate">
                  {progress.totalQuestionsSolved || 0} प्रश्न
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* Main Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-3 mb-1">
              मुख्य सेक्शन (Navigation)
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = getIsActive(item.to);

              return (
                <button
                  key={item.to}
                  onClick={() => handleNavClick(item.to)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions & Preferences */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-3 mb-1">
              सुविधाएं व सेटिंग्स
            </p>

            {/* Study Alerts & Reminders (FCM) */}
            <button
              onClick={() => {
                closeDrawer();
                setIsNotificationOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                <span>स्टडी अलर्ट व रिमाइंडर्स (FCM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    {unreadCount} नए
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>

            {/* Change Class */}
            <button
              onClick={() => {
                openProfileModal();
                closeDrawer();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>कक्षा व संकाय बदलें</span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Class {profile.classId}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                <span>{isDarkMode ? 'लाइट थीम (Light Mode)' : 'डार्क थीम (Dark Mode)'}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {isDarkMode ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Share App */}
            <button
              onClick={handleShareApp}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>ऐप शेयर करें (Share App)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Firebase Google Login / Logout */}
            {currentUser ? (
              <div className="mt-2 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-white shrink-0 shadow-2xs">
                    {currentUser.photoURL || profile.photoURL ? (
                      <img
                        src={currentUser.photoURL || profile.photoURL}
                        alt={currentUser.displayName || 'Google Profile'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-700 font-bold text-sm bg-emerald-100">
                        {profile.avatarEmoji || '🎓'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 truncate">
                        {currentUser.displayName || profile.name || 'Google Account'}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await signOutUser();
                    closeDrawer();
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>साइन आउट (Sign Out)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  closeDrawer();
                  openLoginPrompt();
                }}
                className="w-full mt-2 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/90 dark:border-blue-900 flex items-center justify-between text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Google साइन-इन (क्लाउड बैकअप)</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </button>
            )}
          </div>
        </div>

        {/* Footer branding with custom domain */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">
            अभ्यास (Abhyaas PYQ) v2.5
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            abhyaaspyq.in • www.abhyaaspyq.in
          </p>
        </div>
      </aside>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};
