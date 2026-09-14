import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { useDrawer } from '../../context/DrawerContext';
import { BrandLogo } from './BrandLogo';
import {
  Menu,
  Home,
  FileText,
  Zap,
  BookOpen,
  Layers,
  Bookmark,
  Search,
  Settings2,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface DesktopNavItem {
  id: string;
  label: string;
  to: string;
  icon: React.ElementType;
}

export const DesktopNavbar: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, openProfileModal, currentUser } = useStudentProfile();
  const { openDrawer } = useDrawer();

  const navItems: DesktopNavItem[] = [
    { id: 'home', label: 'होम', to: '/', icon: Home },
    { id: 'papers', label: 'पेपर्स', to: '/papers', icon: FileText },
    { id: 'revision', label: 'रिवीज़न गाइड', to: '/quick-revision', icon: Sparkles },
    { id: 'test', label: 'मॉक टेस्ट', to: '/mock-test', icon: Zap },
    { id: 'notes', label: 'नोट्स', to: '/notes', icon: BookOpen },
    { id: 'syllabus', label: 'पाठ्यक्रम', to: '/syllabus', icon: Layers },
    { id: 'bookmarks', label: 'सहेजे गए', to: '/bookmarks', icon: Bookmark },
    { id: 'mistakes', label: 'गलती डायरी', to: '/mistakes', icon: BookOpen },
    { id: 'search', label: 'खोज', to: '/search', icon: Search },
  ];

  const getIsActive = (item: DesktopNavItem) => {
    if (item.to === '/') {
      return pathname === '/';
    }
    if (item.id === 'papers') {
      return (
        pathname === '/papers' ||
        (pathname.startsWith('/class/') && pathname.includes('/papers')) ||
        pathname.startsWith('/paper/')
      );
    }
    if (item.id === 'notes') {
      return (
        pathname.startsWith('/notes') ||
        (pathname.startsWith('/class/') && pathname.includes('/notes'))
      );
    }
    if (item.id === 'syllabus') {
      return (
        pathname.startsWith('/syllabus') ||
        (pathname.startsWith('/class/') && pathname.includes('/syllabus'))
      );
    }
    if (item.id === 'test') {
      return pathname.startsWith('/mock-test');
    }
    return pathname.startsWith(item.to);
  };

  return (
    <header className="hidden md:flex w-full items-center justify-between py-2.5 sm:py-3 px-3.5 sm:px-4 mb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs sticky top-2 z-40 transition-all">
      {/* Brand Logo & Class Badge */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={openDrawer}
          aria-label="मेनू खोलें (Open Menu)"
          title="साइड मेनू खोलें"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 active:scale-95 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shadow-2xs"
        >
          <Menu className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <NavLink
          to="/"
          className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none"
        >
          <BrandLogo
            size={38}
            rounded="rounded-xl"
            className="border border-slate-200/60 dark:border-slate-700 transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Abhyaas
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800">
                अभ्यास
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              BSEB Board Exam Prep Platform
            </p>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = getIsActive(item);

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                active
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Right Controls: Student Profile Pill & Settings */}
      <div className="flex items-center gap-2">
        {/* Student Profile Quick Switcher Button */}
        <button
          onClick={openProfileModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer group"
          title="विद्यार्थी प्रोफ़ाइल व कक्षा बदलें"
        >
          <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center bg-blue-50 dark:bg-blue-950/60 border border-slate-200 dark:border-slate-700 shrink-0">
            {profile.photoURL || currentUser?.photoURL ? (
              <img
                src={profile.photoURL || currentUser?.photoURL}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-sm group-hover:scale-110 transition-transform">
                {profile.avatarEmoji || '🎓'}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight max-w-[110px] truncate">
              {profile.name || currentUser?.displayName || 'विद्यार्थी'}
            </div>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 leading-none">
              Class {profile.classId} {profile.stream ? `• ${profile.stream}` : ''}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
        </button>

        {/* More Settings */}
        <button
          onClick={() => navigate('/more')}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/70 dark:border-slate-700"
          title="अधिक विकल्प व सेटिंग्स"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
