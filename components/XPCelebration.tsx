'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

interface XPCelebrationProps {
  xpAmount: number;
  show: boolean;
  onComplete: () => void;
  leveledUp?: boolean;
  newLevel?: number;
}

export default function XPCelebration({ xpAmount, show, onComplete, leveledUp, newLevel }: XPCelebrationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 2500);
          }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl border-2 border-blue-400"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.5, 1],
                }}
              >
                <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.4 }}
                  className="text-3xl font-bold text-white"
                >
                  +{xpAmount} XP
                </motion.div>
                {leveledUp && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 text-yellow-300 text-sm font-semibold mt-1"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Level {newLevel}!
                  </motion.div>
                )}
              </div>
            </div>

            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, -Math.random() * 100 - 50],
                  scale: [0, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  boxShadow: '0 0 10px rgba(253, 224, 71, 0.8)',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
