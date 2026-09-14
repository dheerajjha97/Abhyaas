import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useDrawer } from '../../context/DrawerContext';
import { useStudentProfile } from '../../context/StudentProfileContext';

export const MobileTopBar: React.FC = () => {
  const { openDrawer } = useDrawer();
  const { profile, openProfileModal, currentUser } = useStudentProfile();
  const navigate = useNavigate();

  return (
    <header className="md:hidden sticky top-0 z-30 w-full mb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 px-3 py-2 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Left: ☰ Menu Button + Brand Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={openDrawer}
            aria-label="मेनू खोलें (Open Navigation Menu)"
            title="मेनू खोलें"
            className="p-2 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 active:scale-95 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700 shrink-0 shadow-2xs flex items-center justify-center"
          >
            <Menu className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 min-w-0 text-left cursor-pointer focus-visible:outline-none"
          >
            <BrandLogo size={32} rounded="rounded-xl" className="border border-slate-200/80 dark:border-slate-700 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Abhyaas
                </span>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.2 rounded-full border border-blue-200/60 dark:border-blue-800 leading-none">
                  अभ्यास
                </span>
              </div>
              <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-400 truncate mt-0.5">
                Class {profile.classId} {profile.stream ? `• ${profile.stream}` : ''}
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions: Quick Search & Profile / Class Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigate('/search')}
            aria-label="खोजें (Search)"
            title="खोजें"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={openProfileModal}
            aria-label="प्रोफाइल व कक्षा बदलें"
            title="प्रोफाइल व कक्षा बदलें"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 transition-all cursor-pointer text-xs font-bold shadow-2xs"
          >
            <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 shrink-0">
              {profile.photoURL || currentUser?.photoURL ? (
                <img
                  src={profile.photoURL || currentUser?.photoURL}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs leading-none">{profile.avatarEmoji || '🎓'}</span>
              )}
            </div>
            <span className="text-[11px] font-black">{profile.classId}th</span>
          </button>
        </div>
      </div>
    </header>
  );
};
