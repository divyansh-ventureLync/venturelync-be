'use client';

import { Post } from '@/types/post';
import { Flame, Zap, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FeedCardProps {
  post: Post;
}

export default function FeedCard({ post }: FeedCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setXpAnimated(true), 300);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const avatarUrl = post.avatarUrl || post.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.handle}`;

  return (
    <motion.article
      className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={post.authorName}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-neutral-900">{post.authorName}</h3>
            <span className="text-sm text-neutral-500">@{post.handle}</span>
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Building • {post.level > 15 ? 'Senior' : post.level > 10 ? 'Mid' : 'Early'} stage
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-neutral-900 text-lg mb-2 line-clamp-1">{post.title}</h4>
        <p className="text-neutral-700 leading-relaxed line-clamp-2">{post.excerpt}</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-700 capitalize"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-neutral-700">{post.streakDays}d</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1 text-neutral-500 hover:text-red-500 transition-colors"
            aria-label="Like post"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">12</span>
          </button>
          <button
            className="flex items-center gap-1 text-neutral-500 hover:text-blue-500 transition-colors"
            aria-label="Comment on post"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">3</span>
          </button>
          <button
            className="flex items-center gap-1 text-neutral-500 hover:text-green-500 transition-colors"
            aria-label="Share post"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={xpAnimated ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.3, type: 'spring' }}
        >
          <Zap className="w-4 h-4" />
          <span>+{post.xpAwarded} XP</span>
        </motion.div>
      </div>
    </motion.article>
  );
}
