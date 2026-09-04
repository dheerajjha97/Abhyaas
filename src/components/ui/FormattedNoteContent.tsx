import React from 'react';

interface FormattedNoteContentProps {
  content: string;
  className?: string;
}

/**
 * FormattedNoteContent renders Hindi/English study notes with rich hierarchy:
 * - Major numbered topics (1., 2., etc.) as prominent section banners
 * - Hindi sub-headers (क), (ख), (i), (ii) as category badges
 * - Act / Key Concept titles ending in ':' as styled topic headers
 * - Nested bullet points (*, -, •) with clean indentation
 * - Highlighting for dates/years & bold inline text
 */
export const FormattedNoteContent: React.FC<FormattedNoteContentProps> = ({
  content,
  className = '',
}) => {
  if (!content || !content.trim()) {
    return (
      <p className="text-slate-400 italic text-xs">
        सामग्री उपलब्ध नहीं है (Content not available).
      </p>
    );
  }

  // Helper to format inline text with bolding and date highlights
  const formatInlineText = (text: string) => {
    // 1. First split by markdown **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-indigo-950 dark:text-indigo-200">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Highlight years e.g., 1773, 1858, 1947
      const dateParts = part.split(/(\b(?:17|18|19|20)\d{2}\b)/g);
      if (dateParts.length > 1) {
        return (
          <span key={idx}>
            {dateParts.map((dp, dIdx) => {
              if (/^(?:17|18|19|20)\d{2}$/.test(dp)) {
                return (
                  <span
                    key={dIdx}
                    className="font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-200/60 dark:border-indigo-800/60 inline-block my-0.5"
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
        <div key={`bg-${keySuffix}`} className="space-y-2 my-2 pl-1 sm:pl-2">
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
          className="mt-6 mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-md space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-indigo-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {topicNum}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold leading-snug text-white">
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
          className="mt-4 mb-2 inline-flex items-center gap-2 bg-indigo-100/90 dark:bg-indigo-950/80 px-3 py-1.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200"
        >
          <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
            {subSymbol.replace(/[\(\)]/g, '')}
          </span>
          <span className="text-xs sm:text-sm font-extrabold">
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
          className="mt-3 mb-1.5 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 shadow-2xs"
        >
          <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">📌</span>
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
            isIndented ? 'pl-4 sm:pl-6 border-l-2 border-indigo-200/60 dark:border-indigo-800/60 ml-2' : ''
          }`}
        >
          <span
            className={`rounded-full shrink-0 mt-1.5 ${
              isIndented
                ? 'w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500'
                : 'w-2 h-2 bg-indigo-600 dark:bg-indigo-400'
            }`}
          />
          <div className="flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            {colonSplit ? (
              <>
                <strong className="font-extrabold text-indigo-950 dark:text-indigo-200 mr-1.5">
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
        <div key={`label-${index}`} className="mt-3 mb-1 font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
          {formatInlineText(trimmed)}
        </div>
      );
      return;
    }

    renderedBlocks.push(
      <p key={`p-${index}`} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal my-1.5">
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
