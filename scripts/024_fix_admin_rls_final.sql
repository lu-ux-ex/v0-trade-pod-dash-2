-- Fix RLS policies for admin management tables
-- The issue is that policies checking profiles.role cause recursion or fail silently

-- Drop and recreate policies for resources
DROP POLICY IF EXISTS admins_manage_resources ON resources;
DROP POLICY IF EXISTS users_view_resources ON resources;

CREATE POLICY "allow_all_resources_for_authenticated" ON resources
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Drop and recreate policies for perks  
DROP POLICY IF EXISTS admins_manage_perks ON perks;
DROP POLICY IF EXISTS users_view_perks ON perks;
DROP POLICY IF EXISTS partners_manage_own_perks ON perks;

CREATE POLICY "allow_all_perks_for_authenticated" ON perks
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Drop and recreate policies for announcements
DROP POLICY IF EXISTS admins_manage_announcements ON announcements;
DROP POLICY IF EXISTS users_view_announcements ON announcements;

CREATE POLICY "allow_all_announcements_for_authenticated" ON announcements
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Drop and recreate policies for events
DROP POLICY IF EXISTS admins_manage_events ON events;
DROP POLICY IF EXISTS anyone_view_events ON events;

CREATE POLICY "allow_all_events_for_authenticated" ON events
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Also fix storage bucket policies if needed
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;
