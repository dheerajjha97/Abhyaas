import React from 'react';

export type IllustrationType =
  | 'welcome'
  | 'study'
  | 'books'
  | 'quiz'
  | 'success'
  | 'empty'
  | 'search'
  | 'bookmark'
  | 'error'
  | 'preparation'
  | 'biology'
  | 'physics'
  | 'math'
  | 'chemistry'
  | 'history'
  | 'geography'
  | 'polscience'
  | 'mocktest'
  | 'papers'
  | 'syllabus'
  | 'notes'
  | 'flame';

interface IllustrationProps {
  name: IllustrationType;
  className?: string;
  size?: number | string;
}

export const Illustration: React.FC<IllustrationProps> = ({
  name,
  className = '',
  size = '100%',
}) => {
  const renderSvgContent = () => {
    switch (name) {
      case 'welcome':
        return (
          <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-md">
            <rect width="400" height="300" rx="24" fill="url(#bg-welcome)" />
            {/* Soft decorative background circles */}
            <circle cx="90" cy="70" r="50" fill="#818CF8" opacity="0.3" filter="blur(20px)" />
            <circle cx="320" cy="220" r="70" fill="#F472B6" opacity="0.25" filter="blur(24px)" />

            {/* Desk */}
            <path d="M40 240H360V252C360 256.418 356.418 260 352 260H48C43.5817 260 40 256.418 40 252V240Z" fill="#334155" />
            <path d="M60 260V290" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <path d="M340 260V290" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

            {/* Laptop / Notebook */}
            <rect x="150" y="195" width="100" height="45" rx="6" fill="#0EA5E9" />
            <rect x="160" y="202" width="80" height="30" rx="3" fill="#E0F2FE" />
            <path d="M135 240H265L255 244H145L135 240Z" fill="#94A3B8" />

            {/* Student Character */}
            <circle cx="200" cy="115" r="30" fill="#FDE047" /> {/* Head / Hair accent */}
            <circle cx="200" cy="120" r="24" fill="#FFEDD5" /> {/* Face */}
            <path d="M185 115Q200 105 215 115" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" /> {/* Hair line */}
            <circle cx="192" cy="122" r="2.5" fill="#1E293B" /> {/* Eye */}
            <circle cx="208" cy="122" r="2.5" fill="#1E293B" /> {/* Eye */}
            <path d="M195 132Q200 137 205 132" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" /> {/* Smile */}

            {/* Student Body / Hoodie */}
            <path d="M155 195C155 160 170 148 200 148C230 148 245 160 245 195H155Z" fill="#6366F1" />

            {/* Open Book on Side */}
            <path d="M70 225L95 215L120 225V240L95 230L70 240V225Z" fill="#38BDF8" />
            <path d="M95 215V230" stroke="#0284C7" strokeWidth="2" />

            {/* Floating Sparkles & Lightbulb */}
            <g className="animate-pulse">
              <circle cx="280" cy="90" r="16" fill="#FEF08A" />
              <path d="M280 78V82M280 98V102M268 90H272M288 90H292" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="110" cy="100" r="4" fill="#F472B6" />
              <circle cx="310" cy="140" r="6" fill="#818CF8" />
            </g>

            <defs>
              <linearGradient id="bg-welcome" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EEF2FF" />
                <stop offset="1" stopColor="#E0E7FF" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'study':
        return (
          <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="240" height="180" rx="20" fill="#F0F9FF" />
            {/* Open Book */}
            <path d="M40 110C65 95 110 95 120 115C130 95 175 95 200 110V140C175 125 130 125 120 145C110 125 65 125 40 140V110Z" fill="#38BDF8" />
            <path d="M120 115V145" stroke="#0284C7" strokeWidth="3" />
            {/* Lines inside book */}
            <path d="M55 115H95M55 125H90" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M145 115H185M145 125H180" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* Pencil */}
            <rect x="150" y="45" width="14" height="60" rx="3" transform="rotate(30 150 45)" fill="#FBBF24" />
            <path d="M174 98L180 110L168 105L174 98Z" fill="#D97706" />
            {/* Lightbulb */}
            <circle cx="90" cy="55" r="18" fill="#FDE047" />
            <path d="M84 72H96V78H84V72Z" fill="#94A3B8" />
          </svg>
        );

      case 'books':
        return (
          <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="200" height="160" rx="16" fill="#FAF5FF" />
            {/* Stacked books */}
            <rect x="35" y="115" width="130" height="24" rx="5" fill="#818CF8" />
            <rect x="40" y="119" width="120" height="16" rx="3" fill="#6366F1" />

            <rect x="45" y="86" width="115" height="24" rx="5" fill="#F472B6" />
            <rect x="50" y="90" width="105" height="16" rx="3" fill="#EC4899" />

            <rect x="55" y="57" width="100" height="24" rx="5" fill="#34D399" />
            <rect x="60" y="61" width="90" height="16" rx="3" fill="#10B981" />

            {/* Apple / Bookmark on top */}
            <circle cx="100" cy="40" r="14" fill="#EF4444" />
            <path d="M100 26C104 20 108 24 106 28" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'quiz':
        return (
          <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="240" height="180" rx="20" fill="#EFF6FF" />
            {/* Quiz Board */}
            <rect x="50" y="30" width="140" height="120" rx="16" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="4" />
            {/* Header Clip */}
            <rect x="95" y="20" width="50" height="16" rx="4" fill="#2563EB" />
            {/* Checkboxes and lines */}
            <circle cx="75" cy="65" r="8" fill="#10B981" />
            <path d="M72 65L74 67L78 63" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <rect x="92" y="62" width="75" height="6" rx="3" fill="#94A3B8" />

            <circle cx="75" cy="95" r="8" fill="#6366F1" />
            <rect x="92" y="92" width="60" height="6" rx="3" fill="#CBD5E1" />

            <circle cx="75" cy="125" r="8" stroke="#94A3B8" strokeWidth="2.5" fill="none" />
            <rect x="92" y="122" width="80" height="6" rx="3" fill="#CBD5E1" />

            {/* Floating question mark */}
            <circle cx="185" cy="45" r="18" fill="#F59E0B" />
            <text x="185" y="52" textAnchor="middle" fill="#FFFFFF" fontWeight="bold" fontSize="20">?</text>
          </svg>
        );

      case 'success':
        return (
          <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-lg">
            <rect width="260" height="200" rx="24" fill="url(#bg-success)" />
            {/* Golden Trophy */}
            <path d="M95 60H165V105C165 124.33 149.33 140 130 140C110.67 140 95 124.33 95 105V60Z" fill="#FBBF24" />
            <path d="M105 60H155V100C155 113.807 143.807 125 130 125C116.193 125 105 113.807 105 100V60Z" fill="#F59E0B" />
            {/* Handles */}
            <path d="M95 70H80C74.4772 70 70 74.4772 70 80V90C70 95.5228 74.4772 100 80 100H95" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            <path d="M165 70H180C185.523 70 190 74.4772 190 80V90C190 95.5228 185.523 100 180 100H165" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            {/* Stand */}
            <rect x="122" y="140" width="16" height="24" fill="#D97706" />
            <rect x="100" y="164" width="60" height="16" rx="4" fill="#78350F" />
            {/* Star on Trophy */}
            <path d="M130 75L133 83H141L134 88L137 96L130 91L123 96L126 88L119 83H127L130 75Z" fill="#FFFFFF" />
            {/* Confetti */}
            <circle cx="50" cy="50" r="5" fill="#EF4444" />
            <circle cx="210" cy="45" r="6" fill="#3B82F6" />
            <rect x="40" y="120" width="8" height="8" rx="2" fill="#10B981" transform="rotate(25 40 120)" />
            <rect x="215" y="130" width="10" height="6" rx="2" fill="#EC4899" transform="rotate(-30 215 130)" />
            <defs>
              <linearGradient id="bg-success" x1="0" y1="0" x2="260" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF3C7" />
                <stop offset="1" stopColor="#FDE68A" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'empty':
        return (
          <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="200" height="160" rx="16" fill="#F8FAFC" />
            <path d="M50 80L100 55L150 80V125L100 145L50 125V80Z" fill="#E2E8F0" />
            <path d="M100 55V145" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M50 80L100 100L150 80" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="100" cy="70" r="16" fill="#94A3B8" opacity="0.4" />
            <path d="M92 70H108" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'search':
        return (
          <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="200" height="160" rx="16" fill="#F0FDFA" />
            {/* Paper Sheet */}
            <rect x="45" y="30" width="85" height="105" rx="8" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3" />
            <rect x="60" y="50" width="55" height="6" rx="3" fill="#CCFBF1" />
            <rect x="60" y="65" width="45" height="6" rx="3" fill="#CCFBF1" />
            <rect x="60" y="80" width="50" height="6" rx="3" fill="#CCFBF1" />
            {/* Magnifying Glass */}
            <circle cx="125" cy="85" r="28" fill="#FFFFFF" stroke="#0D9488" strokeWidth="6" />
            <path d="M145 105L170 130" stroke="#0D9488" strokeWidth="8" strokeLinecap="round" />
            <circle cx="125" cy="85" r="16" fill="#2DD4BF" opacity="0.3" />
          </svg>
        );

      case 'bookmark':
        return (
          <svg viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="180" height="150" rx="16" fill="#FFF7ED" />
            <path d="M70 30H110V120L90 105L70 120V30Z" fill="#EA580C" />
            <path d="M70 30H90V105L70 120V30Z" fill="#F97316" />
            <circle cx="90" cy="55" r="8" fill="#FFEDD5" />
          </svg>
        );

      case 'error':
        return (
          <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="200" height="160" rx="16" fill="#FEF2F2" />
            <circle cx="100" cy="70" r="32" fill="#FCA5A5" opacity="0.4" />
            <path d="M100 50V75" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="88" r="3" fill="#EF4444" />
          </svg>
        );

      case 'preparation':
        return (
          <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="240" height="180" rx="20" fill="#F5F3FF" />
            {/* Target & Arrow */}
            <circle cx="120" cy="90" r="50" fill="#DDD6FE" />
            <circle cx="120" cy="90" r="35" fill="#C4B5FD" />
            <circle cx="120" cy="90" r="20" fill="#8B5CF6" />
            <circle cx="120" cy="90" r="8" fill="#FFFFFF" />
            <path d="M160 50L122 88" stroke="#4C1D95" strokeWidth="4" strokeLinecap="round" />
            <path d="M160 50H145M160 50V65" stroke="#4C1D95" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'biology':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#DCFCE7" />
            <path d="M50 20C30 35 30 65 50 80C70 65 70 35 50 20Z" fill="#22C55E" />
            <path d="M50 20V80" stroke="#15803D" strokeWidth="2.5" />
            <path d="M50 40L35 30M50 55L65 45M50 65L38 60" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'physics':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#E0F2FE" />
            <ellipse cx="50" cy="50" rx="35" ry="12" stroke="#0284C7" strokeWidth="2.5" transform="rotate(30 50 50)" />
            <ellipse cx="50" cy="50" rx="35" ry="12" stroke="#0284C7" strokeWidth="2.5" transform="rotate(-30 50 50)" />
            <circle cx="50" cy="50" r="8" fill="#0369A1" />
          </svg>
        );

      case 'math':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#FEF3C7" />
            <text x="30" y="45" fill="#D97706" fontWeight="bold" fontSize="28">∑</text>
            <text x="55" y="70" fill="#B45309" fontWeight="bold" fontSize="24">π</text>
            <path d="M30 65L65 30" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'chemistry':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#F3E8FF" />
            <path d="M42 25H58V45L72 75C75 80 70 85 62 85H38C30 85 25 80 28 75L42 45V25Z" fill="#C084FC" stroke="#7E22CE" strokeWidth="2.5" />
            <path d="M33 65C40 60 50 70 67 65L72 75H28L33 65Z" fill="#9333EA" />
            <circle cx="45" cy="72" r="3" fill="#FFFFFF" />
            <circle cx="55" cy="76" r="2.5" fill="#FFFFFF" />
          </svg>
        );

      case 'history':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-hist)" />
            <circle cx="60" cy="58" r="38" fill="#FEF3C7" opacity="0.6" />
            <path d="M36 34H52V82H36V34Z" fill="#E2E8F0" />
            <path d="M33 30H55V35H33V30Z" fill="#CBD5E1" />
            <path d="M31 82H57V88H31V82Z" fill="#94A3B8" />
            <path d="M40 38V78M48 38V78" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
            <g transform="rotate(-10 72 62)">
              <rect x="52" y="38" width="38" height="48" rx="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
              <line x1="58" y1="46" x2="84" y2="46" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
              <line x1="58" y1="52" x2="80" y2="52" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
              <line x1="58" y1="58" x2="82" y2="58" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
              <line x1="58" y1="64" x2="74" y2="64" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
              <circle cx="78" cy="74" r="6" fill="#DC2626" />
              <circle cx="78" cy="74" r="3.5" fill="#EF4444" />
            </g>
            <circle cx="82" cy="36" r="13" fill="url(#gold-grad-hist)" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="82" cy="36" r="9" stroke="#EAB308" strokeWidth="1" strokeDasharray="2 1.5" />
            <polygon points="82,31 84,35 88,36 85,39 86,43 82,41 78,43 79,39 76,36 80,35" fill="#CA8A04" />
            <path d="M26 26L28 20L30 26L36 28L30 30L28 36L26 30L20 28Z" fill="#FBBF24" />
            <defs>
              <linearGradient id="bg-hist" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFBEB" />
                <stop offset="1" stopColor="#FEF3C7" />
              </linearGradient>
              <linearGradient id="gold-grad-hist" x1="72" y1="26" x2="92" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'geography':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-geo)" />
            <circle cx="56" cy="56" r="34" fill="url(#globe-water)" />
            <path d="M42 42C44 36 52 34 56 38C60 42 66 38 72 40C78 42 76 50 72 54C68 58 64 56 60 62C56 68 48 68 46 62C44 56 40 48 42 42Z" fill="#22C55E" />
            <path d="M50 72C54 70 62 72 64 76C62 82 52 84 48 80C46 76 48 74 50 72Z" fill="#16A34A" />
            <path d="M32 50C34 46 38 48 38 52C36 56 30 54 32 50Z" fill="#4ADE80" />
            <ellipse cx="56" cy="56" rx="34" ry="14" stroke="#E0F2FE" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <ellipse cx="56" cy="56" rx="16" ry="34" stroke="#E0F2FE" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx="56" cy="56" r="34" stroke="url(#globe-rim)" strokeWidth="2.5" />
            <path d="M56 90V100M44 100H68" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M90 56C90 74.7777 74.7777 90 56 90" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(74, 22)">
              <circle cx="16" cy="16" r="16" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
              <circle cx="16" cy="16" r="13" fill="#F0F9FF" />
              <line x1="16" y1="4" x2="16" y2="8" stroke="#0284C7" strokeWidth="1.5" />
              <line x1="16" y1="24" x2="16" y2="28" stroke="#0284C7" strokeWidth="1.5" />
              <line x1="4" y1="16" x2="8" y2="16" stroke="#0284C7" strokeWidth="1.5" />
              <line x1="24" y1="16" x2="28" y2="16" stroke="#0284C7" strokeWidth="1.5" />
              <polygon points="16,6 19,16 16,14 13,16" fill="#EF4444" />
              <polygon points="16,26 19,16 16,18 13,16" fill="#64748B" />
              <circle cx="16" cy="16" r="2" fill="#1E293B" />
            </g>
            <defs>
              <linearGradient id="bg-geo" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F0FDF4" />
                <stop offset="1" stopColor="#E0F2FE" />
              </linearGradient>
              <linearGradient id="globe-water" x1="26" y1="26" x2="86" y2="86" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="globe-rim" x1="22" y1="22" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#BAE6FD" />
                <stop offset="1" stopColor="#0369A1" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'polscience':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-pol)" />
            <path d="M22 66H98V72H22V66Z" fill="#CBD5E1" opacity="0.6" />
            <path d="M42 66C42 50 78 50 78 66H42Z" fill="#94A3B8" opacity="0.5" />
            <rect x="58" y="44" width="4" height="8" fill="#64748B" opacity="0.6" />
            <line x1="30" y1="66" x2="30" y2="72" stroke="#64748B" strokeWidth="2" />
            <line x1="42" y1="66" x2="42" y2="72" stroke="#64748B" strokeWidth="2" />
            <line x1="78" y1="66" x2="78" y2="72" stroke="#64748B" strokeWidth="2" />
            <line x1="90" y1="66" x2="90" y2="72" stroke="#64748B" strokeWidth="2" />
            <rect x="30" y="40" width="46" height="60" rx="4" fill="url(#book-cover)" stroke="#1E1B4B" strokeWidth="1.5" />
            <path d="M76 44L82 46V102L76 100V44Z" fill="#E2E8F0" />
            <rect x="30" y="40" width="6" height="60" rx="1" fill="#1E1B4B" />
            <circle cx="54" cy="62" r="11" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="54" cy="62" r="7" stroke="#CA8A04" strokeWidth="1" strokeDasharray="2 1.5" />
            <circle cx="54" cy="62" r="2.5" fill="#CA8A04" />
            <path d="M48 40V78L52 74L56 78V40" fill="#EF4444" />
            <g transform="translate(68, 30)">
              <line x1="22" y1="12" x2="22" y2="48" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="8" y1="20" x2="36" y2="20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="22" cy="12" r="3" fill="#D97706" />
              <line x1="8" y1="20" x2="4" y2="30" stroke="#F59E0B" strokeWidth="1" />
              <line x1="8" y1="20" x2="12" y2="30" stroke="#F59E0B" strokeWidth="1" />
              <path d="M2 30C2 34 14 34 14 30H2Z" fill="#FBBF24" />
              <line x1="36" y1="20" x2="32" y2="30" stroke="#F59E0B" strokeWidth="1" />
              <line x1="36" y1="20" x2="40" y2="30" stroke="#F59E0B" strokeWidth="1" />
              <path d="M30 30C30 34 42 34 42 30H30Z" fill="#FBBF24" />
              <path d="M14 48H30" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
            </g>
            <defs>
              <linearGradient id="bg-pol" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EEF2FF" />
                <stop offset="1" stopColor="#E0E7FF" />
              </linearGradient>
              <linearGradient id="book-cover" x1="30" y1="40" x2="76" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#312E81" />
                <stop offset="1" stopColor="#1E1B4B" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'mocktest':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-mock)" />
            <path d="M24 78L40 78M18 88L44 88M28 98L38 98" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <path d="M46 76L32 94C30 96 34 100 38 98L56 86Z" fill="#EF4444" />
            <path d="M48 78L38 92C36 94 40 96 42 94L54 84Z" fill="#FBBF24" />
            <g transform="rotate(-35 62 58)">
              <path d="M44 68L34 76L44 80Z" fill="#DC2626" />
              <path d="M68 68L78 76L68 80Z" fill="#DC2626" />
              <path d="M56 26C46 36 44 68 44 76H68C68 68 66 36 56 26Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
              <path d="M56 26C51 32 50 42 50 44H62C62 42 61 32 56 26Z" fill="#EF4444" />
              <circle cx="56" cy="52" r="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
              <circle cx="54" cy="50" r="2" fill="#FFFFFF" />
            </g>
            <g transform="translate(68, 20)">
              <polygon points="18,4 8,18 16,18 10,32 26,14 18,14" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
            </g>
            <g transform="translate(68, 68)">
              <circle cx="16" cy="16" r="14" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
              <circle cx="16" cy="16" r="11" fill="#FEF3C7" />
              <line x1="16" y1="16" x2="16" y2="9" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="16" x2="21" y2="16" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <defs>
              <linearGradient id="bg-mock" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFBEB" />
                <stop offset="1" stopColor="#FEF3C7" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'papers':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-pap)" />
            <rect x="30" y="24" width="54" height="72" rx="6" fill="#BFDBFE" transform="rotate(-6 57 60)" />
            <rect x="34" y="26" width="54" height="72" rx="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
            <rect x="42" y="34" width="38" height="4" rx="2" fill="#2563EB" />
            <rect x="42" y="44" width="34" height="2.5" rx="1.25" fill="#94A3B8" />
            <rect x="42" y="50" width="28" height="2.5" rx="1.25" fill="#CBD5E1" />
            <rect x="42" y="56" width="36" height="2.5" rx="1.25" fill="#94A3B8" />
            <rect x="42" y="62" width="22" height="2.5" rx="1.25" fill="#CBD5E1" />
            <circle cx="44" cy="72" r="2.5" fill="#10B981" />
            <rect x="49" y="71" width="16" height="2" rx="1" fill="#64748B" />
            <circle cx="44" cy="80" r="2.5" fill="#2563EB" />
            <rect x="49" y="79" width="14" height="2" rx="1" fill="#64748B" />
            <g transform="translate(62, 58)">
              <circle cx="18" cy="18" r="16" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="13" stroke="#FCA5A5" strokeWidth="1" strokeDasharray="2 1.5" />
              <text x="18" y="23" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="13">A+</text>
            </g>
            <defs>
              <linearGradient id="bg-pap" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EFF6FF" />
                <stop offset="1" stopColor="#DBEAFE" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'syllabus':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-syl)" />
            <path d="M34 36H86M34 60H86M34 84H86" stroke="#99F6E4" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <path d="M38 88C38 68 82 68 82 44" stroke="#0D9488" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 6" />
            <circle cx="38" cy="88" r="8" fill="#14B8A6" stroke="#0F766E" strokeWidth="2" />
            <circle cx="38" cy="88" r="3.5" fill="#FFFFFF" />
            <circle cx="60" cy="66" r="9" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
            <circle cx="60" cy="66" r="4" fill="#5EEAD4" />
            <circle cx="82" cy="44" r="10" fill="#042F2E" stroke="#14B8A6" strokeWidth="2.5" />
            <path d="M82 44V24M82 24L96 30L82 36" fill="#F59E0B" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
            <g transform="translate(24, 28)">
              <rect width="28" height="24" rx="4" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.5" />
              <path d="M6 10L9 13L16 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 18L9 21L16 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </g>
            <defs>
              <linearGradient id="bg-syl" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F0FDFA" />
                <stop offset="1" stopColor="#CCFBF1" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'notes':
        return (
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="120" height="120" rx="28" fill="url(#bg-not)" />
            <rect x="32" y="24" width="58" height="74" rx="6" fill="#FFFFFF" stroke="#C4B5FD" strokeWidth="2" />
            <circle cx="38" cy="34" r="2.5" fill="#7C3AED" />
            <circle cx="38" cy="46" r="2.5" fill="#7C3AED" />
            <circle cx="38" cy="58" r="2.5" fill="#7C3AED" />
            <circle cx="38" cy="70" r="2.5" fill="#7C3AED" />
            <circle cx="38" cy="82" r="2.5" fill="#7C3AED" />
            <line x1="46" y1="26" x2="46" y2="96" stroke="#FCA5A5" strokeWidth="1.5" />
            <line x1="52" y1="36" x2="80" y2="36" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="52" y="44" width="28" height="7" rx="2" fill="#FEF08A" />
            <line x1="52" y1="47.5" x2="78" y2="47.5" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="58" x2="75" y2="58" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="68" x2="72" y2="68" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <rect x="88" y="32" width="8" height="10" rx="1" fill="#F43F5E" />
            <rect x="88" y="46" width="8" height="10" rx="1" fill="#F59E0B" />
            <rect x="88" y="60" width="8" height="10" rx="1" fill="#10B981" />
            <g transform="rotate(32 76 80)">
              <rect x="68" y="70" width="12" height="34" rx="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <path d="M70 66L78 66L76 70L72 70Z" fill="#FDE047" />
              <rect x="70" y="94" width="8" height="8" fill="#7C3AED" />
            </g>
            <defs>
              <linearGradient id="bg-not" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF5FF" />
                <stop offset="1" stopColor="#EDE9FE" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'flame':
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
            <path
              d="M50 12C50 12 62 26 62 38C62 42 66 44 68 40C74 50 78 60 78 70C78 85.464 65.464 98 50 98C34.536 98 22 85.464 22 70C22 52 34 38 42 26C44 23 48 18 50 12Z"
              fill="url(#flame-outer)"
            />
            <path
              d="M50 32C50 32 58 44 58 54C58 58 61 60 63 56C67 64 68 70 68 76C68 85.941 59.941 94 50 94C40.059 94 32 85.941 32 76C32 62 40 50 46 42C47.5 40 49 36 50 32Z"
              fill="url(#flame-mid)"
            />
            <path
              d="M50 56C50 56 55 64 55 70C55 72 57 74 58 71C60 76 60 80 60 83C60 88.523 55.523 93 50 93C44.477 93 40 88.523 40 83C40 75 45 68 48 62C49 60 49.5 58 50 56Z"
              fill="url(#flame-core)"
            />
            <circle cx="34" cy="28" r="2.5" fill="#FBBF24" className="animate-ping" style={{ animationDuration: '2s' }} />
            <circle cx="68" cy="22" r="3" fill="#F97316" className="animate-pulse" />
            <circle cx="58" cy="12" r="2" fill="#FDE047" />
            <defs>
              <linearGradient id="flame-outer" x1="50" y1="12" x2="50" y2="98" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F97316" />
                <stop offset="0.6" stopColor="#EA580C" />
                <stop offset="1" stopColor="#C2410C" />
              </linearGradient>
              <linearGradient id="flame-mid" x1="50" y1="32" x2="50" y2="94" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="1" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="flame-core" x1="50" y1="56" x2="50" y2="93" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.5" stopColor="#FEF08A" />
                <stop offset="1" stopColor="#FDE047" />
              </linearGradient>
            </defs>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: 'auto' }}>
      {renderSvgContent()}
    </div>
  );
};
