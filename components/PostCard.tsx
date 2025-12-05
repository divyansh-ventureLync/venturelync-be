'use client';

import { useState, useEffect } from 'react';
import { type Post, type Comment } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, Crown, Flame, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLevelLabel } from '@/lib/xpEngine';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onUpdate: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Build: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Traction: 'bg-green-500/20 text-green-300 border-green-500/30',
  Team: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Reflection: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Setback: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function PostCard({ post, currentUserId, onUpdate }: PostCardProps) {
  const router = useRouter();
  const [firstComment, setFirstComment] = useState<Comment | null>(null);

  useEffect(() => {
    loadFirstComment();
  }, [post.id]);

  const loadFirstComment = async () => {
    try {
      const { data } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('post_id', post.id)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setFirstComment(data);
      }
    } catch (error) {
      console.error('Error loading first comment:', error);
    }
  };

  const handleUpvote = async () => {
    try {
      if (post.user_upvoted) {
        await supabase
          .from('upvotes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);

        await supabase
          .from('posts')
          .update({ upvotes_count: post.upvotes_count - 1 })
          .eq('id', post.id);
      } else {
        await supabase
          .from('upvotes')
          .insert({
            post_id: post.id,
            user_id: currentUserId,
          });

        await supabase
          .from('posts')
          .update({ upvotes_count: post.upvotes_count + 1 })
          .eq('id', post.id);
      }

      onUpdate();
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.Build;
  };

  return (
    <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 hover:border-neutral-600 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden"
          onClick={() => router.push(`/profile/${post.author?.id}`)}
        >
          {post.author?.avatar_url ? (
            <img src={post.author.avatar_url} alt={post.author.username || post.author.email} className="w-full h-full object-cover" />
          ) : (
            (post.author?.username?.[0] || post.author?.email?.[0])?.toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.push(`/profile/${post.author?.id}`)}
              className="font-bold text-white hover:text-blue-400 transition-colors"
            >
              {post.author?.username || post.author?.email?.split('@')[0]}
            </button>
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
              <Crown className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-300">
                Level {post.author?.current_level}
              </span>
            </div>
            {post.author?.current_streak && post.author.current_streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-300">
                  {post.author.current_streak} day streak
                </span>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getCategoryColor(post.category)}`}>
              {post.category}
            </div>
          </div>
          <div className="text-neutral-500 text-sm">
            {formatDate(post.created_at)}
          </div>
        </div>
      </div>

      <div
        onClick={() => router.push(`/post/${post.id}`)}
        className="cursor-pointer"
      >
        <p className="text-white leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-700">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            post.user_upvoted
              ? 'bg-red-500/20 text-red-400'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${post.user_upvoted ? 'fill-red-400' : ''}`} />
          <span className="font-semibold">{post.upvotes_count}</span>
        </button>

        <button
          onClick={() => router.push(`/post/${post.id}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">{post.comments_count}</span>
        </button>
      </div>

      {firstComment && (
        <div
          onClick={() => router.push(`/post/${post.id}`)}
          className="mt-4 pt-4 border-t border-neutral-700 cursor-pointer hover:bg-neutral-750 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
              {firstComment.author?.avatar_url ? (
                <img src={firstComment.author.avatar_url} alt={firstComment.author.username || firstComment.author.email} className="w-full h-full object-cover" />
              ) : (
                (firstComment.author?.username?.[0] || firstComment.author?.email?.[0])?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">
                  {firstComment.author?.username || firstComment.author?.email?.split('@')[0]}
                </span>
                <span className="text-neutral-500 text-xs">
                  {formatDate(firstComment.created_at)}
                </span>
              </div>
              <p className="text-neutral-300 text-sm line-clamp-2">{firstComment.content}</p>
              {post.comments_count > 1 && (
                <span className="text-blue-400 text-xs mt-1 inline-block">
                  View all {post.comments_count} comments
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
