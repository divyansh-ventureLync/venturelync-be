'use client';

import { Profile } from '@/types/post';
import { Flame, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LevelBubble from './LevelBubble';

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
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

  const avatarUrl = profile.avatarUrl || profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.handle}`;

  return (
    <motion.div
      className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
      initial={{ opacity: 0, rotateY: -15 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={prefersReducedMotion ? {} : { rotateY: 5, scale: 1.02 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute top-4 right-4">
        <LevelBubble level={profile.level} xp={profile.xp} streak={profile.streak} size="sm" />
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 ring-4 ring-blue-50">
          <Image
            src={avatarUrl}
            alt={profile.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-neutral-900">{profile.name}</h3>
          <p className="text-sm text-neutral-500">@{profile.handle}</p>
          {profile.location && (
            <p className="text-xs text-neutral-400 mt-1">{profile.location}</p>
          )}
          {profile.bio && (
            <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <div className="text-sm">
              <span className="font-bold text-neutral-900">{profile.streak}</span>
              <span className="text-neutral-600 ml-1">day streak</span>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <span className="font-bold text-neutral-900">{profile.xp.toLocaleString()}</span>
              <span className="text-neutral-600 ml-1">XP</span>
            </div>
          </motion.div>
        </div>

        {profile.role === 'founder' && profile.level > 10 && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-neutral-700 font-medium">Verified signals active</span>
          </div>
        )}

        <button
          className="w-full bg-neutral-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
          aria-label={`View ${profile.name}'s profile`}
        >
          View profile
        </button>
      </div>
    </motion.div>
  );
}
