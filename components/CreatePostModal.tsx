'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  calculateXPForCategory,
  checkDailyLimits,
  updateDailyXP,
  calculateAndUpdateStreak,
  awardXP,
  checkAndAwardMilestone,
} from '@/lib/xpEngine';
import { X, Zap } from 'lucide-react';

interface CreatePostModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'Build', label: 'Build', emoji: '🔨', description: 'Product updates, features' },
  { value: 'Traction', label: 'Traction', emoji: '📈', description: 'Users, revenue, growth' },
  { value: 'Team', label: 'Team', emoji: '👥', description: 'Hires, team updates' },
  { value: 'Reflection', label: 'Reflection', emoji: '💭', description: 'Thoughts, insights' },
  { value: 'Setback', label: 'Setback', emoji: '⚠️', description: 'Challenges, learnings' },
];

export default function CreatePostModal({ userId, onClose, onSuccess }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [xpPreview, setXpPreview] = useState(0);
  const [userType, setUserType] = useState<'founder' | 'investor'>('founder');

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const limitsCheck = await checkDailyLimits(userId, category, userType);

      if (!limitsCheck.allowed) {
        setError(limitsCheck.reason || 'Daily limit reached');
        setLoading(false);
        return;
      }

      const xpAmount = calculateXPForCategory(category);
      const isSetback = category === 'Setback';

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: userId,
          content,
          category,
          is_setback: isSetback,
          xp_awarded: xpAmount,
        })
        .select()
        .single();

      if (postError) throw postError;

      await updateDailyXP(userId, xpAmount, category);

      await awardXP(userId, xpAmount, isSetback ? 'setback' : category === 'Reflection' ? 'reflection' : 'execution', post.id, `Posted in ${category}`);

      const streakResult = await calculateAndUpdateStreak(userId);
      if (streakResult.bonusXP > 0) {
        await awardXP(userId, streakResult.bonusXP, 'streak_bonus', undefined, `${streakResult.streak}-day streak`);
      }

      const { data: postsCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('author_id', userId);

      if (postsCount && postsCount.length === 1) {
        await checkAndAwardMilestone(userId, 'first_post');
      }

      if (postsCount && postsCount.length === 10) {
        await checkAndAwardMilestone(userId, 'ten_posts');
      }

      if (category === 'Reflection') {
        const { data: reflectionCount } = await supabase
          .from('posts')
          .select('id', { count: 'exact' })
          .eq('author_id', userId)
          .eq('category', 'Reflection');

        if (reflectionCount && reflectionCount.length === 10) {
          await checkAndAwardMilestone(userId, 'ten_reflections');
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700">
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Create Post</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">
              Select Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    category === cat.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="text-white font-semibold text-sm">{cat.label}</div>
                  <div className="text-neutral-400 text-xs mt-1">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              What's happening?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              maxLength={2000}
              placeholder="Share your progress, insights, or challenges..."
              required
            />
            <div className="text-xs text-neutral-500 mt-2 text-right">
              {content.length} / 2000 characters
            </div>
          </div>

          {category === 'Setback' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-300 text-sm">
                💡 Tip: Share what you learned from this challenge to help others grow too.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !category || !content.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
