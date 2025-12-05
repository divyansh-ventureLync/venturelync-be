/*
  # Fix Security and Performance Issues

  1. Add Missing Indexes for Foreign Keys
    - Add index on `comments.author_id`
    - Add index on `invite_codes.used_by`
    - Add index on `milestones.user_id`
    - Add index on `xp_events.comment_id`
    - Add index on `xp_events.post_id`

  2. Optimize RLS Policies
    - Replace `auth.uid()` with `(select auth.uid())` in all policies
    - This prevents re-evaluation for each row, improving query performance

  3. Notes
    - Unused indexes warnings can be ignored - they will be used as the application scales
    - Password leak protection should be enabled in Supabase dashboard settings
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON public.invite_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_comment_id ON public.xp_events(comment_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_post_id ON public.xp_events(post_id);

-- Optimize RLS policies for profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Optimize RLS policies for posts table
DROP POLICY IF EXISTS "Users can create own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;

CREATE POLICY "Users can create own posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = (select auth.uid()));

CREATE POLICY "Users can update own posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (author_id = (select auth.uid()))
  WITH CHECK (author_id = (select auth.uid()));

-- Optimize RLS policies for upvotes table
DROP POLICY IF EXISTS "Users can create own upvotes" ON public.upvotes;
DROP POLICY IF EXISTS "Users can delete own upvotes" ON public.upvotes;

CREATE POLICY "Users can create own upvotes"
  ON public.upvotes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own upvotes"
  ON public.upvotes
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize RLS policies for comments table
DROP POLICY IF EXISTS "Users can create own comments" ON public.comments;

CREATE POLICY "Users can create own comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = (select auth.uid()));

-- Optimize RLS policies for connections table
DROP POLICY IF EXISTS "Users can read own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update received connections" ON public.connections;

CREATE POLICY "Users can read own connections"
  ON public.connections
  FOR SELECT
  TO authenticated
  USING (
    requester_id = (select auth.uid()) OR 
    recipient_id = (select auth.uid())
  );

CREATE POLICY "Users can create connections"
  ON public.connections
  FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = (select auth.uid()));

CREATE POLICY "Users can update received connections"
  ON public.connections
  FOR UPDATE
  TO authenticated
  USING (recipient_id = (select auth.uid()))
  WITH CHECK (recipient_id = (select auth.uid()));

-- Optimize RLS policies for xp_events table
DROP POLICY IF EXISTS "Users can read own xp events" ON public.xp_events;
DROP POLICY IF EXISTS "Users can create xp events" ON public.xp_events;

CREATE POLICY "Users can read own xp events"
  ON public.xp_events
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create xp events"
  ON public.xp_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Optimize RLS policies for milestones table
DROP POLICY IF EXISTS "Users can create own milestones" ON public.milestones;

CREATE POLICY "Users can create own milestones"
  ON public.milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Optimize RLS policies for user_daily_xp table
DROP POLICY IF EXISTS "Users can read own daily xp" ON public.user_daily_xp;
DROP POLICY IF EXISTS "Users can insert own daily xp" ON public.user_daily_xp;
DROP POLICY IF EXISTS "Users can update own daily xp" ON public.user_daily_xp;

CREATE POLICY "Users can read own daily xp"
  ON public.user_daily_xp
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own daily xp"
  ON public.user_daily_xp
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own daily xp"
  ON public.user_daily_xp
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));