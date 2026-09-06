import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 text-white px-4 py-2.5 text-xs font-bold shadow-2xl border border-amber-500/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>ऑफलाइन मोड — कैश्ड पेपर्स और डेटा से अभ्यास जारी है।</span>
    </div>
  );
};
