import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, Zap, Bookmark, MoreHorizontal } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';

export const BottomNavigation: React.FC = () => {
  const { profile } = useStudentProfile();

  const navItems = [
    { to: '/', label: 'होम (Home)', icon: Home },
    { to: `/class/${profile.classId || '12'}/subjects`, label: 'विषय (Subjects)', icon: GraduationCap },
    { to: '/mock-test', label: 'मॉक टेस्ट (Test)', icon: Zap, highlight: true },
    { to: '/bookmarks', label: 'सहेजे गए (Saved)', icon: Bookmark },
    { to: '/more', label: 'अधिक (More)', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md sm:max-w-lg mx-auto pb-safe">
      {/* Flutter Material 3 Navigation Bar */}
      <div className="mx-2.5 mb-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 select-none group cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Flutter Active Indicator Pill */}
                  <div
                    className={`px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? item.highlight
                          ? 'bg-amber-500 text-white shadow-xs scale-105'
                          : 'bg-blue-600 text-white shadow-xs scale-105'
                        : item.highlight
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-transparent text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                    {item.label.split(' ')[0]}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
