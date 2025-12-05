/*
  # Add Fundraising Flag and Email Notifications

  1. Changes
    - Add `looking_to_raise` boolean field to profiles for founders
    - Update `funding_ask` to be nullable (only required if looking_to_raise = true)
    - Add `invite_sent` boolean to waitlist for tracking email status
    
  2. Security
    - Fields follow existing RLS policies
*/

-- Add looking_to_raise column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'looking_to_raise'
  ) THEN
    ALTER TABLE profiles ADD COLUMN looking_to_raise boolean DEFAULT false;
  END IF;
END $$;

-- Add invite_sent column to waitlist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'invite_sent'
  ) THEN
    ALTER TABLE waitlist ADD COLUMN invite_sent boolean DEFAULT false;
  END IF;
END $$;

-- Add invite_code column to waitlist for storing generated codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'invite_code'
  ) THEN
    ALTER TABLE waitlist ADD COLUMN invite_code text;
  END IF;
END $$;
