import React, { useState } from 'react';
import { LogIn, Sparkles, X, Cloud, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';

export const LoginReminderBanner: React.FC = () => {
  const { currentUser, openLoginPrompt, signInWithGoogle, isSyncing } = useStudentProfile();
  const [isDismissed, setIsDismissed] = useState(false);

  // If user is already logged in or dismissed for this session, don't show
  if (currentUser || isDismissed) {
    return null;
  }

  return (
    <div
      id="dashboard-login-reminder-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-3.5 sm:p-4 text-white shadow-md border border-blue-500/30"
    >
      {/* Decorative background blur shapes */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Info & Pitch */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-xs text-amber-300 mt-0.5 sm:mt-0">
            <Sparkles className="w-5 h-5 fill-amber-300" />
          </div>

          <div className="min-w-0 pr-6 sm:pr-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                अपनी पढ़ाई और टेस्ट रिकॉर्ड सुरक्षित रखें! 🚀
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                1-Click Sign In
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5 line-clamp-2 leading-relaxed">
              Google लॉगिन करने से आपके सभी टेस्ट स्कोर, OMR परिणाम, बुकमार्क और स्टेट रैंक क्लाउड में सुरक्षित रहेंगे।
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            id="banner-signin-btn"
            onClick={openLoginPrompt}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-slate-900 text-xs font-black shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600" />
            <span>लॉगिन करें</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>

          <button
            type="button"
            id="dismiss-login-banner-btn"
            onClick={() => setIsDismissed(true)}
            aria-label="यह बैनर छुपाएं"
            title="छुपाएं"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
