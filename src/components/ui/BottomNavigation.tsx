import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, BookOpen, Layers, Zap } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: 'होम',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      to: '/papers',
      label: 'पेपर्स',
      icon: FileText,
      isActive:
        location.pathname.startsWith('/papers') ||
        location.pathname.startsWith('/paper/') ||
        location.pathname.includes('/papers'),
    },
    {
      to: '/notes',
      label: 'नोट्स',
      icon: BookOpen,
      isActive:
        location.pathname.startsWith('/notes') ||
        location.pathname.includes('/notes'),
    },
    {
      to: '/syllabus',
      label: 'सिलेबस',
      icon: Layers,
      isActive:
        location.pathname.startsWith('/syllabus') ||
        location.pathname.includes('/syllabus'),
    },
    {
      to: '/mock-test',
      label: 'टेस्ट',
      icon: Zap,
      highlight: true,
      isActive: location.pathname.startsWith('/mock-test'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md sm:max-w-lg mx-auto pb-safe">
      {/* Flutter Material 3 Navigation Bar */}
      <div className="mx-2.5 mb-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl px-1.5 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 select-none group cursor-pointer flex-1 ${
                active
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Flutter Active Indicator Pill */}
              <div
                className={`px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  active
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
              <span className="text-[10.5px] tracking-tight mt-0.5 leading-none font-bold">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

