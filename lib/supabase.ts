import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'founder' | 'investor';

export interface Profile {
  id: string;
  user_type: UserType;
  email: string;
  username?: string;
  avatar_url?: string;
  work_email?: string;
  startup_website?: string;
  pitch_deck_url?: string;
  startup_stage?: string;
  looking_to_raise?: boolean;
  funding_ask?: string;
  startup_brief?: string;
  education?: string;
  past_experience?: string;
  designation?: string;
  prior_investment_experience?: string;
  typical_cheque_size?: string;
  investment_style?: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  last_post_date?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  category: 'Build' | 'Traction' | 'Team' | 'Reflection' | 'Setback';
  xp_awarded: number;
  is_setback: boolean;
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  user_upvoted?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  xp_awarded: number;
  parent_comment_id?: string;
  replies_count: number;
  created_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: Profile;
  recipient?: Profile;
}

export interface Milestone {
  id: string;
  user_id: string;
  milestone_type: string;
  achieved_at: string;
}

export interface XPEvent {
  id: string;
  user_id: string;
  event_type: 'execution' | 'reflection' | 'setback' | 'streak_bonus' | 'comment';
  xp_amount: number;
  post_id?: string;
  comment_id?: string;
  description?: string;
  created_at: string;
}
