import React, { useState, useEffect } from 'react';
import { getAppSettings, saveAppSettings, AppSettings } from '../utils/bookmarkStorage';
import { clearPapersCache } from '../utils/db';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { useStudentProfile } from '../context/StudentProfileContext';
import { StudentProfileModal } from '../components/profile/StudentProfileModal';
import {
  Download,
  Database,
  Github,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  BookOpen,
  Edit3,
  GraduationCap,
} from 'lucide-react';

export const More: React.FC = () => {
  const { profile } = useStudentProfile();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      message: 'स्थानीय डेटा कैश (IndexedDB) साफ़ कर दिया गया',
    });
  };

  const handleSaveRepoUrl = (url: string) => {
    setSettings((prev) => ({ ...prev, githubRepoUrl: url }));
    saveAppSettings({ githubRepoUrl: url });
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'GitHub Repo URL सहेज लिया गया',
    });
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar title="More & Settings" subtitle="विद्यार्थी प्रोफ़ाइल एवं सेटिंग्स" />

      {/* Student Profile Card */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
              {profile.avatarEmoji || '🎓'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">{profile.name || 'विद्यार्थी'}</h3>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">
                  Class {profile.classId}
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                {profile.board} • {profile.stream}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3 py-1.5 bg-white text-indigo-700 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>एडिट करें</span>
          </button>
        </div>

        {/* Selected Subjects Chips */}
        <div className="mt-3.5 pt-3 border-t border-white/20">
          <div className="text-[11px] font-bold text-indigo-100 mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> चुने गए विषय ({profile.selectedSubjects.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.selectedSubjects.map((sub) => (
              <span
                key={sub}
                className="text-[11px] font-bold bg-white/15 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-white"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PWA Banner */}
      <GlassCard variant="accent" padding="md" className="border-indigo-200 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> Web & Mobile PWA
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
              Abhyaas App इंस्टॉल करें
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              मोबाइल में एंड्रॉयड ऐप जैसा अनुभव पाने के लिए होम स्क्रीन पर जोड़ें।
            </p>
            <div className="pt-2">
              <button
                onClick={handleInstallPWA}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
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
      </GlassCard>

      {/* Settings Options */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          ऐप सेटिंग्स & कैश
        </h4>

        {/* Offline Mode Switch */}
        <GlassCard
          padding="md"
          className="flex items-center justify-between gap-3 border-slate-200/80"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                ऑफ़लाइन / लोकल कैश फ़ोर्स करें
              </h5>
              <p className="text-xs text-slate-500">
                नेटवर्क बंद होने पर केवल स्थानीय IndexedDB का उपयोग करें
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleOffline}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.offlineMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                settings.offlineMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </GlassCard>

        {/* Clear Cache */}
        <GlassCard
          padding="md"
          className="flex items-center justify-between gap-3 border-slate-200/80"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                कैश साफ़ करें (Clear Cache)
              </h5>
              <p className="text-xs text-slate-500">
                IndexedDB में सहेजे गए पेपर्स हटाकर ताजा डेटा रीलोड करें
              </p>
            </div>
          </div>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
          >
            Clear
          </button>
        </GlassCard>

        {/* GitHub Data Repository Configuration */}
        <GlassCard padding="md" className="space-y-3 border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                GitHub Repository Base URL
              </h5>
              <p className="text-xs text-slate-500">प्रश्न पत्र डेटा JSON का मुख्य स्रोत</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={settings.githubRepoUrl}
              onChange={(e) => setSettings({ ...settings, githubRepoUrl: e.target.value })}
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <button
              onClick={() => handleSaveRepoUrl(settings.githubRepoUrl)}
              className="px-3 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Save
            </button>
          </div>
        </GlassCard>
      </div>

      {/* App Architecture & Info */}
      <GlassCard
        padding="md"
        className="space-y-3 border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/50"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Future Android RoomDB Compatibility</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Abhyaas ऐप का डेटा मॉडल और Repository पैटर्न भविष्य के एंड्रॉइड (Kotlin + RoomDB) ऐप के
          साथ पूर्ण रूप से संगत है।
        </p>
        <div className="text-[11px] font-semibold text-slate-400 border-t border-slate-200/60 pt-2 flex items-center justify-between">
          <span>Abhyaas v1.0.0</span>
          <span>Made for Board Students</span>
        </div>
      </GlassCard>

      {/* Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
