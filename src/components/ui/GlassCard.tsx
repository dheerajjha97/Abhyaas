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
  const baseClasses = 'relative transition-all duration-200 ease-out';

  const variantClasses = {
    default: 'bg-white border border-slate-200/80 dark:border-slate-800 shadow-xs text-slate-800 dark:bg-slate-900 dark:text-slate-100',
    solid: 'bg-white border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100',
    accent: 'bg-white border border-blue-200/80 dark:border-blue-900/50 shadow-xs text-slate-900 rounded-3xl dark:bg-slate-900 dark:text-white',
    interactive: 'bg-white hover:bg-slate-50/70 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/70 dark:text-slate-100',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 rounded-2xl',
    md: 'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
    lg: 'p-5 sm:p-6 rounded-3xl',
  };

  const hoverClass = hoverEffect && variant !== 'interactive' ? 'hover:-translate-y-0.5 hover:shadow-md' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
