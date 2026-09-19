import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppSettings, saveAppSettings, AppSettings } from '../utils/bookmarkStorage';
import { clearAllAppCache, getCacheStats, CacheStats } from '../utils/db';
import { syncAllFreshData, SyncProgress, SyncResult } from '../services/syncService';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { useStudentProfile } from '../context/StudentProfileContext';
import { Badges } from '../components/dashboard/Badges';
import { BrandLogo } from '../components/ui/BrandLogo';
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
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Sparkles,
  CloudDownload,
  Bell,
  Volume2,
  Share2,
} from 'lucide-react';
import { shareToSocial } from '../utils/shareUtils';
import { useNotifications } from '../context/NotificationContext';
import { NotificationCenterModal } from '../components/notifications/NotificationCenterModal';

export const More: React.FC = () => {
  const { profile, setClassId, openProfileModal, currentUser } = useStudentProfile();
  const { notifications, unreadCount, isPermissionGranted, requestPermission, isSupported } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRequestingNotif, setIsRequestingNotif] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats>({ paperCount: 0, estimatedSizeMB: 0 });
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (e) {
      console.warn('Failed to load cache stats:', e);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

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

  const handleShareApp = async () => {
    const res = await shareToSocial({
      title: 'अभ्यास (Abhyaas PYQ) - बिहार बोर्ड परीक्षा तैयारी ऐप',
      text: '📚 *बिहार बोर्ड 10वीं और 12वीं परीक्षा की बेहतरीन तैयारी!*\n\n✨ सॉल्व्ड पिछले वर्षों के प्रश्न (PYQ 2018-2025)\n📖 सभी विषयों के डिजिटल रिवीजन नोट्स व महत्वपूर्ण प्रश्न\n⚡ फ्री OMR आधारित रियल टाइम मॉक टेस्ट जनरेटर\n\n📲 *अभी अभ्यास ऐप खोलें और पढ़ाई शुरू करें:*',
    });
    if (res.success) {
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: res.method === 'native' ? 'ऐप लिंक शेयर किया गया!' : 'ऐप लिंक कॉपी हो गया: https://abhyaaspyq.in',
      });
    }
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

  const executeClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearAllAppCache();
      setCacheStats({ paperCount: 0, estimatedSizeMB: 0 });
      await loadCacheStats();
      setShowClearConfirmModal(false);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'कैश और ऑफलाइन डेटा सफलतापूर्वक साफ़ कर दिया गया!',
      });
    } catch (err) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'कैश साफ़ करने में समस्या आई, कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleSyncFresh = async (syncAll: boolean = false) => {
    setIsSyncing(true);
    setShowSyncModal(true);
    setSyncResult(null);

    const targetClass = profile.classId || '12';
    const selectedSubs = profile.selectedSubjects || [];

    setSyncProgress({
      stage: 'checking',
      message: syncAll
        ? 'सर्वर से सभी विषयों का डेटा चेक हो रहा है...'
        : `Class ${targetClass} • ${selectedSubs.length} चुने हुए विषयों का डेटा चेक हो रहा है...`,
      percent: 5,
    });

    try {
      // 1. Wipe stale cache first
      await clearAllAppCache();

      // 2. Perform fresh live sync filtered by student's selected subjects
      const res = await syncAllFreshData(
        (progress) => {
          setSyncProgress(progress);
        },
        {
          classId: targetClass,
          selectedSubjects: selectedSubs,
          syncAll,
        }
      );

      setSyncResult(res);
      await loadCacheStats();

      if (res.success) {
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: res.isFilteredBySubjects
            ? `सिंक सफल! आपके ${selectedSubs.length} विषयों के ${res.papersSynced} पेपर्स ऑफ़लाइन सहेज लिए गए।`
            : `डेटा सिंक सफल! कुल ${res.papersSynced} पेपर्स और ${res.notesSynced} नोट्स उपलब्ध हैं।`,
        });
      }
    } catch (err) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'डेटा सिंक में समस्या आई, कृपया इंटरनेट कनेक्शन जांचें।',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar title="More & Settings" subtitle="विद्यार्थी प्रोफ़ाइल एवं सेटिंग्स" />

      {/* Student Profile Card - Clean Material 3 Surface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-900 shrink-0 overflow-hidden shadow-2xs">
              {profile.photoURL || currentUser?.photoURL ? (
                <img
                  src={profile.photoURL || currentUser?.photoURL}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                profile.avatarEmoji || '🎓'
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {profile.name || currentUser?.displayName || 'विद्यार्थी'}
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

      {/* Student Virtual Badges & Achievements (Single Consolidated Card) */}
      <Badges />

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

          <div className="w-20 shrink-0 flex items-center justify-center">
            <BrandLogo
              size={72}
              rounded="rounded-2xl"
              className="border border-slate-200/80 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Settings & Cache Management */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          ऐप सेटिंग्स & स्टोरेज (Settings & Storage)
        </h4>

        {/* Push Notifications & Study Reminders Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 relative">
              <Bell className="w-5 h-5 text-amber-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  स्टडी अलर्ट व दैनिक रिमाइंडर्स
                </h5>
                {isPermissionGranted ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Active ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Off
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Class {profile.classId} के नए पेपर्स, नोट्स या परीक्षा टिप्स आते ही तुरंत सूचना पाएं
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              अलर्ट्स देखें ({notifications.length || unreadCount})
            </button>

            {!isPermissionGranted && isSupported && (
              <button
                type="button"
                onClick={async () => {
                  setIsRequestingNotif(true);
                  await requestPermission();
                  setIsRequestingNotif(false);
                }}
                disabled={isRequestingNotif}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isRequestingNotif ? 'सक्रिय हो रहा...' : 'चालू करें'}</span>
              </button>
            )}
          </div>
        </div>

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

        {/* Dedicated Cache Clear & Storage Management Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-900/50">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                  कैश एवं स्टोरेज (Cache & Storage)
                </h5>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {cacheStats.paperCount} पेपर्स • ~{cacheStats.estimatedSizeMB} MB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                ऑफलाइन डाउनलोड किए गए प्रश्न पत्र, उत्तर और अस्थायी फाइलें। नया व अद्यतन डेटा लोड करने के लिए कैश साफ़ करें।
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowClearConfirmModal(true)}
                disabled={isClearingCache || isSyncing}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isClearingCache ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>कैश साफ़ करें (Clear Cache)</span>
              </button>

              <button
                onClick={() => handleSyncFresh(false)}
                disabled={isClearingCache || isSyncing}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>चुने हुए विषय सिंक करें (Fast Sync)</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>केवल आपके <strong>Class {profile.classId}</strong> के {profile.selectedSubjects?.length || 0} विषय सिंक होंगे (डेटा व समय की बचत)</span>
              </p>

              <button
                onClick={() => handleSyncFresh(true)}
                disabled={isClearingCache || isSyncing}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline decoration-slate-300 underline-offset-2 cursor-pointer transition-colors"
                title="सभी क्लास और विषयों के कुल पेपर्स ऑफलाइन डाउनलोड करें"
              >
                सभी विषय सिंक करें (All Subjects)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Share App with Classmates Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-amber-300" /> अपने दोस्तों की मदद करें
            </span>
            <h4 className="text-base sm:text-lg font-black leading-snug">
              मित्रों के साथ अभ्यास ऐप शेयर करें
            </h4>
            <p className="text-xs text-blue-100 max-w-sm">
              कक्षा 10वीं व 12वीं के साथियों के साथ फ्री PYQ, नोट्स और मॉक टेस्ट शेयर करें।
            </p>
          </div>

          <button
            onClick={handleShareApp}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-700 active:scale-95 transition-all font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>ऐप लिंक शेयर करें</span>
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

      {/* Sync Progress Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  syncResult?.success
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                    : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                }`}
              >
                {syncResult?.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : isSyncing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <CloudDownload className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {syncResult?.success ? 'सिंक्रोनाइज़ेशन सफल!' : 'नया डेटा सिंक हो रहा है'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {syncProgress?.message || 'डेटा की जांच की जा रही है...'}
                </p>
              </div>
            </div>

            {/* Selected Subjects Banner in Modal */}
            {profile.selectedSubjects && profile.selectedSubjects.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-2.5 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>सिंक हो रहे विषय (Class {profile.classId}):</span>
                  </span>
                  <span className="text-blue-700 dark:text-blue-400 text-[10px]">
                    {syncResult?.isFilteredBySubjects ? `${profile.selectedSubjects.length} विषय` : 'सभी विषय'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.selectedSubjects.map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>प्रगति (Progress)</span>
                <span>{syncProgress?.percent || 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    syncResult?.success
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}
                  style={{ width: `${syncProgress?.percent || 0}%` }}
                />
              </div>
            </div>

            {/* Sync Summary Counters */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">पेपर्स</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {syncProgress?.papersCount ?? cacheStats.paperCount}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">नोट्स</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {syncProgress?.notesCount ?? (syncResult?.notesSynced || 0)}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">सिलेबस</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {syncProgress?.syllabusCount ?? (syncResult?.syllabusSynced || 0)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSyncModal(false);
                  if (syncResult?.success) {
                    window.location.reload();
                  }
                }}
                disabled={isSyncing}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isSyncing
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs active:scale-95'
                }`}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>कृपया प्रतीक्षा करें...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>पूर्ण (Done)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cache Confirmation Dialog Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  कैश साफ़ करें? (Clear Cache)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  सहेजे गए {cacheStats.paperCount} पेपर्स (~{cacheStats.estimatedSizeMB} MB) हटेंगे
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 space-y-2.5 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>आपकी प्रोफ़ाइल (नाम, कक्षा, स्ट्रीम), बुकमार्क और टेस्ट स्कोर सुरक्षित रहेंगे।</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>केवल ऑफलाइन फाइलों का कैश साफ़ होगा ताकि नए जोड़े गए प्रश्न पत्र और उत्तर सीधे ऑनलाइन से लोड हो सकें।</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                disabled={isClearingCache}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={executeClearCache}
                disabled={isClearingCache}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-2xs"
              >
                {isClearingCache ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>साफ़ हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हाँ, कैश साफ़ करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};
