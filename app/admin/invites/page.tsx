'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Check, X, Clock, ArrowLeft } from 'lucide-react';

interface InviteRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  user_type: string;
  status: string;
  invite_code: string | null;
  code_expiry: string | null;
  created_at: string;
}

export default function AdminInvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<InviteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdmin();
    loadInvites();
  }, [filter]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      router.push('/feed');
    }
  };

  const loadInvites = async () => {
    try {
      let query = supabase
        .from('invite_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveInvite = async (inviteId: string) => {
    try {
      const inviteCode = generateInviteCode();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      await supabase
        .from('invite_codes')
        .insert({
          code: inviteCode,
          expires_at: expiryDate.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      const { data: inviteRequest } = await supabase
        .from('invite_requests')
        .select('email')
        .eq('id', inviteId)
        .single();

      await supabase
        .from('invite_requests')
        .update({
          status: 'approved',
          invite_code: inviteCode,
          code_expiry: expiryDate.toISOString(),
        })
        .eq('id', inviteId);

      if (inviteRequest?.email) {
        try {
          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invite-email`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: inviteRequest.email,
                type: 'approval',
                inviteCode: inviteCode,
              }),
            }
          );

          if (!emailResponse.ok) {
            console.error('Failed to send approval email');
          }
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
        }
      }

      loadInvites();
    } catch (error) {
      console.error('Error approving invite:', error);
    }
  };

  const rejectInvite = async (inviteId: string) => {
    try {
      await supabase
        .from('invite_requests')
        .update({ status: 'rejected' })
        .eq('id', inviteId);

      loadInvites();
    } catch (error) {
      console.error('Error rejecting invite:', error);
    }
  };

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const filteredInvites = invites.filter(invite =>
    invite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/feed')}
              className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white">Admin: Invite Requests</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredInvites.length === 0 ? (
            <div className="bg-neutral-800 rounded-lg p-12 text-center">
              <p className="text-neutral-400">No invite requests found</p>
            </div>
          ) : (
            filteredInvites.map((invite) => (
              <div
                key={invite.id}
                className="bg-neutral-800 rounded-xl p-6 border border-neutral-700"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{invite.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          invite.user_type === 'founder'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {invite.user_type}
                      </span>
                      {invite.status !== 'pending' && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            invite.status === 'approved'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {invite.status}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-400 mb-1">{invite.email}</p>
                    <p className="text-neutral-500 text-sm">
                      {invite.company} • {invite.role}
                    </p>
                    <p className="text-neutral-600 text-xs mt-2">
                      Requested: {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                    {invite.invite_code && (
                      <div className="mt-3 bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                        <p className="text-xs text-neutral-500 mb-1">Invite Code:</p>
                        <p className="text-lg font-mono font-bold text-blue-400">
                          {invite.invite_code}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Expires: {invite.code_expiry ? new Date(invite.code_expiry).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>

                  {invite.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => approveInvite(invite.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectInvite(invite.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
