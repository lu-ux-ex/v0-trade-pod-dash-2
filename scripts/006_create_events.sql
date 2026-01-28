-- Create events table

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT DEFAULT 'networking' CHECK (event_type IN ('networking', 'workshop', 'training', 'social', 'webinar')),
  capacity INTEGER,
  is_published BOOLEAN DEFAULT false,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Everyone can view published events
CREATE POLICY "anyone_view_events" ON public.events
  FOR SELECT USING (is_published = true);

-- Admins can manage events
CREATE POLICY "admins_manage_events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can view their own RSVPs
CREATE POLICY "users_view_own_rsvps" ON public.event_rsvps
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own RSVPs
CREATE POLICY "users_manage_own_rsvps" ON public.event_rsvps
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all RSVPs
CREATE POLICY "admins_view_all_rsvps" ON public.event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON public.event_rsvps(event_id);
