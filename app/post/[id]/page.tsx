'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, type Post, type Comment, type Profile } from '@/lib/supabase';
import { ArrowLeft, Heart, MessageCircle, Crown, Flame, Send } from 'lucide-react';
import { awardXP } from '@/lib/xpEngine';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);
      await loadPost();
    };
    init();
  }, [postId]);

  const loadPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      const { data: upvoteData } = await supabase
        .from('upvotes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      setPost({
        ...postData,
        user_upvoted: !!upvoteData,
      });

      await loadComments();
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (commentsData) {
        const commentsWithReplies = await Promise.all(
          commentsData.map(async (comment) => {
            const { data: replies } = await supabase
              .from('comments')
              .select(`
                *,
                author:profiles(*)
              `)
              .eq('parent_comment_id', comment.id)
              .order('created_at', { ascending: true });

            return {
              ...comment,
              replies: replies || [],
            };
          })
        );

        setComments(commentsWithReplies);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleUpvote = async () => {
    if (!currentUserId || !post) return;

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

      await loadPost();
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setSubmitting(true);
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: currentUserId,
          content: newComment,
          xp_awarded: 5,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('posts')
        .update({ comments_count: (post?.comments_count || 0) + 1 })
        .eq('id', postId);

      await awardXP(currentUserId, 5, 'comment', comment.id, 'Posted a comment');

      setNewComment('');
      await loadComments();
      await loadPost();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim() || !currentUserId) return;

    setSubmitting(true);
    try {
      const { data: reply, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: currentUserId,
          content: replyContent,
          parent_comment_id: parentCommentId,
          xp_awarded: 5,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('comments')
        .update({ replies_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', parentCommentId);

      await supabase
        .from('posts')
        .update({ comments_count: (post?.comments_count || 0) + 1 })
        .eq('id', postId);

      await awardXP(currentUserId, 5, 'comment', reply.id, 'Posted a reply');

      setReplyContent('');
      setReplyToId(null);
      await loadComments();
      await loadPost();
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
    const colors: Record<string, string> = {
      Build: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      Traction: 'bg-green-500/20 text-green-300 border-green-500/30',
      Team: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      Reflection: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      Setback: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[category] || colors.Build;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <nav className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/feed')}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Feed
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 mb-6">
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
                {formatTimeAgo(post.created_at)}
              </div>
            </div>
          </div>

          <p className="text-white text-lg leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

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
            <div className="flex items-center gap-2 text-neutral-400">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments_count} comments</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
          <h3 className="text-xl font-bold text-white mb-4">Comments</h3>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-neutral-700 pl-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                      {comment.author?.avatar_url ? (
                        <img src={comment.author.avatar_url} alt={comment.author.username || comment.author.email} className="w-full h-full object-cover" />
                      ) : (
                        (comment.author?.username?.[0] || comment.author?.email?.[0])?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {comment.author?.username || comment.author?.email?.split('@')[0]}
                        </span>
                        <span className="text-neutral-500 text-xs">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-neutral-300">{comment.content}</p>
                      <button
                        onClick={() => setReplyToId(comment.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {replyToId === comment.id && (
                    <div className="ml-13 mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={submitting || !replyContent.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyToId(null);
                            setReplyContent('');
                          }}
                          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-13 space-y-3 mt-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                            {reply.author?.avatar_url ? (
                              <img src={reply.author.avatar_url} alt={reply.author.username || reply.author.email} className="w-full h-full object-cover" />
                            ) : (
                              (reply.author?.username?.[0] || reply.author?.email?.[0])?.toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm">
                                {reply.author?.username || reply.author?.email?.split('@')[0]}
                              </span>
                              <span className="text-neutral-500 text-xs">
                                {formatTimeAgo(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-neutral-300 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
