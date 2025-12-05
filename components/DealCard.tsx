'use client';

import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DealCardProps {
  title: string;
  metrics?: {
    mrr?: string;
    users?: string;
    growth?: string;
  };
  verifiedSignals: number;
  sparklineData?: number[];
}

export default function DealCard({
  title,
  metrics = { mrr: '$2.4k', users: '240', growth: '+15%' },
  verifiedSignals,
  sparklineData = [20, 35, 30, 45, 40, 55, 50, 65, 60, 75],
}: DealCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const maxValue = Math.max(...sparklineData);
  const minValue = Math.min(...sparklineData);
  const range = maxValue - minValue;

  const points = sparklineData
    .map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const pathLength = sparklineData.length * 10;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={prefersReducedMotion ? {} : { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      boxShadow: [
                        '0 0 0 0 rgba(34, 197, 94, 0)',
                        '0 0 0 4px rgba(34, 197, 94, 0.2)',
                        '0 0 0 0 rgba(34, 197, 94, 0)',
                      ],
                    }
              }
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <CheckCircle className="w-3 h-3" />
              <span>{verifiedSignals} verified</span>
            </motion.div>
          </div>
        </div>

        <div className="ml-4">
          <svg
            width="80"
            height="40"
            viewBox="0 0 100 100"
            className="overflow-visible"
            preserveAspectRatio="none"
          >
            <motion.polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: prefersReducedMotion ? 1 : 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-neutral-500 mb-1">MRR</div>
          <div className="text-sm font-bold text-neutral-900">{metrics.mrr}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Users</div>
          <div className="text-sm font-bold text-neutral-900">{metrics.users}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Growth</div>
          <div className="text-sm font-bold text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {metrics.growth}
          </div>
        </div>
      </div>

      <button className="w-full bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
        Request intros
      </button>
    </motion.div>
  );
}
