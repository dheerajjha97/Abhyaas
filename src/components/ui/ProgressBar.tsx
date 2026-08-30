import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100 or current item
  max?: number; // total items
  label?: string;
  showPercentage?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'gradient';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  color = 'indigo',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorStyles = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 px-0.5">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-3 sm:h-3.5 overflow-hidden p-0.5 backdrop-blur-sm border border-slate-300/40">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
