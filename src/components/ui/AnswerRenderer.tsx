import React, { useState } from 'react';
import { Table, List, Sparkles, Lightbulb, Pin, Sigma, Check, Copy } from 'lucide-react';

export interface AnswerRendererProps {
  content: string;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  showAnswerLabel?: boolean;
}

const UPPER_ROMAN_MAP: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
};

const LOWER_ROMAN_MAP: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12,
};

const CIRCLE_NUMS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫'];

export interface SubPointItem {
  subNum: number | string;
  rawRoman?: string;
  label?: string;
  text: string;
  fullText: string;
}

export interface ComparisonRow {
  aspect: string;
  valA: string;
  valB: string;
  raw: string;
}

export interface ComparisonData {
  itemA: string;
  itemB: string;
  rows: ComparisonRow[];
}

export interface ASTSection {
  type: 'main_section' | 'numbered_point' | 'standalone_sub_point' | 'bullet' | 'paragraph' | 'formula' | 'example' | 'note';
  roman?: string;
  sectionNumber?: number;
  sectionSymbol?: string;
  title?: string;
  subPoints?: SubPointItem[];
  isComparison?: boolean;
  comparisonData?: ComparisonData;
  num?: number;
  subNum?: number | string;
  rawRoman?: string;
  label?: string;
  text?: string;
  fullText?: string;
}

/**
 * Format inline bold, scientific brackets (e.g. (3n), (Endosperm)), and key scientific terminology
 */
export const formatInlineText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split by markdown bold **text**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);

  return boldParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.slice(2, -2);
      return (
        <strong
          key={idx}
          className="font-extrabold text-slate-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-950/40 px-1 py-0.5 rounded-sm"
        >
          {boldContent}
        </strong>
      );
    }

    // Split by English/scientific terms in brackets, e.g. (Endosperm), (Nucellus), (3n), (2n)
    const bracketParts = part.split(/(\([a-zA-Z0-9\s,\.\-—+×÷/]+\))/g);
    if (bracketParts.length > 1) {
      return (
        <span key={idx}>
          {bracketParts.map((bp, bIdx) => {
            if (bp.startsWith('(') && bp.endsWith(')')) {
              return (
                <span
                  key={bIdx}
                  className="font-medium text-slate-600 dark:text-slate-400 text-[0.93em] tracking-tight"
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

/**
 * Safe frontend AST parser that converts raw textbook answer text into a hierarchical structure
 */
export function parseAnswerAST(content: string): ASTSection[] {
  if (!content || !content.trim()) return [];

  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const ast: ASTSection[] = [];
  let currentSection: ASTSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Math / Physics / Chemistry Formula block detection
    const isFormula =
      (line.includes('=') || line.includes('→') || line.includes('⇌')) &&
      (line.includes('∮') ||
        line.includes('ε₀') ||
        line.includes('·') ||
        line.includes('^') ||
        line.includes('λ') ||
        line.includes('π') ||
        line.includes('Δ') ||
        line.includes('∑') ||
        line.includes('√') ||
        line.includes('H₂') ||
        line.includes('O₂') ||
        line.includes('CO₂') ||
        line.includes('k ·') ||
        line.includes('/') ||
        line.includes('+'));

    if (isFormula && !line.startsWith('(') && line.length < 90) {
      currentSection = null;
      ast.push({ type: 'formula', text: line });
      continue;
    }

    // 2. Example Callout block
    if (/^(जैसे\s*[-:]|उदाहरण\s*[:\-]|उदा\s*[\.\-:]|Example\s*[:\-])/i.test(line) && line.length < 240) {
      currentSection = null;
      ast.push({
        type: 'example',
        text: line.replace(/^(जैसे\s*[-:]|उदाहरण\s*[:\-]|उदा\s*[\.\-:]|Example\s*[:\-])\s*/i, ''),
      });
      continue;
    }

    // 3. Note Callout block
    if (/^(नोट\s*[:\-]|Note\s*[:\-]|विशेष\s*[:\-]|याद\s*रखें\s*[:\-])/i.test(line)) {
      currentSection = null;
      ast.push({
        type: 'note',
        text: line.replace(/^(नोट\s*[:\-]|Note\s*[:\-]|विशेष\s*[:\-]|याद\s*रखें\s*[:\-])\s*/i, ''),
      });
      continue;
    }

    // 4. Main Section Detection: (I), (II), (III) or I., II.
    const upperRomanMatch =
      line.match(/^\(([IVXLCDM]+)\)\s*(.*)$/) ||
      line.match(/^([IVXLCDM]+)[\.\)]\s+(.*)$/);

    if (upperRomanMatch && UPPER_ROMAN_MAP[upperRomanMatch[1]]) {
      const roman = upperRomanMatch[1];
      const num = UPPER_ROMAN_MAP[roman];
      const title = upperRomanMatch[2].trim();

      currentSection = {
        type: 'main_section',
        roman,
        sectionNumber: num,
        sectionSymbol: CIRCLE_NUMS[num - 1] || `${num}.`,
        title,
        subPoints: [],
      };
      ast.push(currentSection);
      continue;
    }

    // 5. Lowercase Roman Sub-point Detection: (i), (ii), (iii) or i., ii.
    const lowerRomanMatch =
      line.match(/^\(([ivxlcdm]+)\)\s*(.*)$/) ||
      line.match(/^([ivxlcdm]+)[\.\)]\s+(.*)$/);

    if (lowerRomanMatch && LOWER_ROMAN_MAP[lowerRomanMatch[1]]) {
      const roman = lowerRomanMatch[1];
      const subNum = LOWER_ROMAN_MAP[roman];
      const rawText = lowerRomanMatch[2].trim();

      // Extract label if present, e.g. "उत्पत्ति: ..." or "केंद्रीय भ्रूणपोष विकास (Nuclear type): ..."
      const colonMatch = rawText.match(/^([^:\n]{2,45}):\s*(.*)$/);
      const label = colonMatch ? colonMatch[1].trim() : undefined;
      const text = colonMatch ? colonMatch[2].trim() : rawText;

      const subPoint: SubPointItem = {
        subNum,
        rawRoman: roman,
        label,
        text,
        fullText: rawText,
      };

      if (currentSection && currentSection.type === 'main_section') {
        currentSection.subPoints = currentSection.subPoints || [];
        currentSection.subPoints.push(subPoint);
      } else {
        ast.push({
          type: 'standalone_sub_point',
          ...subPoint,
        });
      }
      continue;
    }

    // 6. Numeric Point Detection: "1. ", "2. ", "(1) "
    const numMatch = line.match(/^(\d+)[\.\)\]]\s*(.*)$/) || line.match(/^\((\d+)\)\s*(.*)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const rawText = numMatch[2].trim();
      const colonMatch = rawText.match(/^([^:\n]{2,45}):\s*(.*)$/);

      // Check if next lines are sub-points, making this a section header
      const looksLikeHeader =
        colonMatch &&
        rawText.length < 65 &&
        i + 1 < lines.length &&
        /^\(([ivxlcdmIVXLCDM\dक-हa-zA-Z]+)\)/.test(lines[i + 1]);

      if (looksLikeHeader) {
        currentSection = {
          type: 'main_section',
          sectionNumber: num,
          sectionSymbol: CIRCLE_NUMS[num - 1] || `${num}.`,
          title: rawText,
          subPoints: [],
        };
        ast.push(currentSection);
      } else {
        const subPoint: SubPointItem = {
          subNum: num,
          label: colonMatch ? colonMatch[1].trim() : undefined,
          text: colonMatch ? colonMatch[2].trim() : rawText,
          fullText: rawText,
        };

        if (currentSection && currentSection.type === 'main_section') {
          currentSection.subPoints = currentSection.subPoints || [];
          currentSection.subPoints.push(subPoint);
        } else {
          ast.push({
            type: 'numbered_point',
            num,
            label: colonMatch ? colonMatch[1].trim() : undefined,
            text: colonMatch ? colonMatch[2].trim() : rawText,
            fullText: rawText,
          });
        }
      }
      continue;
    }

    // 7. Bullet Point Detection: "* ", "• ", "- ", "➤ ", "→ "
    const bulletMatch = line.match(/^[\-\•\*\→\➤]\s*(.*)$/);
    if (bulletMatch) {
      const rawText = bulletMatch[1].trim();
      const colonMatch = rawText.match(/^([^:\n]{2,45}):\s*(.*)$/);
      ast.push({
        type: 'bullet',
        label: colonMatch ? colonMatch[1].trim() : undefined,
        text: colonMatch ? colonMatch[2].trim() : rawText,
        fullText: rawText,
      });
      continue;
    }

    // 8. Line continuation under previous subpoint or standalone paragraph
    if (
      currentSection &&
      currentSection.subPoints &&
      currentSection.subPoints.length > 0 &&
      line.length > 0 &&
      !line.endsWith(':')
    ) {
      const lastSub = currentSection.subPoints[currentSection.subPoints.length - 1];
      lastSub.text += ' ' + line;
      lastSub.fullText += ' ' + line;
    } else {
      currentSection = null;
      ast.push({ type: 'paragraph', text: line });
    }
  }

  // Post-process comparison sections
  for (const item of ast) {
    if (item.type === 'main_section' && item.subPoints && item.subPoints.length >= 2) {
      const title = item.title || '';
      const hasComparison =
        /तुलना|अंतर|विभेद|difference|compare|vs/i.test(title) ||
        item.subPoints.some((sp) => sp.text.includes('जबकि') || sp.text.includes(';'));

      if (hasComparison) {
        const cleanTitle = title
          .replace(/:/g, '')
          .replace(/में\s*तुलना|में\s*अंतर|तुलना|अंतर|विभेद/gi, '')
          .trim();

        const subjects = cleanTitle
          .split(/\s*(?:एवं|तथा|और|vs\.?|and)\s*/i)
          .map((s) => s.trim())
          .filter(Boolean);

        const itemA = subjects[0] || 'पहला घटक (Item A)';
        const itemB = subjects[1] || 'दूसरा घटक (Item B)';

        const rows: ComparisonRow[] = [];
        for (const sp of item.subPoints) {
          let valA = sp.text;
          let valB = '';

          if (sp.text.includes('जबकि')) {
            const split = sp.text.split(/,\s*जबकि\s*|जबकि\s*/);
            valA = split[0].trim();
            valB = split.slice(1).join(' ').trim();
          } else if (sp.text.includes(';')) {
            const split = sp.text.split(';');
            valA = split[0].trim();
            valB = split.slice(1).join(';').trim();
          }

          rows.push({
            aspect: sp.label || `बिंदु ${sp.subNum}`,
            valA,
            valB,
            raw: sp.fullText,
          });
        }

        item.isComparison = true;
        item.comparisonData = {
          itemA,
          itemB,
          rows,
        };
      }
    }
  }

  return ast;
}

/**
 * MainSection Component:
 * Renders hierarchical major sections (①, ②, ③) with clean textbook typography,
 * nested sub-points, and optional comparison table view.
 */
const MainSectionView: React.FC<{
  section: ASTSection;
  fontSize: 'sm' | 'base' | 'lg';
}> = ({ section, fontSize }) => {
  const [viewMode, setViewMode] = useState<'textbook' | 'table'>('textbook');

  const symbol = section.sectionSymbol || '①';
  const title = section.title || '';
  const subPoints = section.subPoints || [];
  const compData = section.comparisonData;

  return (
    <section className="space-y-3 pt-1">
      {/* Section Heading Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-pink-100/90 via-rose-50/60 to-transparent dark:from-pink-950/70 dark:via-slate-900/60 dark:to-transparent border-l-4 border-pink-600 dark:border-pink-500">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-600 dark:bg-pink-500 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-2xs">
            {symbol}
          </span>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 tracking-tight leading-snug">
            {title}
          </h3>
        </div>

        {/* Optional Comparison Table Toggle */}
        {section.isComparison && compData && (
          <div className="flex items-center gap-1 self-end sm:self-auto bg-white/90 dark:bg-slate-800 p-0.5 rounded-lg border border-pink-200/80 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setViewMode('textbook')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'textbook'
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-pink-600'
              }`}
              title="नोट्स दृश्य (Textbook View)"
            >
              <List className="w-3 h-3" />
              <span>नोट्स</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-pink-600'
              }`}
              title="तुलना सारणी (Comparison Table)"
            >
              <Table className="w-3 h-3" />
              <span>सारणी</span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode: Comparison Table */}
      {section.isComparison && compData && viewMode === 'table' ? (
        <div className="my-3 overflow-hidden rounded-2xl border border-pink-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-pink-50/90 dark:bg-pink-950/60 border-b border-pink-200 dark:border-slate-700 text-pink-950 dark:text-pink-200 font-black">
                  <th className="p-3 w-1/4 border-r border-pink-100 dark:border-slate-800">
                    तुलना का आधार (Aspect)
                  </th>
                  <th className="p-3 w-3/8 border-r border-pink-100 dark:border-slate-800">
                    {compData.itemA}
                  </th>
                  <th className="p-3 w-3/8">{compData.itemB}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {compData.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-800/40'}
                  >
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800 align-top">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-pink-100/70 dark:bg-pink-950/70 text-pink-900 dark:text-pink-300 text-[11px] font-bold">
                        {row.aspect}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800 align-top leading-relaxed">
                      {formatInlineText(row.valA || row.raw)}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 align-top leading-relaxed">
                      {formatInlineText(row.valB || '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: Clean Nested Textbook Sub-points */
        <div className="pl-2 sm:pl-3 ml-2 sm:ml-3.5 border-l-2 border-dashed border-pink-300/80 dark:border-slate-700 space-y-3">
          {subPoints.map((sub, sIdx) => (
            <div
              key={sIdx}
              className="flex items-start gap-2.5 sm:gap-3 py-1 text-slate-800 dark:text-slate-100"
            >
              {/* Clean numbered sub-point indicator: 1., 2., 3. */}
              <span className="font-mono font-bold text-xs sm:text-sm text-pink-700 dark:text-pink-400 shrink-0 mt-0.5 bg-pink-50 dark:bg-pink-950/80 px-1.5 py-0.5 rounded border border-pink-200/80 dark:border-pink-900">
                {sub.subNum}.
              </span>

              <div className="flex-1 leading-relaxed">
                {sub.label ? (
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-950 dark:text-white mr-1.5 text-pink-950 dark:text-pink-200 bg-pink-100/60 dark:bg-pink-950/50 px-1.5 py-0.5 rounded text-xs sm:text-sm inline-block border border-pink-200/50 dark:border-pink-900/50">
                      {sub.label}:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-normal">
                      {formatInlineText(sub.text)}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 font-normal">
                    {formatInlineText(sub.text)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

/**
 * Main AnswerRenderer Component:
 * Modern academic textbook layout that elegantly parses, structures, and presents
 * long answers, short answers, comparisons, formulas, and notes.
 */
export const AnswerRenderer: React.FC<AnswerRendererProps> = ({
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

  const ast = parseAnswerAST(content);

  return (
    <div
      className={`font-normal text-slate-800 dark:text-slate-200 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] ${textSizeClass} ${className}`}
    >
      {showAnswerLabel && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-100/80 dark:bg-pink-950/70 border border-pink-200 dark:border-pink-800 text-pink-900 dark:text-pink-200 font-black text-xs">
          <span className="text-pink-600 dark:text-pink-400">📖</span>
          <span>उत्तर (Answer):</span>
        </div>
      )}

      <div className="space-y-4">
        {ast.map((node, idx) => {
          // 1. Hierarchical Main Section
          if (node.type === 'main_section') {
            return <MainSectionView key={idx} section={node} fontSize={fontSize} />;
          }

          // 2. Standalone Sub-point (e.g. if raw text started directly with (i))
          if (node.type === 'standalone_sub_point') {
            return (
              <div key={idx} className="flex items-start gap-2.5 py-1 pl-1">
                <span className="font-mono font-bold text-xs text-pink-700 dark:text-pink-400 shrink-0 mt-0.5 bg-pink-50 dark:bg-pink-950/80 px-1.5 py-0.5 rounded border border-pink-200/80 dark:border-pink-900">
                  {node.subNum}.
                </span>
                <div className="flex-1 leading-relaxed">
                  {node.label ? (
                    <>
                      <strong className="font-extrabold text-pink-950 dark:text-pink-200 mr-1.5 bg-pink-100/60 dark:bg-pink-950/50 px-1.5 py-0.5 rounded text-xs sm:text-sm inline-block">
                        {node.label}:
                      </strong>
                      <span>{formatInlineText(node.text || '')}</span>
                    </>
                  ) : (
                    <span>{formatInlineText(node.text || '')}</span>
                  )}
                </div>
              </div>
            );
          }

          // 3. Numbered Point: 1., 2., 3.
          if (node.type === 'numbered_point') {
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 sm:gap-3 py-2 border-b border-dashed border-slate-200/80 dark:border-slate-800/80 last:border-b-0"
              >
                <span className="w-6 h-6 rounded-lg bg-pink-600 dark:bg-pink-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {node.num}
                </span>
                <div className="flex-1 leading-relaxed">
                  {node.label ? (
                    <>
                      <strong className="font-extrabold text-pink-950 dark:text-pink-200 mr-1.5 bg-pink-100/50 dark:bg-pink-950/40 px-1.5 py-0.5 rounded text-xs sm:text-sm inline-block">
                        {node.label}:
                      </strong>
                      <span>{formatInlineText(node.text || '')}</span>
                    </>
                  ) : (
                    <span>{formatInlineText(node.text || '')}</span>
                  )}
                </div>
              </div>
            );
          }

          // 4. Bullet Point: * or •
          if (node.type === 'bullet') {
            return (
              <div key={idx} className="flex items-start gap-2.5 py-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-400 mt-2 shrink-0 shadow-2xs" />
                <div className="flex-1 leading-relaxed">
                  {node.label ? (
                    <>
                      <strong className="font-extrabold text-slate-900 dark:text-white mr-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs sm:text-sm inline-block">
                        {node.label}:
                      </strong>
                      <span>{formatInlineText(node.text || '')}</span>
                    </>
                  ) : (
                    <span>{formatInlineText(node.text || '')}</span>
                  )}
                </div>
              </div>
            );
          }

          // 5. Formula / Equation Block
          if (node.type === 'formula') {
            return (
              <div
                key={idx}
                className="my-3 p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/90 dark:border-indigo-800/80 shadow-2xs"
              >
                <div className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Sigma className="w-3.5 h-3.5" />
                  <span>सूत्र / रासायनिक समीकरण (Formula / Equation):</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-extrabold text-indigo-950 dark:text-indigo-100 p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100 dark:border-indigo-900/60 overflow-x-auto">
                  {node.text}
                </div>
              </div>
            );
          }

          // 6. Example Block
          if (node.type === 'example') {
            return (
              <div
                key={idx}
                className="my-2.5 p-3 sm:p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 border-y border-r border-amber-200/80 dark:border-amber-800/60 shadow-2xs"
              >
                <div className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>उदाहरण (Example):</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {formatInlineText(node.text || '')}
                </p>
              </div>
            );
          }

          // 7. Note Block
          if (node.type === 'note') {
            return (
              <div
                key={idx}
                className="my-2.5 p-3 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-400 border-y border-r border-blue-200/80 dark:border-blue-800/60 shadow-2xs"
              >
                <div className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-0.5">
                  <Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>महत्वपूर्ण नोट (Important Note):</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {formatInlineText(node.text || '')}
                </p>
              </div>
            );
          }

          // 8. Regular Standard Paragraph
          return (
            <p key={idx} className="leading-relaxed py-0.5 text-slate-800 dark:text-slate-200">
              {formatInlineText(node.text || '')}
            </p>
          );
        })}
      </div>
    </div>
  );
};
