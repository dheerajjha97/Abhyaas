import React from 'react';

interface FormattedAnswerProps {
  content: string;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg';
}

/**
 * Parses and beautifully renders Hindi / English academic answers with:
 * - Numbered points (1., 2., 3., (i), (ii), etc.) with custom numbered badges
 * - Subheadings with colons (e.g. 'महत्व:', 'गाउस की प्रमेय:', '1. प्रभाविकता का नियम:')
 * - Bullet points (- or •)
 * - Mathematical and scientific formulas / equations
 * - Paragraphs with optimal typography, line spacing, and contrast
 */
export const FormattedAnswer: React.FC<FormattedAnswerProps> = ({
  content,
  className = '',
  fontSize = 'base',
}) => {
  if (!content || !content.trim()) {
    return (
      <p className="text-slate-400 italic text-xs">
        उत्तर उपलब्ध नहीं है (Answer not available).
      </p>
    );
  }

  // Split into logical blocks by double newline or single newline
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const textSizeClass =
    fontSize === 'sm'
      ? 'text-xs sm:text-sm'
      : fontSize === 'lg'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  // Helper to format inline bold text or highlighted keywords
  const formatInlineText = (text: string) => {
    // If text has markdown style **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-indigo-950 dark:text-indigo-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderParagraph = (paragraph: string, pIdx: number) => {
    const lines = paragraph.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Check if this paragraph is a mathematical formula or equation
    const isFormulaBlock =
      lines.length <= 3 &&
      lines.some(
        (l) =>
          l.includes('=') &&
          (l.includes('∮') ||
            l.includes('ε₀') ||
            l.includes('·') ||
            l.includes('/') ||
            l.includes('^') ||
            l.includes('λ') ||
            l.includes('π') ||
            l.includes('k ·'))
      );

    if (isFormulaBlock) {
      return (
        <div
          key={pIdx}
          className="my-3 p-3.5 sm:p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs"
        >
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
            <span>📐 सूत्र / समीकरण (Formula):</span>
          </div>
          <div className="font-mono text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 space-y-1 overflow-x-auto py-0.5">
            {lines.map((line, lIdx) => (
              <div key={lIdx} className="whitespace-pre">
                {line}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Check if this is a Heading line with colon, e.g. "महत्व:", "गाउस की प्रमेय:", "अनुप्रयोग:"
    if (lines.length === 1 && lines[0].endsWith(':') && lines[0].length < 60) {
      return (
        <div key={pIdx} className="pt-2 pb-1">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/60 px-3 py-1 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            {lines[0]}
          </span>
        </div>
      );
    }

    // 3. Process lines to check for numbered list items or bullet items
    const renderedLines = lines.map((line, lIdx) => {
      // Regex for numbered points like "1. ", "2. ", "1) ", "(1) ", "(i) ", "i. "
      const numMatch = line.match(/^(\d+|[a-zA-Z]|[ivxlcdmIVXLCDM]+)[\.\)]\s*(.*)$/);
      // Regex for bullet points like "- ", "• ", "* "
      const bulletMatch = line.match(/^[\-\•\*]\s*(.*)$/);

      if (numMatch) {
        const numLabel = numMatch[1];
        const rest = numMatch[2];

        // Check if rest has a sub-heading like "प्रभाविकता का नियम (Law of Dominance): ..."
        const colonSplit = rest.match(/^(.*?:\s*)(.*)$/);

        return (
          <div key={lIdx} className="flex items-start gap-2.5 sm:gap-3 py-1.5 group">
            <span className="w-6 h-6 rounded-xl bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-indigo-200/60 dark:border-indigo-700/60">
              {numLabel}
            </span>
            <div className="flex-1 text-slate-800 dark:text-slate-200 leading-relaxed">
              {colonSplit ? (
                <>
                  <strong className="font-extrabold text-slate-900 dark:text-slate-100 block sm:inline mr-1 text-indigo-950 dark:text-indigo-200">
                    {colonSplit[1]}
                  </strong>
                  <span>{formatInlineText(colonSplit[2])}</span>
                </>
              ) : (
                <span>{formatInlineText(rest)}</span>
              )}
            </div>
          </div>
        );
      }

      if (bulletMatch) {
        const rest = bulletMatch[1];
        return (
          <div key={lIdx} className="flex items-start gap-2.5 py-1.5 pl-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 shrink-0" />
            <div className="flex-1 text-slate-800 dark:text-slate-200 leading-relaxed">
              {formatInlineText(rest)}
            </div>
          </div>
        );
      }

      // Check if this single line starts with a title like "गाउस की प्रमेय:" or "परिभाषा:"
      const titleMatch = line.match(/^([^:\n]{2,35}):\s*(.*)$/);
      if (titleMatch && !line.startsWith('http')) {
        return (
          <div key={lIdx} className="py-1">
            <div className="font-extrabold text-indigo-950 dark:text-indigo-200 mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{titleMatch[1]}:</span>
            </div>
            {titleMatch[2] && (
              <p className="text-slate-800 dark:text-slate-200 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800/60 ml-0.5 leading-relaxed">
                {formatInlineText(titleMatch[2])}
              </p>
            )}
          </div>
        );
      }

      return (
        <p key={lIdx} className="leading-relaxed py-0.5">
          {formatInlineText(line)}
        </p>
      );
    });

    return (
      <div key={pIdx} className="space-y-1.5">
        {renderedLines}
      </div>
    );
  };

  return (
    <div
      className={`space-y-3 font-normal text-slate-800 dark:text-slate-200 ${textSizeClass} ${className}`}
    >
      {paragraphs.map((para, idx) => renderParagraph(para, idx))}
    </div>
  );
};
