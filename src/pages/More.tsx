import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppSettings, saveAppSettings, AppSettings } from '../utils/bookmarkStorage';
import { clearPapersCache } from '../utils/db';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { useStudentProfile } from '../context/StudentProfileContext';
import {
  Download,
  Wifi,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  BookOpen,
  Edit3,
  Heart,
  Code2,
  GraduationCap,
  FileText,
  Mail,
  ChevronRight,
} from 'lucide-react';

export const More: React.FC = () => {
  const { profile, setClassId, openProfileModal } = useStudentProfile();
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'ऐप पहले से इंस्टॉल है या आपका ब्राउज़र इसे सपोर्ट करता है।',
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Abhyaas ऐप सफलतापूर्वक इंस्टॉल हो गया!',
      });
    }
    setDeferredPrompt(null);
  };

  const handleToggleOffline = () => {
    const updated = !settings.offlineMode;
    setSettings((prev) => ({ ...prev, offlineMode: updated }));
    saveAppSettings({ offlineMode: updated });
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: updated ? 'ऑफलाइन मोड चालू किया गया' : 'ऑनलाइन सिंक्रोनाइज़ेशन चालू है',
    });
  };

  const handleClearCache = async () => {
    await clearPapersCache();
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'नवीनतम प्रश्न पत्र सफलतापूर्वक अपडेट हो गए!',
    });
  };

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar title="More & Settings" subtitle="विद्यार्थी प्रोफ़ाइल एवं सेटिंग्स" />

      {/* Student Profile Card - Clean Material 3 Surface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-900 shrink-0">
              {profile.avatarEmoji || '🎓'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {profile.name || 'विद्यार्थी'}
                </h3>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-900 px-2 py-0.5 rounded-full shrink-0">
                  Class {profile.classId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {profile.board} • {profile.stream}
              </p>
            </div>
          </div>

          <button
            onClick={openProfileModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>एडिट करें</span>
          </button>
        </div>

        {/* Selected Subjects Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" /> चुने गए विषय ({profile.selectedSubjects.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.selectedSubjects.map((sub) => (
              <span
                key={sub}
                className="text-[11px] font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Class Switcher in Settings (Material 3 Surface Card) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                कक्षा बदलें (Select Class)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                अपनी वर्तमान बोर्ड कक्षा चुनें
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-900 px-2.5 py-1 rounded-full">
            सक्रिय: Class {profile.classId}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: '10', label: 'Class 10', sub: '10वीं बोर्ड', emoji: '🎒' },
            { id: '11', label: 'Class 11', sub: '11वीं', emoji: '📚' },
            { id: '12', label: 'Class 12', sub: '12वीं बोर्ड', emoji: '🎓' },
          ].map((cls) => {
            const isSelected = profile.classId === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => {
                  setClassId(cls.id);
                  setToast({
                    id: Date.now().toString(),
                    type: 'success',
                    message: `कक्षा ${cls.id} चुनी गई!`,
                  });
                }}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white font-black shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl mb-1">{cls.emoji}</span>
                <span className="text-xs font-bold">{cls.label}</span>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {cls.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PWA Banner - Clean high-contrast card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
              <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Web & Mobile PWA
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Abhyaas App इंस्टॉल करें
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
              मोबाइल में एंड्रॉयड ऐप जैसा अनुभव पाने के लिए होम स्क्रीन पर जोड़ें।
            </p>
            <div className="pt-2">
              <button
                onClick={handleInstallPWA}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isInstallable ? 'होम स्क्रीन पर जोड़ें (Install)' : 'PWA Ready'}</span>
              </button>
            </div>
          </div>

          <div className="w-20 shrink-0">
            <Illustration name="welcome" size={75} />
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          ऐप सेटिंग्स & कैश
        </h4>

        {/* Offline Mode Switch */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
                बिना इंटरनेट (ऑफलाइन) पढ़ें
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                इंटरनेट न होने पर भी सहेजे गए पेपर्स से अभ्यास जारी रखें
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleOffline}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              settings.offlineMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                settings.offlineMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Sync / Refresh Data */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
                नए प्रश्न पत्र अपडेट करें
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                नवीनतम पेपर्स और उत्तर तुरंत रीलोड करें
              </p>
            </div>
          </div>
          <button
            onClick={handleClearCache}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all shadow-2xs shrink-0"
          >
            अपडेट करें
          </button>
        </div>
      </div>

      {/* Policies & Support (Crucial for AdSense approval) */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          विधिक एवं सहायता (Legal & Support)
        </h4>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <Link
            to="/privacy-policy"
            className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Privacy Policy (गोपनीयता नीति)
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AdSense कुकीज़, डेटा सुरक्षा और उपयोगकर्ता नियम
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </Link>

          <Link
            to="/contact"
            className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Contact Us (हमसे संपर्क करें)
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  सुझाव, प्रश्न सुधार या सहायता: jhadheeraj97@gmail.com
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </Link>
        </div>
      </div>

      {/* App Info & Developer Credit */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>सुरक्षित एवं प्रामाणिक बोर्ड परीक्षा तैयारी</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          अभ्यास ऐप बिहार बोर्ड एवं अन्य राज्य बोर्ड के विद्यार्थियों को मॉडल पेपर्स एवं पिछले वर्षों के हल प्रश्न पत्र निशुल्क उपलब्ध कराता है।
        </p>

        {/* Developer Credit */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Developed with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> by</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dheeraj Jha</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Abhyaas v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
