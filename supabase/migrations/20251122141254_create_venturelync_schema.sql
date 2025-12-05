/*
  # VentureLync Database Schema

  ## Overview
  Complete database schema for VentureLync MVP including gamification engine.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `user_type` (text) - 'founder' or 'investor'
  - `email` (text, unique)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### Founder-specific fields
  - `work_email` (text)
  - `startup_website` (text)
  - `pitch_deck_url` (text)
  - `startup_stage` (text)
  - `funding_ask` (text)
  - `startup_brief` (text)
  - `education` (text)
  - `past_experience` (text)
  
  ### Investor-specific fields
  - `designation` (text)
  - `prior_investment_experience` (text)
  - `typical_cheque_size` (text)
  - `investment_style` (text)
  
  ### Gamification fields
  - `total_xp` (integer, default 0)
  - `current_level` (integer, default 1)
  - `current_streak` (integer, default 0)
  - `last_post_date` (date, nullable)
  - `profile_completed` (boolean, default false)

  ### `invite_codes`
  - `id` (uuid, primary key)
  - `code` (text, unique)
  - `used_by` (uuid, nullable, references profiles)
  - `created_at` (timestamptz)
  - `used_at` (timestamptz, nullable)

  ### `waitlist`
  - `id` (uuid, primary key)
  - `email` (text, unique)
  - `created_at` (timestamptz)

  ### `posts`
  - `id` (uuid, primary key)
  - `author_id` (uuid, references profiles)
  - `content` (text, max 2000 chars)
  - `category` (text) - Build, Traction, Team, Reflection, Setback
  - `xp_awarded` (integer)
  - `is_setback` (boolean, default false)
  - `upvotes_count` (integer, default 0)
  - `comments_count` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `upvotes`
  - `id` (uuid, primary key)
  - `post_id` (uuid, references posts)
  - `user_id` (uuid, references profiles)
  - `created_at` (timestamptz)
  - Unique constraint on (post_id, user_id)

  ### `comments`
  - `id` (uuid, primary key)
  - `post_id` (uuid, references posts)
  - `author_id` (uuid, references profiles)
  - `content` (text)
  - `xp_awarded` (integer, default 0)
  - `created_at` (timestamptz)

  ### `connections`
  - `id` (uuid, primary key)
  - `requester_id` (uuid, references profiles)
  - `recipient_id` (uuid, references profiles)
  - `status` (text) - 'pending', 'accepted', 'rejected'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `xp_events`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `event_type` (text) - execution, reflection, setback, streak_bonus, comment
  - `xp_amount` (integer)
  - `post_id` (uuid, nullable, references posts)
  - `comment_id` (uuid, nullable, references comments)
  - `description` (text)
  - `created_at` (timestamptz)

  ### `milestones`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `milestone_type` (text) - first_customer, first_revenue, etc.
  - `achieved_at` (timestamptz)

  ### `user_daily_xp`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `date` (date)
  - `total_xp` (integer, default 0)
  - `reflection_count` (integer, default 0)
  - `setback_count` (integer, default 0)
  - Unique constraint on (user_id, date)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users with ownership checks
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  user_type text NOT NULL CHECK (user_type IN ('founder', 'investor')),
  email text UNIQUE NOT NULL,
  avatar_url text,
  
  -- Founder fields
  work_email text,
  startup_website text,
  pitch_deck_url text,
  startup_stage text,
  funding_ask text,
  startup_brief text,
  education text,
  past_experience text,
  
  -- Investor fields
  designation text,
  prior_investment_experience text,
  typical_cheque_size text,
  investment_style text,
  
  -- Gamification
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  last_post_date date,
  profile_completed boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  used_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL CHECK (char_length(content) <= 2000),
  category text NOT NULL CHECK (category IN ('Build', 'Traction', 'Team', 'Reflection', 'Setback')),
  xp_awarded integer DEFAULT 0,
  is_setback boolean DEFAULT false,
  upvotes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  xp_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) NOT NULL,
  recipient_id uuid REFERENCES profiles(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Create xp_events table
CREATE TABLE IF NOT EXISTS xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('execution', 'reflection', 'setback', 'streak_bonus', 'comment')),
  xp_amount integer NOT NULL,
  post_id uuid REFERENCES posts(id),
  comment_id uuid REFERENCES comments(id),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  milestone_type text NOT NULL,
  achieved_at timestamptz DEFAULT now()
);

-- Create user_daily_xp table for tracking daily limits
CREATE TABLE IF NOT EXISTS user_daily_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  date date NOT NULL,
  total_xp integer DEFAULT 0,
  reflection_count integer DEFAULT 0,
  setback_count integer DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_xp ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Invite codes policies
CREATE POLICY "Anyone can read invite codes"
  ON invite_codes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can update invite codes"
  ON invite_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Waitlist policies
CREATE POLICY "Anyone can insert waitlist"
  ON waitlist FOR INSERT
  TO anon
  WITH CHECK (true);

-- Posts policies
CREATE POLICY "Users can read all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Upvotes policies
CREATE POLICY "Users can read all upvotes"
  ON upvotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own upvotes"
  ON upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Connections policies
CREATE POLICY "Users can read own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received connections"
  ON connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- XP events policies
CREATE POLICY "Users can read own xp events"
  ON xp_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create xp events"
  ON xp_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can read all milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User daily XP policies
CREATE POLICY "Users can read own daily xp"
  ON user_daily_xp FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily xp"
  ON user_daily_xp FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily xp"
  ON user_daily_xp FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upvotes_post_id ON upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_daily_xp_user_date ON user_daily_xp(user_id, date);
