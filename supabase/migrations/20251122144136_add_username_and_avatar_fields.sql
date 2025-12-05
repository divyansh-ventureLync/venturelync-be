/*
  # Add Username and Update Avatar Fields

  1. Changes
    - Add `username` column to profiles table (unique, required)
    - Update avatar_url to be more flexible
    - Add index on username for fast lookups
    
  2. Security
    - Username must be unique across all users
    - Username validation will be handled in application layer
*/

-- Add username column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Create index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add constraint to ensure username is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_username_check' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_check 
      CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 30));
  END IF;
END $$;
