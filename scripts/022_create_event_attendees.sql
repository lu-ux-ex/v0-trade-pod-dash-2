-- Create event_attendees table for tracking RSVPs
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Users can see their own RSVPs
CREATE POLICY "users_view_own_rsvps" ON event_attendees
  FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own RSVPs
CREATE POLICY "users_add_own_rsvps" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own RSVPs
CREATE POLICY "users_delete_own_rsvps" ON event_attendees
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can see all RSVPs
CREATE POLICY "admins_view_all_rsvps" ON event_attendees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
