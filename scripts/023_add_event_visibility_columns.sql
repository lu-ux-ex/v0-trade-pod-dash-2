-- Add visibility and attendance columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS visible_to_members BOOLEAN DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS visible_to_partners BOOLEAN DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 50;

-- Update existing events to be visible to members by default
UPDATE events SET visible_to_members = true WHERE visible_to_members IS NULL;
UPDATE events SET visible_to_partners = true WHERE visible_to_partners IS NULL;
UPDATE events SET attendees = 0 WHERE attendees IS NULL;
UPDATE events SET max_capacity = COALESCE(capacity, 50) WHERE max_capacity IS NULL;
