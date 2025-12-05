'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type UserType } from '@/lib/supabase';
import { Check, X, Upload } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [founderData, setFounderData] = useState({
    work_email: '',
    startup_website: '',
    pitch_deck_url: '',
    startup_stage: '',
    looking_to_raise: false,
    funding_ask: '',
    startup_brief: '',
    education: '',
    past_experience: '',
  });

  const [investorData, setInvestorData] = useState({
    designation: '',
    prior_investment_experience: '',
    typical_cheque_size: '',
    investment_style: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkAuth();
  }, [router]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3 || usernameToCheck.length > 30) {
      setUsernameAvailable(null);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameToCheck)) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .maybeSingle();

      setUsernameAvailable(!data);
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !userId) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      return null;
    }
  };

  const handleUserTypeSelect = async (type: UserType) => {
    setUserType(type);
    setError('');

    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: type,
          email: user?.email || '',
        });

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to set user type');
    }
  };

  const handleFounderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!usernameAvailable) {
      setError('Please choose an available username');
      setLoading(false);
      return;
    }

    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updateData: any = {
        username: username.toLowerCase(),
        ...founderData,
        profile_completed: true,
      };

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      if (!founderData.looking_to_raise) {
        updateData.funding_ask = null;
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!usernameAvailable) {
      setError('Please choose an available username');
      setLoading(false);
      return;
    }

    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updateData: any = {
        username: username.toLowerCase(),
        ...investorData,
        profile_completed: true,
      };

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to VentureLync</h1>
            <p className="text-neutral-400 text-lg">Choose your role to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleUserTypeSelect('founder')}
              className="bg-neutral-800 hover:bg-neutral-750 border-2 border-neutral-700 hover:border-blue-500 rounded-2xl p-8 transition-all group"
            >
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Founder</h3>
              <p className="text-neutral-400 leading-relaxed">
                Building something? Track your progress, earn XP, and get discovered by investors.
              </p>
            </button>

            <button
              onClick={() => handleUserTypeSelect('investor')}
              className="bg-neutral-800 hover:bg-neutral-750 border-2 border-neutral-700 hover:border-green-500 rounded-2xl p-8 transition-all group"
            >
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">Investor</h3>
              <p className="text-neutral-400 leading-relaxed">
                Looking for deals? Discover high-quality founders backed by real execution data.
              </p>
            </button>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (userType === 'founder') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-neutral-800 rounded-2xl p-8 shadow-2xl border border-neutral-700">
            <h2 className="text-3xl font-bold text-white mb-6">Complete Your Founder Profile</h2>
            <p className="text-neutral-400 mb-8">All fields are required to access the platform</p>

            <form onSubmit={handleFounderSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-neutral-500" />
                    )}
                  </div>
                  <label className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg cursor-pointer transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="johndoe"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                  {username.length >= 3 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingUsername ? (
                        <div className="w-5 h-5 border-2 border-neutral-500 border-t-blue-500 rounded-full animate-spin" />
                      ) : usernameAvailable === true ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : usernameAvailable === false ? (
                        <X className="w-5 h-5 text-red-400" />
                      ) : null}
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {username.length >= 3 && usernameAvailable === false && 'Username already taken'}
                  {username.length >= 3 && usernameAvailable === true && 'Username available!'}
                  {username.length < 3 && '3-30 characters, letters, numbers, and underscores only'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Work Email</label>
                  <input
                    type="email"
                    value={founderData.work_email}
                    onChange={(e) => setFounderData({ ...founderData, work_email: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Startup Website</label>
                  <input
                    type="url"
                    value={founderData.startup_website}
                    onChange={(e) => setFounderData({ ...founderData, startup_website: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Pitch Deck URL</label>
                <input
                  type="url"
                  value={founderData.pitch_deck_url}
                  onChange={(e) => setFounderData({ ...founderData, pitch_deck_url: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Startup Stage</label>
                <select
                  value={founderData.startup_stage}
                  onChange={(e) => setFounderData({ ...founderData, startup_stage: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select stage</option>
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C+">Series C+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Are you looking to raise funds?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={founderData.looking_to_raise === true}
                      onChange={() => setFounderData({ ...founderData, looking_to_raise: true })}
                      className="w-4 h-4"
                    />
                    <span className="text-white">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={founderData.looking_to_raise === false}
                      onChange={() => setFounderData({ ...founderData, looking_to_raise: false, funding_ask: '' })}
                      className="w-4 h-4"
                    />
                    <span className="text-white">No</span>
                  </label>
                </div>
              </div>

              {founderData.looking_to_raise && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Funding Amount</label>
                  <input
                    type="text"
                    value={founderData.funding_ask}
                    onChange={(e) => setFounderData({ ...founderData, funding_ask: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., $500k - $1M"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Startup Brief (max 500 characters)</label>
                <textarea
                  value={founderData.startup_brief}
                  onChange={(e) => setFounderData({ ...founderData, startup_brief: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  maxLength={500}
                  placeholder="What are you building? What's your traction?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Education</label>
                <input
                  type="text"
                  value={founderData.education}
                  onChange={(e) => setFounderData({ ...founderData, education: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., B.S. Computer Science, Stanford"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Past Experience</label>
                <textarea
                  value={founderData.past_experience}
                  onChange={(e) => setFounderData({ ...founderData, past_experience: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="1-2 most relevant prior roles or ventures"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !usernameAvailable}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-neutral-800 rounded-2xl p-8 shadow-2xl border border-neutral-700">
          <h2 className="text-3xl font-bold text-white mb-6">Complete Your Investor Profile</h2>
          <p className="text-neutral-400 mb-8">All fields are required to access the platform</p>

          <form onSubmit={handleInvestorSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-neutral-500" />
                  )}
                </div>
                <label className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="johndoe"
                  required
                  minLength={3}
                  maxLength={30}
                />
                {username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <div className="w-5 h-5 border-2 border-neutral-500 border-t-green-500 rounded-full animate-spin" />
                    ) : usernameAvailable === true ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : usernameAvailable === false ? (
                      <X className="w-5 h-5 text-red-400" />
                    ) : null}
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {username.length >= 3 && usernameAvailable === false && 'Username already taken'}
                {username.length >= 3 && usernameAvailable === true && 'Username available!'}
                {username.length < 3 && '3-30 characters, letters, numbers, and underscores only'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Designation / Role</label>
              <input
                type="text"
                value={investorData.designation}
                onChange={(e) => setInvestorData({ ...investorData, designation: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Partner at Sequoia, Angel Investor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Prior Investment Experience</label>
              <textarea
                value={investorData.prior_investment_experience}
                onChange={(e) => setInvestorData({ ...investorData, prior_investment_experience: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Summary of notable past investments or portfolio focus"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Typical Cheque Size</label>
              <input
                type="text"
                value={investorData.typical_cheque_size}
                onChange={(e) => setInvestorData({ ...investorData, typical_cheque_size: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., $100k - $500k, $1M+"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Investment Style / Focus</label>
              <input
                type="text"
                value={investorData.investment_style}
                onChange={(e) => setInvestorData({ ...investorData, investment_style: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Seed, Series A, Fintech, SaaS, Deep Tech"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !usernameAvailable}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
