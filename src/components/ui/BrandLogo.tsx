import React, { useState, useId } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  rounded?: string;
  showShadow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  rounded = 'rounded-2xl',
  showShadow = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const rawId = useId();
  // Sanitize ID for valid SVG id references
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  // Determine pixel dimension based on size preset or numeric value
  let pixelSize = 44;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'xs':
        pixelSize = 24;
        break;
      case 'sm':
        pixelSize = 32;
        break;
      case 'md':
        pixelSize = 44;
        break;
      case 'lg':
        pixelSize = 72;
        break;
      case 'xl':
        pixelSize = 96;
        break;
      default:
        pixelSize = 44;
    }
  }

  const shadowClass = showShadow ? 'shadow-md shadow-blue-900/20' : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none ${rounded} ${shadowClass} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        minWidth: pixelSize,
        minHeight: pixelSize,
      }}
    >
      {!imgFailed ? (
        <img
          src="/pwa-192x192.png?v=4"
          srcSet="/pwa-192x192.png?v=4 1x, /pwa-512x512.png?v=4 2x"
          alt="Abhyaas Logo"
          width={pixelSize}
          height={pixelSize}
          className="w-full h-full object-cover select-none pointer-events-none block"
          loading="eager"
          decoding="sync"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <defs>
            {/* Background Gradients */}
            <linearGradient id={`bgGrad_${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1e7eff" />
              <stop offset="45%" stopColor="#0b63f6" />
              <stop offset="100%" stopColor="#004cd8" />
            </linearGradient>

            <radialGradient id={`topGlow_${uid}`} cx="50%" cy="15%" r="65%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0b63f6" stopOpacity="0" />
            </radialGradient>

            {/* Drop Shadows */}
            <filter id={`softShadow_${uid}`} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#002b80" floodOpacity="0.42" />
            </filter>
            <filter id={`badgeShadow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#00246b" floodOpacity="0.45" />
            </filter>
            <filter id={`paperShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#002b80" floodOpacity="0.3" />
            </filter>

            {/* Paper Gradients */}
            <linearGradient id={`paperGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#edf2f7" />
            </linearGradient>

            {/* Book Page 3D Gradients */}
            <linearGradient id={`bookPageLeft_${uid}`} x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="25%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id={`bookPageRight_${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="25%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id={`bookUnderLeft_${uid}`} x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id={`bookUnderRight_${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Book Base Rim Gradient */}
            <linearGradient id={`bookBaseRim_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <linearGradient id={`bookBaseLip_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0052cc" />
              <stop offset="100%" stopColor="#002d80" />
            </linearGradient>

            {/* Pencil Gradients */}
            <linearGradient id={`pencilEraser_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id={`pencilMetalLight_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="35%" stopColor="#e0e7ff" />
              <stop offset="70%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id={`pencilFacet1_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id={`pencilFacet2_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id={`pencilFacet3_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id={`pencilWood_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="60%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>

            {/* Green Badge & Check Gradient */}
            <linearGradient id={`greenBadgeGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="60%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <radialGradient id={`greenBadgeGlow_${uid}`} cx="40%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#86efac" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={`miniGreenGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>

            {/* Sparkle Ray Gradient */}
            <linearGradient id={`sparkleGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Base Blue Background Canvas */}
          <rect width="512" height="512" fill={`url(#bgGrad_${uid})`} />
          <rect width="512" height="512" fill={`url(#topGlow_${uid})`} />

          {/* ==================== YELLOW SPARKLE RAYS ==================== */}
          <g transform="translate(136, 185) rotate(-32)">
            <rect x="-8" y="-22" width="16" height="36" rx="8" fill={`url(#sparkleGrad_${uid})`} />
          </g>
          <g transform="translate(134, 218) rotate(12)">
            <rect x="-7" y="-18" width="14" height="32" rx="7" fill={`url(#sparkleGrad_${uid})`} />
          </g>

          <g transform="translate(355, 172) rotate(32)">
            <rect x="-8" y="-22" width="16" height="36" rx="8" fill={`url(#sparkleGrad_${uid})`} />
          </g>
          <g transform="translate(370, 202) rotate(68)">
            <rect x="-7" y="-18" width="14" height="32" rx="7" fill={`url(#sparkleGrad_${uid})`} />
          </g>

          {/* ==================== OPEN BOOK BASE (BOTTOM) ==================== */}
          <g filter={`url(#softShadow_${uid})`}>
            {/* Blue Book Cover Base */}
            <path
              d="M 116 345
                 C 180 348 230 358 256 368
                 C 282 358 332 348 396 345
                 C 406 345 414 353 414 363
                 L 410 384
                 C 408 392 400 398 390 399
                 C 334 406 280 406 256 414
                 C 232 406 178 406 122 399
                 C 112 398 104 392 102 384
                 L 98 363
                 C 98 353 106 345 116 345 Z"
              fill={`url(#bookBaseLip_${uid})`}
            />

            {/* Cyan/Sky Accent Rim on Book Base */}
            <path
              d="M 102 376
                 C 156 384 212 386 256 394
                 C 300 386 356 384 410 376
                 C 413 378 414 382 411 385
                 C 356 397 302 398 256 406
                 C 210 398 156 397 101 385
                 C 98 382 99 378 102 376 Z"
              fill={`url(#bookBaseRim_${uid})`}
              opacity="0.9"
            />

            {/* Underneath Page Layers */}
            <path
              d="M 112 342 C 165 336 220 344 254 356 L 254 374 C 220 362 165 354 112 360 Z"
              fill={`url(#bookUnderLeft_${uid})`}
            />
            <path
              d="M 258 356 C 292 344 347 336 400 342 L 400 360 C 347 354 292 362 258 374 Z"
              fill={`url(#bookUnderRight_${uid})`}
            />

            {/* Main Open Top White Pages */}
            <path
              d="M 114 336
                 C 165 328 220 336 254 348
                 L 254 365
                 C 220 353 165 345 114 353 Z"
              fill={`url(#bookPageLeft_${uid})`}
            />
            <path
              d="M 258 348
                 C 292 336 347 328 398 336
                 L 398 353
                 C 347 345 292 353 258 365 Z"
              fill={`url(#bookPageRight_${uid})`}
            />

            {/* Book Center Seam Shadow */}
            <path d="M 254 348 L 258 348 L 258 365 L 254 365 Z" fill="#94a3b8" />
          </g>

          {/* ==================== FLOATING TEST PAPER / QUIZ SHEET ==================== */}
          <g filter={`url(#paperShadow_${uid})`}>
            {/* White Paper Body with Curved Corner Fold */}
            <path
              d="M 160 134
                 C 151 134 144 141 144 150
                 L 144 330
                 C 144 339 151 346 160 346
                 L 326 346
                 C 335 346 342 339 342 330
                 L 342 178
                 C 342 173 340 169 337 165
                 L 311 139
                 C 307 136 303 134 298 134
                 Z"
              fill={`url(#paperGrad_${uid})`}
            />

            {/* Folded Corner Flap */}
            <path
              d="M 294 134 L 294 162 C 294 172 302 180 312 180 L 342 180 Z"
              fill="#cbd5e1"
              opacity="0.6"
            />
            <path
              d="M 294 134 L 342 180 L 314 180 C 303 180 294 171 294 160 Z"
              fill="#f1f5f9"
            />

            {/* Test Paper Content */}
            {/* ROW 1: Solved Item */}
            <g transform="translate(176, 172)">
              <circle cx="15" cy="15" r="15" fill={`url(#miniGreenGrad_${uid})`} />
              <path
                d="M 9 15 L 13 19 L 21 11"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="42" y="9" width="84" height="12" rx="6" fill="#8e9daf" />
            </g>

            {/* ROW 2: Empty Option 1 */}
            <g transform="translate(176, 215)">
              <circle cx="15" cy="15" r="13.5" fill="#ffffff" stroke="#8e9daf" strokeWidth="3" />
              <rect x="42" y="9" width="100" height="12" rx="6" fill="#8e9daf" />
            </g>

            {/* ROW 3: Empty Option 2 */}
            <g transform="translate(176, 258)">
              <circle cx="15" cy="15" r="13.5" fill="#ffffff" stroke="#8e9daf" strokeWidth="3" />
              <rect x="42" y="9" width="80" height="12" rx="6" fill="#8e9daf" />
            </g>

            {/* ROW 4: Empty Option 3 */}
            <g transform="translate(176, 301)">
              <circle cx="15" cy="15" r="13.5" fill="#ffffff" stroke="#8e9daf" strokeWidth="3" />
              <rect x="42" y="9" width="60" height="12" rx="6" fill="#8e9daf" />
            </g>
          </g>

          {/* ==================== 3D STYLIZED PENCIL ==================== */}
          <g transform="translate(330, 275) rotate(38)" filter={`url(#softShadow_${uid})`}>
            <g transform="translate(-16, -110)">
              {/* Pink Eraser Top */}
              <path
                d="M 6 4 C 6 -6 26 -6 26 4 L 26 24 L 6 24 Z"
                fill={`url(#pencilEraser_${uid})`}
              />
              <ellipse cx="16" cy="4" rx="10" ry="4" fill="#fda4af" opacity="0.4" />

              {/* Metallic / Blue Ferrule Band */}
              <rect x="5" y="24" width="22" height="20" rx="2" fill={`url(#pencilMetalLight_${uid})`} />
              <line x1="5" y1="31" x2="27" y2="31" stroke="#4338ca" strokeWidth="1.5" opacity="0.6" />
              <line x1="5" y1="37" x2="27" y2="37" stroke="#4338ca" strokeWidth="1.5" opacity="0.6" />
              <rect x="8" y="24" width="5" height="20" fill="#ffffff" opacity="0.5" />

              {/* Yellow Hexagonal Pencil Body */}
              <rect x="6" y="44" width="7" height="115" fill={`url(#pencilFacet1_${uid})`} />
              <rect x="13" y="44" width="9" height="115" fill={`url(#pencilFacet2_${uid})`} />
              <rect x="22" y="44" width="4" height="115" fill={`url(#pencilFacet3_${uid})`} />

              {/* Wood Cone Tip */}
              <polygon points="6,159 26,159 16,198" fill={`url(#pencilWood_${uid})`} />
              <path d="M 6,159 Q 11,162 16,159 Q 21,162 26,159 L 16,198 Z" fill={`url(#pencilWood_${uid})`} />

              {/* Dark Graphite Lead Tip */}
              <polygon points="13,186 19,186 16,198" fill="#0f172a" />
            </g>
          </g>

          {/* ==================== FLOATING GREEN CHECKMARK BADGE ==================== */}
          <g transform="translate(362, 350)" filter={`url(#badgeShadow_${uid})`}>
            <circle cx="0" cy="0" r="48" fill="#ffffff" />
            <circle cx="0" cy="0" r="40" fill={`url(#greenBadgeGrad_${uid})`} />
            <circle cx="0" cy="0" r="40" fill={`url(#greenBadgeGlow_${uid})`} />

            <path
              d="M -18 2 L -5 15 L 18 -10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="9.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      )}
    </div>
  );
};

export default BrandLogo;
