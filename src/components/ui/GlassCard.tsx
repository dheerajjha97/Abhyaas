import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'solid' | 'accent' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseClasses = 'relative backdrop-blur-md transition-all duration-200 ease-out border';

  const variantClasses = {
    default: 'bg-white/50 backdrop-blur-md border-white/40 shadow-sm text-slate-800 dark:bg-slate-900/50 dark:border-slate-800/80 dark:text-slate-100',
    solid: 'bg-white/70 backdrop-blur-md border-white/50 shadow-sm text-slate-800 dark:bg-slate-900/70 dark:border-slate-800',
    accent: 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 text-white rounded-3xl border-indigo-300/30 shadow-lg shadow-indigo-500/20',
    interactive: 'bg-white/50 hover:bg-white/80 backdrop-blur-md border-white/40 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer text-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 dark:border-slate-800',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 rounded-2xl',
    md: 'p-4 sm:p-5 rounded-3xl',
    lg: 'p-6 sm:p-8 rounded-3xl',
  };

  const hoverClass = hoverEffect && variant !== 'interactive' ? 'hover:-translate-y-0.5 hover:shadow-2xl' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
