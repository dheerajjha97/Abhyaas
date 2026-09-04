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
  const baseClasses = 'relative transition-all duration-200 ease-out border';

  const variantClasses = {
    default: 'bg-white border-slate-200/90 shadow-2xs text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100',
    solid: 'bg-white border-slate-200/90 shadow-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100',
    accent: 'bg-white border-blue-200/90 shadow-2xs text-slate-900 rounded-3xl dark:bg-slate-900 dark:border-blue-900/60 dark:text-white',
    interactive: 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 rounded-2xl',
    md: 'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
    lg: 'p-5 sm:p-6 rounded-3xl',
  };

  const hoverClass = hoverEffect && variant !== 'interactive' ? 'hover:shadow-xs' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
