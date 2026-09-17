import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LogIn,
  ShieldCheck,
  Cloud,
  Award,
  BookMarked,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { BrandLogo } from '../ui/BrandLogo';

const DISMISS_KEY = 'abhyaas_login_prompt_dismissed_at';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const hasDismissedLoginPromptRecently = (): boolean => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const timestamp = parseInt(raw, 10);
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
};

export const recordLoginPromptDismissal = (): void => {
  try {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  } catch (err) {
    console.warn('Failed to save login dismissal state:', err);
  }
};

export const LoginPromptModal: React.FC = () => {
  const {
    isLoginPromptOpen,
    closeLoginPrompt,
    currentUser,
    signInWithGoogle,
    isSyncing,
  } = useStudentProfile();

  const [dontShowForDay, setDontShowForDay] = useState(true);

  // If user is already authenticated or modal is closed, do not render
  if (currentUser || !isLoginPromptOpen) {
    return null;
  }

  const handleDismiss = () => {
    if (dontShowForDay) {
      recordLoginPromptDismissal();
    }
    closeLoginPrompt();
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="login-prompt-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        onClick={handleDismiss}
      >
        <motion.div
          id="login-prompt-card"
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        >
          {/* Top Decorative Header */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-5 sm:p-6 overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/15 rounded-full blur-xl pointer-events-none -ml-12 -mb-12" />

            {/* Close Button */}
            <button
              type="button"
              id="close-login-prompt-btn"
              onClick={handleDismiss}
              aria-label="बंद करें"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white/90 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20 z-10 shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 flex items-start gap-3.5">
              <div className="shrink-0 p-2 bg-white/15 rounded-2xl border border-white/20 backdrop-blur-md shadow-xs">
                <BrandLogo size={36} rounded="rounded-xl" showShadow={false} />
              </div>

              <div className="min-w-0 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>स्मार्ट सिंक व सुरक्षित डेटा</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  अपनी पढ़ाई और टेस्ट रिकॉर्ड सुरक्षित रखें! 🚀
                </h3>
                <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                  लॉगिन करने से आपके सभी टेस्ट स्कोर, OMR शीट, और गलतियों की नोटबुक किसी भी डिवाइस पर कभी गायब नहीं होंगी।
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="space-y-2.5">
              {/* Benefit 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                    क्लाउड बैकअप व ऑटो-सिंक (Cloud Backup)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    मोबाइल बदलने या ब्राउज़र डेटा साफ़ होने पर भी आपकी तैयारी और टेस्ट इतिहास 100% सुरक्षित रहता है।
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                    स्टेट व क्लास रैंकिंग (Live Leaderboard)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    बिहार बोर्ड के अन्य लाखों छात्रों के बीच अपनी एक्यूरेसी, स्पीड और राज्य स्तरीय रैंक देखें।
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                    सहेजे गए प्रश्न व गलती डायरी (Mistake Notebook)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    कठिन सवाल और रिवीज़न नोट्स किसी भी फोन या कंप्यूटर से एक क्लिक में खोलें।
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* 1-Click Google Sign In */}
              <button
                type="button"
                id="modal-google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isSyncing}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <LogIn className="w-4 h-4 text-amber-300" />
                )}
                <span>
                  {isSyncing ? 'कनेक्ट किया जा रहा है...' : 'Google से 1-क्लिक में लॉगिन करें'}
                </span>
              </button>

              {/* Skip / Continue studying */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <input
                    type="checkbox"
                    checked={dontShowForDay}
                    onChange={(e) => setDontShowForDay(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>आज दोबारा न दिखाएं</span>
                </label>

                <button
                  type="button"
                  id="modal-skip-login-btn"
                  onClick={handleDismiss}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer py-1 px-2"
                >
                  <span>सीधे अभ्यास करें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Reassurance Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% मुफ़्त एवं सुरक्षित • बिना लॉगिन के भी सभी पेपर्स पढ़ सकते हैं</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
