/*
  # Add Threaded Comments Support

  1. Changes
    - Add `parent_comment_id` column to comments table for threading
    - Add `replies_count` column to comments table to track reply counts
    - Add foreign key constraint for parent_comment_id
    
  2. Security
    - Maintains existing RLS policies
    - Foreign key ensures data integrity
*/

-- Add parent_comment_id for threaded replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add replies_count to track number of replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'replies_count'
  ) THEN
    ALTER TABLE comments ADD COLUMN replies_count integer DEFAULT 0;
  END IF;
END $$;

-- Create index on parent_comment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Create index on post_id and parent_comment_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON comments(post_id, parent_comment_id);
