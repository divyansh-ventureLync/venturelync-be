'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const emojis = ['🚀', '💡', '⚡', '🔥', '📈', '💻', '🎯', '✨', '🌟', '💪', '🏆', '🎨', '🔬', '🎓', '💼', '🎪', '🎭', '🎬'];

export default function AnimatedBubbles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {emojis.map((emoji, index) => {
        const size = Math.random() * 40 + 60;
        const duration = Math.random() * 10 + 12;
        const delay = Math.random() * 8;
        const xStart = Math.random() * 100;
        const xVariation = (Math.random() - 0.5) * 30;

        return (
          <motion.div
            key={index}
            className="absolute drop-shadow-2xl"
            style={{
              left: `${xStart}%`,
              bottom: '-10%',
              fontSize: `${size}px`,
              textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.5)',
            }}
            animate={{
              y: ['0vh', '-120vh'],
              x: [`0%`, `${xVariation}%`],
              rotate: [0, 180, 360],
              opacity: [0, 0.7, 0.9, 0.7, 0],
              scale: [0.8, 1.1, 1, 0.9],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {emoji}
          </motion.div>
        );
      })}
    </div>
  );
}
