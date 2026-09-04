import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = 'auto',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current && !isLoadedRef.current) {
        window.adsbygoogle.push({});
        isLoadedRef.current = true;
      }
    } catch (err) {
      // Ignore adsbygoogle push errors
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden my-3 flex justify-center items-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '60px' }}
        data-ad-client="ca-pub-9893073369641658"
        data-ad-slot={slotId || ''}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
