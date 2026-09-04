import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, BookOpen, Layers, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface NavItemConfig {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  inactiveBg: string;
  inactiveIconColor: string;
  isSpecial?: boolean;
}

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const [clickedId, setClickedId] = useState<string | null>(null);

  const navItems: NavItemConfig[] = [
    {
      id: 'home',
      to: '/',
      label: 'होम',
      icon: Home,
      inactiveBg: 'bg-[#EEF4FF] dark:bg-slate-800',
      inactiveIconColor: 'text-[#475569] dark:text-slate-300',
    },
    {
      id: 'papers',
      to: '/papers',
      label: 'पेपर्स',
      icon: FileText,
      inactiveBg: 'bg-[#EEF5FF] dark:bg-slate-800',
      inactiveIconColor: 'text-[#475569] dark:text-slate-300',
    },
    {
      id: 'notes',
      to: '/notes',
      label: 'नोट्स',
      icon: BookOpen,
      inactiveBg: 'bg-[#F1EFFF] dark:bg-slate-800',
      inactiveIconColor: 'text-[#475569] dark:text-slate-300',
    },
    {
      id: 'syllabus',
      to: '/syllabus',
      label: 'सिलेबस',
      icon: Layers,
      inactiveBg: 'bg-[#EAF7EE] dark:bg-slate-800',
      inactiveIconColor: 'text-[#475569] dark:text-slate-300',
    },
    {
      id: 'test',
      to: '/mock-test',
      label: 'टेस्ट',
      icon: Zap,
      inactiveBg: 'bg-[#FFF4E5] dark:bg-amber-950/40',
      inactiveIconColor: 'text-[#D97706] dark:text-amber-400',
      isSpecial: true,
    },
  ];

  // Match active tab according to current pathname
  const getIsActive = (item: NavItemConfig) => {
    const path = location.pathname;
    if (item.id === 'home') {
      return path === '/';
    }
    if (item.id === 'papers') {
      return (
        path.startsWith('/papers') ||
        path.startsWith('/paper/') ||
        (path.startsWith('/class/') && path.includes('/papers'))
      );
    }
    if (item.id === 'notes') {
      return (
        path.startsWith('/notes') ||
        (path.startsWith('/class/') && path.includes('/notes'))
      );
    }
    if (item.id === 'syllabus') {
      return (
        path.startsWith('/syllabus') ||
        (path.startsWith('/class/') && path.includes('/syllabus'))
      );
    }
    if (item.id === 'test') {
      return path.startsWith('/mock-test');
    }
    return false;
  };

  const handleItemClick = (id: string) => {
    setClickedId(id);
    setTimeout(() => setClickedId(null), 400);
  };

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4 pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* Floating Glassmorphism Container inspired by Reference Image */}
      <div className="pointer-events-auto w-full max-w-[440px] sm:max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-[28px] sm:rounded-[32px] px-2 py-2 sm:px-3 sm:py-2.5 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7)] flex items-center justify-between relative transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = getIsActive(item);
          const isClicked = clickedId === item.id;

          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={() => handleItemClick(item.id)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="group flex-1 flex flex-col items-center justify-center relative cursor-pointer select-none py-1 px-0.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
            >
              {/* Click Ripple / Glow Feedback */}
              {isClicked && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0.8 }}
                  animate={{ scale: 1.35, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-2xl bg-blue-500/15 pointer-events-none"
                />
              )}

              {/* Icon Container Area */}
              <div className="relative w-12 h-11 sm:w-14 sm:h-12 flex items-center justify-center">
                {/* Active Animated Gradient Pill (Morphs across tabs) */}
                {active && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#38BDF8] via-[#2563EB] to-[#1D4ED8] shadow-[0_8px_20px_-3px_rgba(37,99,235,0.48)] border-t border-white/35 overflow-hidden"
                  >
                    {/* Decorative Sparkle Dots from Reference Image */}
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs" />
                    <div className="absolute top-3 right-0.5 w-1 h-1 rounded-full bg-sky-200/90" />
                    <div className="absolute top-0.5 right-3 w-0.5 h-0.5 rounded-full bg-white/70" />
                    
                    {/* Subtle top ambient sheen */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-white/30 rounded-full blur-xs" />
                  </motion.div>
                )}

                {/* Inactive Icon Soft Badge */}
                {!active && (
                  <motion.div
                    initial={false}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95 ${item.inactiveBg}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${item.inactiveIconColor} transition-colors stroke-[2.2]`}
                    />
                  </motion.div>
                )}

                {/* Active Icon with Bounce & Float Animation */}
                {active && (
                  <motion.div
                    initial={{ scale: 0.85, y: 1 }}
                    animate={{ scale: [0.85, 1.08, 1], y: 0 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="relative z-10 flex items-center justify-center text-white"
                  >
                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white stroke-[2.4] drop-shadow-xs" />
                  </motion.div>
                )}
              </div>

              {/* Hindi Label */}
              <motion.span
                animate={{
                  y: active ? -1 : 0,
                  fontWeight: active ? 800 : 600,
                }}
                transition={{ duration: 0.2 }}
                className={`text-[11px] sm:text-[12px] mt-1 tracking-tight leading-tight transition-colors duration-200 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                    : 'text-[#475569] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </motion.span>

              {/* Active Underline / Bar Indicator */}
              <div className="h-1.5 w-full flex items-center justify-center mt-0.5">
                {active && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                    }}
                    className="h-[3.5px] w-6 sm:w-7 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_1.5px_6px_rgba(37,99,235,0.45)]"
                  />
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
