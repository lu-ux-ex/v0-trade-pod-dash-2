-- Add visible_to_directory_members column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS visible_to_directory_members boolean NOT NULL DEFAULT false;
