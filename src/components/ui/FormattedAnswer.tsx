import React from 'react';

interface FormattedAnswerProps {
  content: string;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  showAnswerLabel?: boolean;
}

/**
 * FormattedAnswer:
 * Parses and renders Hindi & English academic answers with an authentic textbook/guidebook layout:
 * - Clear textbook "उत्तर :" rubric and hanging indentations
 * - Distinct numbered points (1., 2., (i), (ii), (क), (ख), (a), (b)) with crisp badges
 * - Subheadings with colons (e.g., 'परिभाषा:', 'गाउस का नियम:', '1. प्रभाविकता का नियम:')
 * - Mathematical, physical & chemical formulas / equations in dedicated formula boxes
 * - Examples (उदा.-, जैसे:) and Important Notes (नोट:) in textbook callout cards
 * - High-contrast, eye-friendly typography with generous line-height for Hindi Devanagari text
 */
export const FormattedAnswer: React.FC<FormattedAnswerProps> = ({
  content,
  className = '',
  fontSize = 'base',
  showAnswerLabel = false,
}) => {
  if (!content || !content.trim()) {
    return (
      <p className="text-slate-400 italic text-xs py-2">
        उत्तर उपलब्ध नहीं है (Answer not available).
      </p>
    );
  }

  const textSizeClass =
    fontSize === 'sm'
      ? 'text-xs sm:text-sm leading-[1.75]'
      : fontSize === 'lg'
      ? 'text-base sm:text-lg leading-[1.9]'
      : 'text-sm sm:text-base leading-[1.8]';

  // Helper to format inline bold, quotes, years, and highlighted terms
  const formatInlineText = (text: string) => {
    // 1. Split by markdown **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={idx}
            className="font-extrabold text-indigo-950 dark:text-amber-200 bg-amber-100/60 dark:bg-amber-950/40 px-1 py-0.5 rounded-sm"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Format bracketed English or sub-terms like (Law of Dominance) or [2 अंक]
      const bracketParts = part.split(/(\([a-zA-Z0-9\s,\.\-—]+\))/g);
      if (bracketParts.length > 1) {
        return (
          <span key={idx}>
            {bracketParts.map((bp, bIdx) => {
              if (bp.startsWith('(') && bp.endsWith(')')) {
                return (
                  <span
                    key={bIdx}
                    className="font-medium text-slate-600 dark:text-slate-400 text-[0.92em]"
                  >
                    {bp}
                  </span>
                );
              }
              return bp;
            })}
          </span>
        );
      }

      return part;
    });
  };

  // Split into raw paragraphs / lines
  const rawParagraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const renderParagraph = (paragraph: string, pIdx: number) => {
    const lines = paragraph
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // 1. Check if the block is a mathematical / chemical formula or equation
    const isFormulaBlock =
      lines.length <= 4 &&
      lines.some(
        (l) =>
          (l.includes('=') || l.includes('→') || l.includes('⇌')) &&
          (l.includes('∮') ||
            l.includes('ε₀') ||
            l.includes('·') ||
            l.includes('^') ||
            l.includes('λ') ||
            l.includes('π') ||
            l.includes('Δ') ||
            l.includes('∑') ||
            l.includes('√') ||
            l.includes('H₂') ||
            l.includes('O₂') ||
            l.includes('CO₂') ||
            l.includes('k ·') ||
            l.includes('/') ||
            l.includes('+'))
      );

    if (isFormulaBlock) {
      return (
        <div
          key={pIdx}
          className="my-3.5 p-3.5 sm:p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/90 dark:border-indigo-800/80 shadow-2xs relative overflow-hidden"
        >
          <div className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>📐 सूत्र / रासायनिक समीकरण (Formula / Equation):</span>
          </div>
          <div className="font-mono text-xs sm:text-sm font-extrabold text-indigo-950 dark:text-indigo-100 space-y-1 overflow-x-auto py-1 px-1 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
            {lines.map((line, lIdx) => (
              <div key={lIdx} className="whitespace-pre text-center sm:text-left">
                {line}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Check if this is an Example block (e.g. "जैसे -", "उदाहरण:", "उदा.-")
    const isExampleBlock = lines.some((l) =>
      /^(जैसे\s*[-:]|उदाहरण\s*[:\-]|उदा\s*[\.\-:]|Example\s*[:\-])/i.test(l)
    );

    if (isExampleBlock && lines.length <= 3) {
      return (
        <div
          key={pIdx}
          className="my-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 border-y border-r border-amber-200/80 dark:border-amber-800/60 shadow-2xs"
        >
          <div className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
            <span>💡</span>
            <span>उदाहरण (Example):</span>
          </div>
          <div className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
            {lines.map((line, lIdx) => (
              <p key={lIdx}>{formatInlineText(line.replace(/^(जैसे\s*[-:]|उदाहरण\s*[:\-]|उदा\s*[\.\-:]|Example\s*[:\-])\s*/i, ''))}</p>
            ))}
          </div>
        </div>
      );
    }

    // 3. Check if this is an Important Note block (e.g. "नोट:", "Note:", "याद रखें:", "विशेष:")
    const isNoteBlock = lines.some((l) =>
      /^(नोट\s*[:\-]|Note\s*[:\-]|विशेष\s*[:\-]|याद\s*रखें\s*[:\-])/i.test(l)
    );

    if (isNoteBlock && lines.length <= 3) {
      return (
        <div
          key={pIdx}
          className="my-3 p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-400 border-y border-r border-blue-200/80 dark:border-blue-800/60 shadow-2xs"
        >
          <div className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1">
            <span>📌</span>
            <span>महत्वपूर्ण बिंदु (Important Note):</span>
          </div>
          <div className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
            {lines.map((line, lIdx) => (
              <p key={lIdx}>{formatInlineText(line.replace(/^(नोट\s*[:\-]|Note\s*[:\-]|विशेष\s*[:\-]|याद\s*रखें\s*[:\-])\s*/i, ''))}</p>
            ))}
          </div>
        </div>
      );
    }

    // 4. Standalone Subheading line with colon (e.g. "गाउस का नियम:", "मुख्य कारण:")
    if (lines.length === 1 && lines[0].endsWith(':') && lines[0].length < 75) {
      return (
        <div key={pIdx} className="pt-2.5 pb-1">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200 bg-indigo-100/80 dark:bg-indigo-900/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            {lines[0]}
          </span>
        </div>
      );
    }

    // 5. Parse lines for Numbered Points, Sub-points, or Regular Text
    const renderedLines = lines.map((line, lIdx) => {
      // Regex for Main Numbered Points: "1. ", "2. ", "1) ", "(1) ", "[1] "
      const mainNumMatch = line.match(/^(\d+)[\.\)\]]\s*(.*)$/) || line.match(/^\((\d+)\)\s*(.*)$/);
      // Regex for Roman Sub-points: "(i) ", "(ii) ", "i. ", "ii. ", "I. "
      const romanMatch = line.match(/^\(([ivxlcdmIVXLCDM]+)\)\s*(.*)$/) || line.match(/^([ivxlcdmIVXLCDM]+)[\.\)]\s*(.*)$/);
      // Regex for Hindi/Alphabetical Sub-points: "(क) ", "क. ", "(a) ", "a. "
      const alphaMatch = line.match(/^\(([क-हa-zA-Z])\)\s*(.*)$/) || line.match(/^([क-हa-zA-Z])[\.\)]\s*(.*)$/);
      // Regex for Bullets: "- ", "• ", "* ", "→ ", "➤ "
      const bulletMatch = line.match(/^[\-\•\*\→\➤]\s*(.*)$/);

      // A. Main Numbered Point (e.g. "1. प्राथमिक क्षेत्र: कृषि...")
      if (mainNumMatch) {
        const num = mainNumMatch[1];
        const rest = mainNumMatch[2];
        const colonSplit = rest.match(/^(.*?:\s*)(.*)$/);

        return (
          <div
            key={lIdx}
            className="flex items-start gap-3 py-2 border-b border-dashed border-slate-200/80 dark:border-slate-800/80 last:border-b-0"
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-blue-600 dark:bg-blue-500 text-white text-xs sm:text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              {num}
            </span>
            <div className="flex-1 text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
              {colonSplit ? (
                <>
                  <strong className="font-black text-slate-950 dark:text-white mr-1 text-indigo-950 dark:text-indigo-200 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-2">
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

      // B. Roman Sub-point (e.g. "(i) प्रकाश का परावर्तन...")
      if (romanMatch) {
        const roman = romanMatch[1];
        const rest = romanMatch[2];
        const colonSplit = rest.match(/^(.*?:\s*)(.*)$/);

        return (
          <div key={lIdx} className="flex items-start gap-2.5 py-1.5 pl-2 sm:pl-3">
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
              ({roman})
            </span>
            <div className="flex-1 text-slate-800 dark:text-slate-200 leading-relaxed">
              {colonSplit ? (
                <>
                  <strong className="font-extrabold text-slate-900 dark:text-white mr-1 text-indigo-950 dark:text-indigo-200">
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

      // C. Hindi / Alphabetical Sub-point (e.g. "(क) ...", "a. ...")
      if (alphaMatch) {
        const char = alphaMatch[1];
        const rest = alphaMatch[2];
        const colonSplit = rest.match(/^(.*?:\s*)(.*)$/);

        return (
          <div key={lIdx} className="flex items-start gap-2.5 py-1.5 pl-2 sm:pl-3">
            <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-amber-300 dark:border-amber-700">
              {char}
            </span>
            <div className="flex-1 text-slate-800 dark:text-slate-200 leading-relaxed">
              {colonSplit ? (
                <>
                  <strong className="font-extrabold text-slate-900 dark:text-white mr-1">
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

      // D. Bullet Match
      if (bulletMatch) {
        const rest = bulletMatch[1];
        return (
          <div key={lIdx} className="flex items-start gap-2.5 py-1 pl-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 shrink-0 shadow-2xs" />
            <div className="flex-1 text-slate-800 dark:text-slate-200 leading-relaxed">
              {formatInlineText(rest)}
            </div>
          </div>
        );
      }

      // E. Line starting with a distinct title e.g. "परिभाषा: किसी वस्तु..."
      const titleMatch = line.match(/^([^:\n]{2,35}):\s*(.*)$/);
      if (titleMatch && !line.startsWith('http') && !line.includes('//')) {
        return (
          <div key={lIdx} className="py-1.5">
            <div className="font-black text-indigo-950 dark:text-indigo-200 mb-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{titleMatch[1]}:</span>
            </div>
            {titleMatch[2] && (
              <p className="text-slate-800 dark:text-slate-200 pl-3.5 border-l-2 border-indigo-200 dark:border-indigo-800 ml-1 leading-relaxed">
                {formatInlineText(titleMatch[2])}
              </p>
            )}
          </div>
        );
      }

      // F. Regular Standard Paragraph Line
      return (
        <p key={lIdx} className="leading-relaxed py-1">
          {formatInlineText(line)}
        </p>
      );
    });

    return (
      <div key={pIdx} className="space-y-1">
        {renderedLines}
      </div>
    );
  };

  return (
    <div
      className={`font-normal text-slate-800 dark:text-slate-200 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] ${textSizeClass} ${className}`}
    >
      {showAnswerLabel && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100/80 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-black text-xs">
          <span className="text-blue-600 dark:text-blue-400">📖</span>
          <span>उत्तर (Answer):</span>
        </div>
      )}

      <div className="space-y-3.5">
        {rawParagraphs.map((para, idx) => renderParagraph(para, idx))}
      </div>
    </div>
  );
};

