import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * Content Protection & Anti-Piracy Layer for Abhyaas App
 * Provides:
 * 1. Print Protection: Blurs/hides sensitive questions and notes when user attempts Ctrl+P / window.print
 * 2. Shortcut Protection: Intercepts Ctrl+P, Ctrl+S, Ctrl+U, and PrintScreen key
 * 3. Context Menu & Selection Guard: Prevents bulk copying/scraping of questions and notes
 * 4. Anti-Piracy Watermark: Discreet security watermark on questions & notes
 */
export const ContentProtection: React.FC = () => {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Keyboard shortcuts guard (Print, Save, View Source, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        showWarning('सामग्री सुरक्षा: अभ्यास ऐप पर अध्ययन सामग्री सीधे ऐप में पढ़ने के लिए सुरक्षित है।');
        return;
      }

      // Ctrl+S / Cmd+S (Save page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showWarning('सामग्री सुरक्षा: पेज सेविंग प्रतिबंधित है।');
        return;
      }

      // Ctrl+U / Cmd+U (View source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return;
      }

      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        showWarning('स्क्रीनशॉट सुरक्षा: सामग्री कॉपीराइट संरक्षित है। आधिकारिक ऐप: abhyaaspyq.in');
        // Clear clipboard if browser allows
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText('अभ्यास (Abhyaas) - आधिकारिक अध्ययन पोर्टल: https://abhyaaspyq.in').catch(() => {});
        }
      }
    };

    // 2. Prevent right-click context menu on protected areas
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('.protect-content, .notes-reading-area, .question-card-body')) {
        e.preventDefault();
        showWarning('सामग्री सुरक्षित है। प्रश्न या नोट्स साझा करने के लिए ऊपर दिए गए "Share" बटन का उपयोग करें।');
      }
    };

    // 3. Prevent copy event on protected areas
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString();
      const target = (e.target as HTMLElement) || document.activeElement;
      if (target?.closest('.protect-content, .notes-reading-area')) {
        e.preventDefault();
        // Replace with watermark attribution
        if (e.clipboardData) {
          e.clipboardData.setData(
            'text/plain',
            `📖 अभ्यास (Abhyaas App) - बिहार बोर्ड 10वीं व 12वीं PYQ एवं नोट्स\nhttps://abhyaaspyq.in\n\n${selection ? selection.slice(0, 80) + '... (पूरा पढ़ने के लिए ऐप खोलें)' : ''}`
          );
        }
        showWarning('सामग्री कॉपीराइट सुरक्षित है। शेयर करने के लिए आधिकारिक Share बटन का उपयोग करें।');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage(null);
    }, 3500);
  };

  return (
    <>
      {/* Print Shield Style Sheet */}
      <style>{`
        @media print {
          /* Hide question answers and notes when printed */
          .protect-content, .notes-reading-area, .solution-box, .question-answer {
            display: none !important;
          }
          body::before {
            content: "अभ्यास (Abhyaas PYQ) - यह अध्ययन सामग्री कॉपीराइट सुरक्षित है। आधिकारिक वेबसाइट: https://abhyaaspyq.in";
            display: block;
            font-size: 18pt;
            text-align: center;
            padding: 40px;
            color: #1e293b;
            font-weight: bold;
          }
        }
        /* Anti-selection on protected study cards */
        .protect-content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
      `}</style>

      {/* Security Toast Warning Banner */}
      {warningMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-slate-900/95 text-white border border-amber-500/40 shadow-2xl rounded-2xl p-3.5 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <span>अभ्यास सामग्री सुरक्षा (Content Protection)</span>
            </p>
            <p className="text-xs text-slate-200 mt-0.5 leading-snug">{warningMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Subtle Security Watermark Component to render over sensitive notes/questions
 */
export const SecurityWatermark: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden opacity-[0.035] dark:opacity-[0.045] flex items-center justify-center z-0"
    >
      <div className="transform -rotate-12 whitespace-nowrap text-center space-y-12">
        <p className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
          {label || 'ABHYAAS PYQ • ABHYAASPYQ.IN'}
        </p>
        <p className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
          अनाधिकृत प्रतिलिपि प्रतिबंधित • OFFICIAL APP
        </p>
        <p className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
          {label || 'ABHYAAS PYQ • ABHYAASPYQ.IN'}
        </p>
      </div>
    </div>
  );
};
