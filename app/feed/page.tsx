'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Post, type Profile } from '@/lib/supabase';
import { Flame, TrendingUp, Users, MessageCircle, ThumbsUp, Crown, Zap } from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import PostCard from '@/components/PostCard';
import { getLevelLabel } from '@/lib/xpEngine';

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData?.profile_completed) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsData) {
        const postsWithUpvoteStatus = await Promise.all(
          postsData.map(async (post) => {
            const { data: upvote } = await supabase
              .from('upvotes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();

            return {
              ...post,
              user_upvoted: !!upvote,
            };
          })
        );

        setPosts(postsWithUpvoteStatus);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    loadFeed();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <nav className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white">VentureLync</h1>
              <div className="hidden md:flex items-center gap-6">
                <button className="text-neutral-300 hover:text-white transition-colors">
                  Feed
                </button>
                <button
                  onClick={() => router.push(`/profile/${profile?.id}`)}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => router.push('/connections')}
                  className="text-neutral-300 hover:text-white transition-colors"
                >
                  Connections
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/profile/${profile?.id}`)}
                className="flex items-center gap-3 bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="text-white font-semibold text-sm text-right">{profile?.total_xp} XP</div>
                  <div className="text-neutral-400 text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Level {profile?.current_level}
                  </div>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {profile?.user_type === 'founder' ? 'Builder' : 'Investor'}! 👋
                </h2>
                <p className="text-blue-100 mb-4">
                  Share your updates and earn XP
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    <span>{profile?.current_streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>{getLevelLabel(profile?.current_level || 1)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                + Create Post
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-neutral-800 rounded-2xl p-12 text-center border border-neutral-700">
              <div className="text-neutral-400 mb-4">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p>Be the first to share your progress!</p>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={profile?.id || ''}
                onUpdate={loadFeed}
              />
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          userId={profile?.id || ''}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
}
