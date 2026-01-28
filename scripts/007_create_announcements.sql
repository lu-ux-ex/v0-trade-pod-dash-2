-- Create announcements table

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'general' CHECK (announcement_type IN ('general', 'important', 'event', 'maintenance')),
  target_roles TEXT[] DEFAULT ARRAY['admin', 'member', 'partner'],
  cta_text TEXT,
  cta_link TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Users can view published announcements for their role
CREATE POLICY "users_view_announcements" ON public.announcements
  FOR SELECT USING (
    is_published = true 
    AND (expiry_date IS NULL OR expiry_date > NOW())
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = ANY(target_roles)
    )
  );

-- Admins can manage announcements
CREATE POLICY "admins_manage_announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published, publish_date);
