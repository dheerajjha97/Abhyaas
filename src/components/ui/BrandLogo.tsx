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
          src="/pwa-192x192.png?v=3"
          srcSet="/pwa-192x192.png?v=3 1x, /pwa-512x512.png?v=3 2x"
          alt="Abhyaas PYQ Logo"
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
            {/* Vibrant Royal Blue Background Gradient */}
            <linearGradient id={`logoBgGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e70ff" />
              <stop offset="50%" stopColor="#0b57e8" />
              <stop offset="100%" stopColor="#003db3" />
            </linearGradient>

            {/* Ambient Top Glow */}
            <radialGradient id={`logoAmbientGlow_${uid}`} cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Paper Sheet Gradient */}
            <linearGradient id={`logoPaperGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Book Page Gradients */}
            <linearGradient id={`logoPageLeft_${uid}`} x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="35%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id={`logoPageRight_${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="35%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id={`logoBookCover_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0043a8" />
              <stop offset="100%" stopColor="#001d52" />
            </linearGradient>

            {/* Pencil Gradients */}
            <linearGradient id={`logoPencilLight_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id={`logoPencilMid_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id={`logoPencilDark_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id={`logoEraserGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id={`logoMetalGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id={`logoWoodGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>

            {/* Green Check Badge Gradient */}
            <linearGradient id={`logoGreenBadgeGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id={`logoGreenBubble_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Drop Shadows */}
            <filter id={`logoDropShadow_${uid}`} x="-10%" y="-10%" width="125%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#001847" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Rounded Base Background */}
          <rect width="512" height="512" rx="108" fill={`url(#logoBgGrad_${uid})`} />
          <rect width="512" height="512" rx="108" fill={`url(#logoAmbientGlow_${uid})`} />

          {/* ==================== OPEN BOOK BASE AT BOTTOM ==================== */}
          <g filter={`url(#logoDropShadow_${uid})`}>
            {/* Hardcover Outer Binding */}
            <path
              d="M 60 435 C 150 438 220 448 256 458 C 292 448 362 438 452 435 C 462 435 470 443 470 453 C 470 459 466 465 458 467 C 370 480 286 480 256 486 C 226 480 142 480 54 467 C 46 465 42 459 42 453 C 42 443 50 435 60 435 Z"
              fill={`url(#logoBookCover_${uid})`}
            />

            {/* Book Spine Center Rim */}
            <path d="M 246 452 C 252 450 260 450 266 452 L 266 482 C 260 484 252 484 246 482 Z" fill="#001a47" />

            {/* Left Open Page Base */}
            <path d="M 68 428 C 140 420 216 428 254 440 L 254 360 C 216 350 140 342 68 352 Z" fill={`url(#logoPageLeft_${uid})`} />
            {/* Right Open Page Base */}
            <path d="M 258 440 C 296 428 372 420 444 428 L 444 352 C 372 342 296 350 258 360 Z" fill={`url(#logoPageRight_${uid})`} />
          </g>

          {/* ==================== MAIN TEST PAPER (PYQ DOCUMENT) ==================== */}
          <g filter={`url(#logoDropShadow_${uid})`}>
            {/* Crisp White Test Paper */}
            <path
              d="M 124 45 C 104 45 88 60 88 80 L 88 372 C 88 388 100 400 116 400 C 180 392 230 404 256 418 C 282 404 332 392 396 400 C 412 400 424 388 424 372 L 424 165 C 424 160 422 156 418 152 L 334 52 C 330 48 324 45 318 45 Z"
              fill={`url(#logoPaperGrad_${uid})`}
              stroke="#ffffff"
              strokeWidth="3.5"
            />

            {/* Paper Fold Corner Top Right */}
            <path d="M 324 45 L 324 140 C 324 154 336 166 350 166 L 424 166 Z" fill="#cbd5e1" opacity="0.5" />
            <path d="M 324 45 L 424 166 L 350 166 C 336 166 324 154 324 140 Z" fill="#f8fafc" />

            {/* PYQ Bold Typography */}
            <text
              x="132"
              y="145"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="80"
              fontWeight="900"
              fill="#09224d"
              letterSpacing="-1.5"
            >
              PYQ
            </text>

            {/* Question Row 1 */}
            <g transform="translate(134, 188)">
              <circle cx="22" cy="22" r="21" fill="#ffffff" stroke="#94a3b8" strokeWidth="4.5" />
              <text x="22" y="30" fontFamily="system-ui, sans-serif" fontSize="24" fontWeight="800" fill="#94a3b8" textAnchor="middle">
                ?
              </text>
              <rect x="60" y="15" width="180" height="14" rx="7" fill="#cbd5e1" />
            </g>

            {/* Question Row 2 */}
            <g transform="translate(134, 254)">
              <circle cx="22" cy="22" r="21" fill="#ffffff" stroke="#94a3b8" strokeWidth="4.5" />
              <text x="22" y="30" fontFamily="system-ui, sans-serif" fontSize="24" fontWeight="800" fill="#94a3b8" textAnchor="middle">
                ?
              </text>
              <rect x="60" y="15" width="200" height="14" rx="7" fill="#cbd5e1" />
            </g>

            {/* Question Row 3 (Solved with Green Checkmark) */}
            <g transform="translate(134, 320)">
              <circle cx="22" cy="22" r="22" fill={`url(#logoGreenBubble_${uid})`} />
              <path
                d="M 13 22 L 19 28 L 31 16"
                fill="none"
                stroke="#ffffff"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="60" y="10" width="160" height="14" rx="7" fill="#94a3b8" />
              <rect x="60" y="34" width="110" height="12" rx="6" fill="#0284c7" opacity="0.9" />
            </g>
          </g>

          {/* ==================== 3D REALISTIC TILTED PENCIL ==================== */}
          <g transform="translate(366, 255) rotate(34)" filter={`url(#logoDropShadow_${uid})`}>
            <g transform="translate(-24, -145)">
              {/* Eraser Top (Pink) */}
              <path d="M 8 0 C 8 -12 40 -12 40 0 L 40 32 L 8 32 Z" fill={`url(#logoEraserGrad_${uid})`} />
              <path d="M 12 0 C 12 -8 24 -8 24 0 L 24 32 L 12 32 Z" fill="#ffffff" opacity="0.35" />

              {/* Silver Metal Band */}
              <rect x="7" y="32" width="34" height="26" rx="2" fill={`url(#logoMetalGrad_${uid})`} />
              <line x1="7" y1="40" x2="41" y2="40" stroke="#64748b" strokeWidth="1.5" />
              <line x1="7" y1="48" x2="41" y2="48" stroke="#64748b" strokeWidth="1.5" />
              <rect x="12" y="32" width="8" height="26" fill="#ffffff" opacity="0.45" />

              {/* Hexagonal Pencil Body (3 visible facets) */}
              <rect x="8" y="58" width="10" height="175" fill={`url(#logoPencilLight_${uid})`} />
              <rect x="18" y="58" width="14" height="175" fill={`url(#logoPencilMid_${uid})`} />
              <rect x="32" y="58" width="8" height="175" fill={`url(#logoPencilDark_${uid})`} />

              {/* Sharpened Wood Cone */}
              <polygon points="8,233 40,233 24,285" fill={`url(#logoWoodGrad_${uid})`} />
              <path d="M 8,233 Q 18,237 24,233 Q 32,237 40,233 L 24,285 Z" fill={`url(#logoWoodGrad_${uid})`} />

              {/* Dark Graphite Lead Cone Tip */}
              <polygon points="19,268 29,268 24,285" fill="#0f172a" />
              <polygon points="19,268 24,268 24,285" fill="#334155" />
            </g>
          </g>

          {/* ==================== LARGE FLOATING GREEN CHECKMARK BADGE ==================== */}
          <g transform="translate(426, 415)" filter={`url(#logoDropShadow_${uid})`}>
            {/* White Border Ring */}
            <circle cx="0" cy="0" r="70" fill="#ffffff" />
            {/* Emerald Sphere */}
            <circle cx="0" cy="0" r="60" fill={`url(#logoGreenBadgeGrad_${uid})`} />
            {/* Top Gloss */}
            <path d="M -48 -24 C -30 -50 30 -50 48 -24 C 20 -38 -20 -38 -48 -24 Z" fill="#ffffff" opacity="0.4" />
            {/* Bold 3D Checkmark */}
            <path
              d="M -26 2 L -8 20 L 26 -16"
              fill="none"
              stroke="#ffffff"
              strokeWidth="15"
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
