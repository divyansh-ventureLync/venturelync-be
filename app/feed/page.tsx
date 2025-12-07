"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Post, type Profile } from "@/lib/supabase";
import {
  Flame,
  TrendingUp,
  Users,
  MessageCircle,
  ThumbsUp,
  Crown,
  Zap,
  LogOut,
  Settings,
  Bell,
  Search,
  Home,
  User,
  Network,
} from "lucide-react";
import CreatePostModal from "@/components/CreatePostModal";
import PostCard from "@/components/PostCard";
import { getLevelLabel } from "@/lib/xpEngine";

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData?.profile_completed) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data: postsData } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (postsData) {
        const postsWithUpvoteStatus = await Promise.all(
          postsData.map(async (post) => {
            const { data: upvote } = await supabase
              .from("upvotes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
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
      console.error("Error loading feed:", error);
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
    router.push("/");
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return "from-yellow-500 to-orange-500";
    if (level >= 7) return "from-purple-500 to-pink-500";
    if (level >= 4) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 sticky top-0 z-40 backdrop-blur-md bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VentureLync
                </h1>
              </div>

              <div className="hidden lg:flex items-center gap-8">
                <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50">
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Feed</span>
                </button>
                <button
                  onClick={() => router.push(`/profile/${profile?.id}`)}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Profile</span>
                </button>
                <button
                  onClick={() => router.push("/connections")}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <Network className="w-4 h-4" />
                  <span className="text-sm font-medium">Network</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* XP Card */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Total XP
                </p>
                <h3 className="text-3xl font-bold text-white">
                  {profile?.total_xp || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    ((profile?.total_xp || 0) / 1000) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Level Card */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Current Level
                </p>
                <h3 className="text-3xl font-bold text-white">
                  {profile?.current_level || 1}
                </h3>
              </div>
              <div
                className={`p-3 bg-gradient-to-br ${getLevelColor(
                  profile?.current_level || 1
                )} rounded-lg`}
              >
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              {getLevelLabel(profile?.current_level || 1)}
            </p>
          </div>

          {/* Streak Card */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Current Streak
                </p>
                <h3 className="text-3xl font-bold text-white">
                  {profile?.current_streak || 0} days
                </h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm">Keep it going! 🔥</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-400 transition-colors"
                  >
                    Share your update...
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                Create Post
              </button>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Be the first to share your progress and inspire the
                      community!
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Create First Post
                    </button>
                  </div>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={profile?.id || ""}
                    onUpdate={loadFeed}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Your Profile</h3>
                <button className="text-slate-400 hover:text-white">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => router.push(`/profile/${profile?.id}`)}
                className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors mb-4"
              >
                <User className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">
                  View Full Profile
                </span>
              </button>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Type</span>
                  <span className="text-white font-medium capitalize">
                    {profile?.user_type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Posts</span>
                  <span className="text-white font-medium">{posts.length}</span>
                </div>
                <div className="h-px bg-slate-700/50"></div>
                <button className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium py-2 transition-colors">
                  Edit Profile →
                </button>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Top Contributors
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-600/50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        Contributor {i}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {100 - i * 10} posts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white text-sm rounded-lg transition-colors">
                  → Browse Investors
                </button>
                <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white text-sm rounded-lg transition-colors">
                  → Find Founders
                </button>
                <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white text-sm rounded-lg transition-colors">
                  → View Manifesto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          userId={profile?.id || ""}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
}
