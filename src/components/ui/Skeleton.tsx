import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  shimmer?: boolean;
}

/**
 * Base atomic Skeleton box with pulse and subtle shimmer
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  shimmer = true,
  ...props
}) => {
  return (
    <div
      className={`bg-slate-200/80 dark:bg-slate-800/80 rounded-md ${
        shimmer ? 'skeleton-shimmer' : 'animate-pulse'
      } ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton for a single Paper Card (Matches PaperCard.tsx)
 */
export const PaperCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          {/* Badge chips (Year & Board) */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-20 h-5 rounded-full" />
          </div>

          {/* Title line */}
          <Skeleton className="w-4/5 h-6 rounded-lg mt-2" />
          {/* Subtitle line */}
          <Skeleton className="w-2/5 h-4 rounded-md" />
        </div>

        {/* Paper Icon box */}
        <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
      </div>

      {/* Breakdown chips grid (MCQ, Short, Long) */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50/90 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/70 text-center">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-12 h-3 rounded-md" />
          <Skeleton className="w-8 h-4 rounded-md" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-12 h-3 rounded-md" />
          <Skeleton className="w-8 h-4 rounded-md" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-12 h-3 rounded-md" />
          <Skeleton className="w-8 h-4 rounded-md" />
        </div>
      </div>

      {/* Action Button */}
      <Skeleton className="w-full h-11 rounded-xl" />
    </div>
  );
};

/**
 * Skeleton list for Papers view
 */
export const PapersSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 gap-4" aria-label="Loading papers" role="status">
      {Array.from({ length: count }).map((_, idx) => (
        <PaperCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Skeleton for a single Subject Card (Matches SubjectCard.tsx)
 */
export const SubjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Subject Illustration/Icon box */}
        <Skeleton className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shrink-0" />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Subject Name */}
          <Skeleton className="w-2/3 max-w-[200px] h-5 rounded-lg" />
          {/* Question papers count badge */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
            <Skeleton className="w-32 h-3.5 rounded-md" />
          </div>
        </div>
      </div>

      {/* Action Controls on right */}
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="hidden sm:block w-24 h-8 rounded-xl" />
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton list for Subjects view
 */
export const SubjectsSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="grid grid-cols-1 gap-3" aria-label="Loading subjects" role="status">
      {Array.from({ length: count }).map((_, idx) => (
        <SubjectCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Notes View (Matches NotesView.tsx)
 */
export const NotesSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" aria-label="Loading notes" role="status">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-36 h-5 rounded-full" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
        <Skeleton className="w-3/4 h-7 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-md" />

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Skeleton className="w-14 h-4 rounded-md" />
          <Skeleton className="w-16 h-4 rounded-md" />
          <Skeleton className="w-12 h-4 rounded-md" />
        </div>
      </div>

      {/* Key Takeaways Card */}
      <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-48 h-4 rounded-md" />
        </div>
        <div className="space-y-2 pl-1 pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
            <Skeleton className="w-11/12 h-3.5 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
            <Skeleton className="w-4/5 h-3.5 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
            <Skeleton className="w-9/12 h-3.5 rounded-md" />
          </div>
        </div>
      </div>

      {/* Note Sections */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-3/5 h-5 rounded-md" />
                <Skeleton className="w-2/5 h-3.5 rounded-md" />
              </div>
            </div>

            {/* Paragraph lines */}
            <div className="space-y-2 pt-1">
              <Skeleton className="w-full h-3.5 rounded-md" />
              <Skeleton className="w-11/12 h-3.5 rounded-md" />
              <Skeleton className="w-4/5 h-3.5 rounded-md" />
              <Skeleton className="w-2/3 h-3.5 rounded-md" />
            </div>

            {/* Key points box */}
            <div className="mt-3 bg-blue-50/50 dark:bg-slate-800/40 rounded-2xl p-3 border border-blue-100/60 dark:border-slate-700/60 space-y-2">
              <Skeleton className="w-32 h-3.5 rounded-md" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                  <Skeleton className="w-5/6 h-3 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                  <Skeleton className="w-4/6 h-3 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Syllabus View (Matches SyllabusView.tsx)
 */
export const SyllabusSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" aria-label="Loading syllabus" role="status">
      {/* Hero Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-28 h-5 rounded-full" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
        <Skeleton className="w-3/5 h-7 rounded-lg" />
        <Skeleton className="w-full h-4 rounded-md" />
        <Skeleton className="w-4/5 h-4 rounded-md" />

        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="w-24 h-4 rounded-md" />
          <Skeleton className="w-24 h-4 rounded-md" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
      </div>

      {/* Pattern 3 Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center gap-1.5"
          >
            <Skeleton className="w-12 h-3 rounded-md" />
            <Skeleton className="w-8 h-5 rounded-md" />
            <Skeleton className="w-14 h-3 rounded-md" />
          </div>
        ))}
      </div>

      {/* Units List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="w-28 h-4 rounded-md" />
          <Skeleton className="w-16 h-3 rounded-md" />
        </div>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
                <Skeleton className="w-44 h-5 rounded-md" />
              </div>
              <Skeleton className="w-14 h-5 rounded-full" />
            </div>

            <div className="space-y-1.5 pl-8">
              <Skeleton className="w-5/6 h-3.5 rounded-md" />
              <Skeleton className="w-4/6 h-3.5 rounded-md" />
              <Skeleton className="w-3/4 h-3.5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Preparation Screen (Matches Preparation.tsx)
 */
export const PreparationSkeleton: React.FC = () => {
  return (
    <div className="space-y-5" aria-label="Loading preparation" role="status">
      {/* Paper Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-5 rounded-full" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
        <Skeleton className="w-3/4 h-7 rounded-lg" />
        <Skeleton className="w-1/3 h-4 rounded-md" />

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>

      {/* 3 Preparation Mode Cards */}
      <div className="space-y-3">
        <Skeleton className="w-32 h-4 rounded-md px-1" />

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="w-1/2 h-5 rounded-md" />
                <Skeleton className="w-3/4 h-3.5 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Quiz / Questions view (Matches Quiz.tsx & Questions views)
 */
export const QuestionSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 max-w-2xl mx-auto" aria-label="Loading question" role="status">
      {/* Progress Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="w-28 h-4 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
        <Skeleton className="w-full h-2 rounded-full" />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-full h-5 rounded-md" />
            <Skeleton className="w-4/5 h-5 rounded-md" />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5"
            >
              <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
              <Skeleton className="w-2/3 h-4 rounded-md" />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
