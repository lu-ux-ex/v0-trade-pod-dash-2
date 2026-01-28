-- Create facilities table for bookable rooms/spaces

CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meeting_room', 'hot_desk', 'workshop', 'training_room', 'storage')),
  capacity INTEGER DEFAULT 1,
  hourly_rate DECIMAL(10,2),
  description TEXT,
  amenities TEXT[],
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Everyone can view available facilities
CREATE POLICY "anyone_view_facilities" ON public.facilities
  FOR SELECT USING (is_available = true);

-- Admins can view all facilities
CREATE POLICY "admins_view_all_facilities" ON public.facilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can manage facilities
CREATE POLICY "admins_manage_facilities" ON public.facilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
