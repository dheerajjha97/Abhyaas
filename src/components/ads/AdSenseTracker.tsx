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
 * Safely notifies Google AdSense on route changes without duplicate tag errors.
 */
export const AdSenseTracker: React.FC = () => {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;

      try {
        if (typeof window !== 'undefined' && window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          // Wrap push in safe try-catch
          window.adsbygoogle.push({});
        }
      } catch {
        // Silently handle any push or TagErrors in dev/strict environments
      }
    }
  }, [location.pathname]);

  return null;
};

