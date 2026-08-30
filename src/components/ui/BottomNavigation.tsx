import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, Bookmark, MoreHorizontal, Search } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';

export const BottomNavigation: React.FC = () => {
  const { profile } = useStudentProfile();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: `/class/${profile.classId || '12'}/subjects`, label: 'Practice', icon: GraduationCap },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/bookmarks', label: 'Saved', icon: Bookmark },
    { to: '/more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto pb-safe">
      <div className="mx-3 mb-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800 shadow-2xl rounded-3xl p-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-bold scale-105 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 opacity-60 hover:opacity-100 hover:bg-white/40 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
