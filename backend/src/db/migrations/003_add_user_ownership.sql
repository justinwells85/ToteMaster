-- Add user ownership to items and totes
-- This migration adds user_id foreign keys to enable multi-user support

-- Add user_id column to totes table
ALTER TABLE totes
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_totes_user_id ON totes(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);

-- Note: Existing data will have NULL user_id values
-- These should be cleaned up or assigned to a default user in production
