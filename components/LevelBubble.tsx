'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LevelBubbleProps {
  level: number;
  xp?: number;
  streak?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function LevelBubble({
  level,
  xp = 0,
  streak = 0,
  size = 'md',
  showProgress = true
}: LevelBubbleProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
  };

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const progress = xp > 0 ? (xp % 1000) / 1000 : 0.65;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - progress * circumference;

  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <span className={`font-bold text-neutral-900`}>
            {level}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <motion.div
        className={`${sizeClasses[size]} relative flex items-center justify-center`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          className="absolute inset-0 transform -rotate-90"
          width="100%"
          height="100%"
        >
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {showProgress && (
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: prefersReducedMotion ? offset : offset }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          )}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <span className={`font-bold text-neutral-900 ${sizeClasses[size]}`}>
            {level}
          </span>
        </div>

        {streak > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
            <Flame className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>

      <div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
        role="tooltip"
      >
        <div className="font-semibold mb-1">Level {level}</div>
        {xp > 0 && <div>XP: {xp.toLocaleString()}</div>}
        {streak > 0 && <div>🔥 {streak} day streak</div>}
        <div className="text-neutral-400 text-xs mt-1">
          {xp > 0 ? `${Math.round(progress * 100)}% to next level` : 'Keep building!'}
        </div>
      </div>
    </div>
  );
}
