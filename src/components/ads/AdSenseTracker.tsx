import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

/**
 * AdSenseTracker:
 * Single Page Application (SPA) route transition notifier for Google AdSense.
 * Notifies Google AdSense on every tab/page change so AdSense can detect
 * user navigation and trigger Vignette (Interstitial) ads and Auto Ads.
 */
export const AdSenseTracker: React.FC = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    // Only fire on route change, not initial mount if already handled
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;

      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          // Push page transition event to AdSense for SPAs
          window.adsbygoogle.push({});
        }
      } catch (err) {
        // Silently ignore adsbygoogle duplicate push errors
      }
    }
  }, [location.pathname]);

  return null;
};
