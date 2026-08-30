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
  | 'chemistry';

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
