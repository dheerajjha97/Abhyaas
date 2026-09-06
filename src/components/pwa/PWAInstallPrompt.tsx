import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, CheckCircle } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running inside standalone PWA mode or user dismissed this session
  if (isInstalled || dismissed) {
    return null;
  }

  // Only show if installable on Android/Desktop or on iOS device
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3 sm:p-3.5 rounded-2xl shadow-lg border border-white/20 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo size={44} rounded="rounded-xl" className="border border-white/30 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide uppercase bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  PWA Ready
                </span>
                <span className="text-xs font-bold truncate">Abhyaas App</span>
              </div>
              <p className="text-[11px] text-blue-100 line-clamp-1 mt-0.5">
                {isIOS
                  ? 'Safari से होम स्क्रीन पर जोड़ें और फुलस्क्रीन में पढ़ें'
                  : 'ऐप डाउनलोड किए बिना होम स्क्रीन पर इंस्टॉल करें'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="px-3.5 py-1.5 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>इंस्टॉल</span>
              </button>
            )}

            {isIOS && (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone पर जोड़ें</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  📱
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  iPhone / iPad पर जोड़ें
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  सफारी (Safari) ब्राउज़र में नीचे दिए गए <strong>Share (शेयर)</strong> आइकन पर टैप करें।
                </span>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  नीचे स्क्रॉल करें और <strong>"Add to Home Screen" (होम स्क्रीन में जोड़ें)</strong> चुनें।
                </span>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </span>
                <span>
                  ऊपर <strong>"Add"</strong> पर क्लिक करें। Abhyaas ऐप आपके होम स्क्रीन पर ऐप की तरह खुल जाएगा!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
            >
              समझ गया (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
