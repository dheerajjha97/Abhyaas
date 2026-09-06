import React from 'react';

interface FormattedNoteContentProps {
  content: string;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

/**
 * FormattedNoteContent renders Hindi/English study notes with an authentic Student Notebook layout:
 * - Major numbered topics (1., 2., etc.) as prominent notebook marker banners
 * - Hindi sub-headers (क), (ख), (i), (ii) as neat circled pen notes
 * - Act / Key Concept titles ending in ':' as sticky index labels
 * - Indented bullet points (*, -, •) with clean ruled alignment
 * - Highlighter marker effects for dates/years, articles & key bold concepts
 */
export const FormattedNoteContent: React.FC<FormattedNoteContentProps> = ({
  content,
  className = '',
  fontSize = 'base',
}) => {
  if (!content || !content.trim()) {
    return (
      <p className="text-slate-400 italic text-xs py-2">
        सामग्री उपलब्ध नहीं है (Content not available).
      </p>
    );
  }

  // Font size multiplier
  const textSizeClass = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
  }[fontSize];

  const headingSizeClass = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  }[fontSize];

  // Helper to format inline text with bolding, highlighter, and date highlights
  const formatInlineText = (text: string) => {
    // 1. First split by markdown **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={idx} className="font-extrabold text-slate-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-950/50 px-1 py-0.2 rounded-md shadow-2xs">
            {inner}
          </strong>
        );
      }

      // Highlight years e.g., 1773, 1858, 1947, 1950
      const dateParts = part.split(/(\b(?:17|18|19|20)\d{2}\b)/g);
      if (dateParts.length > 1) {
        return (
          <span key={idx}>
            {dateParts.map((dp, dIdx) => {
              if (/^(?:17|18|19|20)\d{2}$/.test(dp)) {
                return (
                  <span
                    key={dIdx}
                    className="font-extrabold text-blue-800 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-1.5 py-0.2 rounded-md border border-blue-200/80 dark:border-blue-800 inline-block my-0.5 shadow-2xs font-mono text-[0.95em]"
                  >
                    {dp}
                  </span>
                );
              }
              return dp;
            })}
          </span>
        );
      }

      return part;
    });
  };

  // Split content line by line
  const lines = content.split('\n');

  const renderedBlocks: React.ReactNode[] = [];
  let currentBulletGroup: React.ReactNode[] = [];

  const flushBulletGroup = (keySuffix: string | number) => {
    if (currentBulletGroup.length > 0) {
      renderedBlocks.push(
        <div key={`bg-${keySuffix}`} className="space-y-2.5 my-2.5 pl-1 sm:pl-2">
          {currentBulletGroup}
        </div>
      );
      currentBulletGroup = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushBulletGroup(index);
      return;
    }

    // 1. Major Topic Heading starting with number (e.g. "1. संवैधानिक विकास का ऐतिहासिक परिप्रेक्ष्य...")
    const majorTopicMatch = trimmed.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (majorTopicMatch && !trimmed.startsWith('   *')) {
      flushBulletGroup(index);
      const topicNum = majorTopicMatch[1];
      const topicText = majorTopicMatch[2];

      renderedBlocks.push(
        <div
          key={`major-${index}`}
          className="mt-6 mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md space-y-1 relative overflow-hidden border border-blue-800/60"
        >
          {/* Subtle tape accent on top-right */}
          <div className="absolute -top-1 right-6 w-16 h-3 bg-amber-200/40 dark:bg-amber-400/20 backdrop-blur-xs transform rotate-2 rounded-xs pointer-events-none" />

          <div className="flex items-start sm:items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs border border-amber-300">
              {topicNum}
            </span>
            <h3 className={`${headingSizeClass} font-black leading-snug text-white tracking-tight`}>
              {formatInlineText(topicText)}
            </h3>
          </div>
        </div>
      );
      return;
    }

    // 2. Hindi Sub-category header e.g. "(क) ईस्ट इंडिया कंपनी के अंतर्गत पारित अधिनियम (1773–1858)"
    const subCatMatch = trimmed.match(/^(\([क-हa-zA-Z\d]+\))\s*(.*)$/);
    if (subCatMatch) {
      flushBulletGroup(index);
      const subSymbol = subCatMatch[1];
      const subText = subCatMatch[2];

      renderedBlocks.push(
        <div
          key={`subcat-${index}`}
          className="mt-4 mb-2 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-200/90 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 shadow-2xs"
        >
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {subSymbol.replace(/[\(\)]/g, '')}
          </span>
          <span className={`${textSizeClass} font-black text-slate-900 dark:text-amber-100`}>
            {formatInlineText(subText)}
          </span>
        </div>
      );
      return;
    }

    // 3. Act or Key Concept title starting with bullet and ending with colon, e.g. "* 1773 का रेग्यूलेटिंग एक्ट (Regulating Act):"
    const actHeaderMatch = trimmed.match(/^[\*\-\•]?\s*(\d{4}.*?:)$/) || trimmed.match(/^[\*\-\•]\s*(.*?:)$/);
    if (actHeaderMatch) {
      flushBulletGroup(index);
      const actTitle = actHeaderMatch[1];

      renderedBlocks.push(
        <div
          key={`act-${index}`}
          className="mt-3.5 mb-2 p-3 rounded-2xl bg-amber-50/90 dark:bg-slate-800/80 border-l-4 border-amber-500 dark:border-amber-400 shadow-2xs"
        >
          <h4 className={`${textSizeClass} font-black text-slate-900 dark:text-amber-200 flex items-center gap-2`}>
            <span className="text-amber-600 dark:text-amber-400 text-sm">📌</span>
            <span>{formatInlineText(actTitle)}</span>
          </h4>
        </div>
      );
      return;
    }

    // 4. Bullet Points starting with *, -, • or indented bullets
    const isIndented = line.startsWith('   ') || line.startsWith('\t');
    const bulletMatch = trimmed.match(/^[\*\-\•]\s*(.*)$/);

    if (bulletMatch) {
      const bulletText = bulletMatch[1];

      // Check if bulletText has a colon e.g. "1773 का रेग्यूलेटिंग एक्ट: यह ब्रिटिश..."
      const colonSplit = bulletText.match(/^(.*?:)\s*(.*)$/);

      currentBulletGroup.push(
        <div
          key={`bullet-${index}`}
          className={`flex items-start gap-2.5 py-1 ${
            isIndented ? 'pl-4 sm:pl-6 border-l-2 border-blue-200/80 dark:border-blue-900/60 ml-2' : ''
          }`}
        >
          <span
            className={`rounded-full shrink-0 mt-2 ${
              isIndented
                ? 'w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400'
                : 'w-2 h-2 bg-blue-700 dark:bg-blue-400 shadow-2xs'
            }`}
          />
          <div className={`flex-1 ${textSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed font-normal`}>
            {colonSplit ? (
              <>
                <strong className="font-black text-slate-950 dark:text-blue-200 mr-1.5 bg-slate-100 dark:bg-slate-800/60 px-1 py-0.5 rounded">
                  {colonSplit[1]}
                </strong>
                <span>{formatInlineText(colonSplit[2])}</span>
              </>
            ) : (
              <span>{formatInlineText(bulletText)}</span>
            )}
          </div>
        </div>
      );
      return;
    }

    // 5. Normal Paragraph line
    flushBulletGroup(index);

    // If line ends with a colon, format as sub-label
    if (trimmed.endsWith(':') && trimmed.length < 70) {
      renderedBlocks.push(
        <div key={`label-${index}`} className={`mt-3.5 mb-1 font-black ${textSizeClass} text-blue-950 dark:text-blue-200`}>
          {formatInlineText(trimmed)}
        </div>
      );
      return;
    }

    renderedBlocks.push(
      <p key={`p-${index}`} className={`${textSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed font-normal my-2`}>
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushBulletGroup('end');

  return (
    <div className={`space-y-2 ${className}`}>
      {renderedBlocks}
    </div>
  );
};

