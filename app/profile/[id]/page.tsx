'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, type Profile, type Post, type Milestone, type XPEvent } from '@/lib/supabase';
import { Crown, Flame, Zap, TrendingUp, Award, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { getLevelLabel, LEVEL_THRESHOLDS } from '@/lib/xpEngine';
import PostCard from '@/components/PostCard';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [params.id]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUser(user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', params.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (postsData) {
          const postsWithUpvoteStatus = await Promise.all(
            postsData.map(async (post) => {
              const { data: upvote } = await supabase
                .from('upvotes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user?.id || '')
                .maybeSingle();

              return {
                ...post,
                author: profileData,
                user_upvoted: !!upvote,
              };
            })
          );

          setPosts(postsWithUpvoteStatus);
        }

        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('*')
          .eq('user_id', params.id)
          .order('achieved_at', { ascending: false });

        if (milestonesData) {
          setMilestones(milestonesData);
        }

        if (user && user.id !== params.id) {
          const { data: connectionData } = await supabase
            .from('connections')
            .select('status')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or(`requester_id.eq.${params.id},recipient_id.eq.${params.id}`)
            .maybeSingle();

          if (connectionData) {
            setConnectionStatus(connectionData.status as any);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!currentUser || !profile) return;

    try {
      await supabase
        .from('connections')
        .insert({
          requester_id: currentUser,
          recipient_id: profile.id,
          status: 'pending',
        });

      setConnectionStatus('pending');
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const currentLevel = LEVEL_THRESHOLDS.find(t => t.level === (profile?.current_level || 1));
  const nextLevel = LEVEL_THRESHOLDS.find(t => t.level === (profile?.current_level || 1) + 1);
  const progressPercentage = currentLevel && nextLevel
    ? ((profile?.total_xp || 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Profile not found</div>
          <button
            onClick={() => router.push('/feed')}
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <nav className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/feed')}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Feed
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-8 border border-neutral-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username || profile.email} className="w-full h-full object-cover" />
                ) : (
                  (profile.username?.[0] || profile.email?.[0])?.toUpperCase()
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.username || profile.email?.split('@')[0]}
                </h1>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300 font-semibold">
                      Level {profile.current_level} • {getLevelLabel(profile.current_level)}
                    </span>
                  </div>
                  {profile.current_streak > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-300 font-semibold">
                        {profile.current_streak} day streak
                      </span>
                    </div>
                  )}
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-sm text-blue-300 font-semibold">
                    {profile.user_type === 'founder' ? '🚀 Founder' : '💰 Investor'}
                  </span>
                </div>

                {profile.user_type === 'founder' && profile.startup_brief && (
                  <p className="text-neutral-300 max-w-2xl leading-relaxed mb-4">
                    {profile.startup_brief}
                  </p>
                )}

                {profile.user_type === 'investor' && profile.prior_investment_experience && (
                  <p className="text-neutral-300 max-w-2xl leading-relaxed mb-4">
                    {profile.prior_investment_experience}
                  </p>
                )}
              </div>
            </div>

            {currentUser && currentUser !== profile.id && (
              <div>
                {connectionStatus === 'none' && (
                  <button
                    onClick={handleConnect}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                )}
                {connectionStatus === 'pending' && (
                  <button
                    disabled
                    className="px-6 py-3 bg-neutral-600 text-neutral-400 font-semibold rounded-lg cursor-not-allowed"
                  >
                    Pending
                  </button>
                )}
                {connectionStatus === 'connected' && (
                  <button
                    disabled
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg cursor-not-allowed"
                  >
                    Connected
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-neutral-400 text-sm">Total XP</span>
              </div>
              <div className="text-3xl font-bold text-white">{profile.total_xp}</div>
            </div>

            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-neutral-400 text-sm">Posts</span>
              </div>
              <div className="text-3xl font-bold text-white">{posts.length}</div>
            </div>

            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-700">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-neutral-400 text-sm">Milestones</span>
              </div>
              <div className="text-3xl font-bold text-white">{milestones.length}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">
                Progress to Level {(profile.current_level || 1) + 1}
              </span>
              <span className="text-neutral-400 text-sm">
                {profile.total_xp} / {nextLevel?.min || 5000} XP
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {profile.user_type === 'founder' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-neutral-700">
              <div>
                <div className="text-neutral-400 text-sm mb-2">Stage</div>
                <div className="text-white font-semibold">{profile.startup_stage || 'N/A'}</div>
              </div>
              <div>
                <div className="text-neutral-400 text-sm mb-2">Funding Ask</div>
                <div className="text-white font-semibold">{profile.funding_ask || 'N/A'}</div>
              </div>
              {profile.startup_website && (
                <div>
                  <div className="text-neutral-400 text-sm mb-2">Website</div>
                  <a
                    href={profile.startup_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {profile.startup_website}
                  </a>
                </div>
              )}
              {profile.education && (
                <div>
                  <div className="text-neutral-400 text-sm mb-2">Education</div>
                  <div className="text-white font-semibold">{profile.education}</div>
                </div>
              )}
            </div>
          )}

          {profile.user_type === 'investor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-neutral-700">
              <div>
                <div className="text-neutral-400 text-sm mb-2">Designation</div>
                <div className="text-white font-semibold">{profile.designation || 'N/A'}</div>
              </div>
              <div>
                <div className="text-neutral-400 text-sm mb-2">Typical Cheque Size</div>
                <div className="text-white font-semibold">{profile.typical_cheque_size || 'N/A'}</div>
              </div>
              <div>
                <div className="text-neutral-400 text-sm mb-2">Investment Style</div>
                <div className="text-white font-semibold">{profile.investment_style || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>

        {milestones.length > 0 && (
          <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Milestones</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-neutral-900 rounded-lg p-3 border border-neutral-700 text-center"
                >
                  <div className="text-2xl mb-2">🎖️</div>
                  <div className="text-white text-sm font-semibold capitalize">
                    {milestone.milestone_type.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
          <h3 className="text-xl font-bold text-white mb-6">Activity Timeline</h3>
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                No posts yet
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser || ''}
                  onUpdate={loadProfile}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
