'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Connection, type Profile } from '@/lib/supabase';
import { ArrowLeft, Check, X, Crown } from 'lucide-react';

export default function ConnectionsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      const { data: pendingData } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (pendingData) {
        setPendingRequests(pendingData as any);
      }

      const { data: sentData } = await supabase
        .from('connections')
        .select(`
          *,
          recipient:profiles!connections_recipient_id_fkey(*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentData) {
        setSentRequests(sentData as any);
      }

      const { data: acceptedData } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*),
          recipient:profiles!connections_recipient_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (acceptedData) {
        setConnections(acceptedData as any);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      loadConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      loadConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
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
        <h1 className="text-3xl font-bold text-white mb-8">Connections</h1>

        {pendingRequests.length > 0 && (
          <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const profile = request.requester as Profile;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between bg-neutral-900 rounded-lg p-4 border border-neutral-700"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden"
                        onClick={() => router.push(`/profile/${profile.id}`)}
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.username || profile.email} className="w-full h-full object-cover" />
                        ) : (
                          (profile.username?.[0] || profile.email?.[0])?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/profile/${profile.id}`)}
                            className="font-semibold text-white hover:text-blue-400 transition-colors"
                          >
                            {profile.username || profile.email?.split('@')[0]}
                          </button>
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                            <Crown className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-purple-300">
                              Level {profile.current_level}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-neutral-400">
                          {profile.user_type === 'founder' ? 'Founder' : 'Investor'}
                          {profile.user_type === 'founder' && profile.startup_stage && (
                            <> • {profile.startup_stage}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sentRequests.length > 0 && (
          <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Sent Requests ({sentRequests.length})
            </h2>
            <div className="space-y-3">
              {sentRequests.map((request) => {
                const profile = request.recipient as Profile;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between bg-neutral-900 rounded-lg p-4 border border-neutral-700"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden"
                        onClick={() => router.push(`/profile/${profile.id}`)}
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.username || profile.email} className="w-full h-full object-cover" />
                        ) : (
                          (profile.username?.[0] || profile.email?.[0])?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => router.push(`/profile/${profile.id}`)}
                          className="font-semibold text-white hover:text-blue-400 transition-colors"
                        >
                          {profile.username || profile.email?.split('@')[0]}
                        </button>
                        <div className="text-sm text-neutral-400">
                          {profile.user_type === 'founder' ? 'Founder' : 'Investor'}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-400">Pending</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Your Connections ({connections.length})
          </h2>
          {connections.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              No connections yet. Start connecting with founders and investors!
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => {
                const profile = (connection.requester_id === userId
                  ? connection.recipient
                  : connection.requester) as Profile;

                return (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between bg-neutral-900 rounded-lg p-4 border border-neutral-700 hover:border-neutral-600 transition-colors cursor-pointer"
                    onClick={() => router.push(`/profile/${profile.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.username || profile.email} className="w-full h-full object-cover" />
                        ) : (
                          (profile.username?.[0] || profile.email?.[0])?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white">
                            {profile.username || profile.email?.split('@')[0]}
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                            <Crown className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-purple-300">
                              Level {profile.current_level}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-neutral-400">
                          {profile.user_type === 'founder' ? 'Founder' : 'Investor'}
                          {profile.user_type === 'founder' && profile.startup_brief && (
                            <> • {profile.startup_brief.substring(0, 60)}...</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-green-400 font-semibold">Connected</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
