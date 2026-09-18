import React from 'react';
import { motion } from 'motion/react';

interface LoginHeaderIllustrationProps {
  className?: string;
}

export const LoginHeaderIllustration: React.FC<LoginHeaderIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <motion.svg
        viewBox="0 0 160 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="cloudGrad" x1="10" y1="10" x2="60" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="bookCoverGrad" x1="40" y1="70" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id="bookPageGrad" x1="50" y1="65" x2="110" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          <linearGradient id="capGrad" x1="60" y1="20" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Halo Glow */}
        <motion.circle
          cx="80"
          cy="65"
          r="48"
          fill="url(#haloGlow)"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Open Book Base */}
        <motion.g
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Book Spine Shadow */}
          <ellipse cx="80" cy="116" rx="46" ry="7" fill="#0f172a" fillOpacity="0.35" />

          {/* Book Bottom Cover */}
          <path
            d="M32 94 C56 90, 78 94, 80 96 C82 94, 104 90, 128 94 L126 106 C102 102, 82 106, 80 108 C78 106, 58 102, 34 106 Z"
            fill="url(#bookCoverGrad)"
          />

          {/* Book Pages Left */}
          <path
            d="M34 92 C56 86, 76 90, 80 94 L80 73 C76 69, 56 65, 34 71 Z"
            fill="url(#bookPageGrad)"
            stroke="#cbd5e1"
            strokeWidth="0.75"
          />

          {/* Left Page Lines */}
          <line x1="42" y1="75" x2="72" y2="72" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="42" y1="80" x2="70" y2="78" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="42" y1="85" x2="68" y2="84" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />

          {/* Book Pages Right */}
          <path
            d="M80 94 C84 90, 104 86, 126 92 L126 71 C104 65, 84 69, 80 73 Z"
            fill="url(#bookPageGrad)"
            stroke="#cbd5e1"
            strokeWidth="0.75"
          />

          {/* Right Page Lines */}
          <line x1="88" y1="72" x2="118" y2="75" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="90" y1="78" x2="118" y2="80" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="92" y1="84" x2="116" y2="85" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />

          {/* Red Bookmark Ribbon */}
          <path
            d="M78 72 L82 72 L82 102 L80 99 L78 102 Z"
            fill="#ef4444"
          />
        </motion.g>

        {/* Floating Graduation Cap */}
        <motion.g
          animate={{
            y: [-2, 3, -2],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: '80px', originY: '45px' }}
        >
          {/* Cap Skull Base */}
          <path
            d="M68 44 C68 50, 92 50, 92 44 L90 40 L70 40 Z"
            fill="#0f172a"
          />

          {/* Cap Diamond Top */}
          <polygon
            points="80,27 106,37 80,47 54,37"
            fill="url(#capGrad)"
            stroke="#38bdf8"
            strokeWidth="0.75"
          />

          {/* Cap Button */}
          <circle cx="80" cy="37" r="2.2" fill="url(#goldGrad)" />

          {/* Cap Tassel Ribbon */}
          <motion.path
            d="M80 37 Q96 42, 98 52"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                "M80 37 Q96 42, 98 52",
                "M80 37 Q94 40, 101 50",
                "M80 37 Q96 42, 98 52",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Tassel End Brush */}
          <motion.circle
            cx="98"
            cy="53"
            r="2"
            fill="url(#goldGrad)"
            animate={{
              cx: [98, 101, 98],
              cy: [53, 51, 53],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>

        {/* Floating Cloud with Sync Symbol (Top Right) */}
        <motion.g
          animate={{
            y: [2, -4, 2],
            x: [-1, 2, -1],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Cloud Body */}
          <path
            d="M125 35 C125 31, 121 28, 117 28 C116.5 25, 113 22, 109 22 C104 22, 101 25.5, 100.5 28.5 C98 28.5, 95 30.5, 95 34 C95 37.5, 98 40, 101.5 40 L123 40 C126 40, 128 38, 128 35.5 C128 33.5, 126.5 32, 125 35 Z"
            fill="url(#cloudGrad)"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
          />

          {/* Little green secure shield on cloud */}
          <motion.g
            animate={{
              scale: [0.95, 1.08, 0.95],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: '112px', originY: '33px' }}
          >
            <path
              d="M112 28 L116 30 C116 34, 113.5 36.5, 112 37 C110.5 36.5, 108 34, 108 30 Z"
              fill="url(#shieldGrad)"
            />
            {/* White Checkmark inside shield */}
            <path
              d="M110.2 32.2 L111.4 33.4 L113.8 30.8"
              stroke="#ffffff"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </motion.g>

        {/* Twinkling Star 1 (Top Left) */}
        <motion.g
          animate={{
            scale: [0.7, 1.25, 0.7],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: '42px', originY: '36px' }}
        >
          <path
            d="M42 30 Q42 36 36 36 Q42 36 42 42 Q42 36 48 36 Q42 36 42 30 Z"
            fill="url(#goldGrad)"
          />
        </motion.g>

        {/* Twinkling Star 2 (Far Right) */}
        <motion.g
          animate={{
            scale: [0.9, 1.3, 0.9],
            opacity: [0.7, 1, 0.7],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: 0.6,
            ease: 'easeInOut',
          }}
          style={{ originX: '136px', originY: '60px' }}
        >
          <path
            d="M136 55 Q136 60 131 60 Q136 60 136 65 Q136 60 141 60 Q136 60 136 55 Z"
            fill="url(#goldGrad)"
          />
        </motion.g>

        {/* Little Sparkle Dot (Bottom Left) */}
        <motion.circle
          cx="28"
          cy="75"
          r="1.8"
          fill="#93c5fd"
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
            ease: 'easeInOut',
          }}
        />

        {/* Little Sparkle Dot (Bottom Right) */}
        <motion.circle
          cx="134"
          cy="92"
          r="1.5"
          fill="#fed7aa"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.9, 1.3, 0.9],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: 0.3,
            ease: 'easeInOut',
          }}
        />
      </motion.svg>
    </div>
  );
};
