-- Create resources table

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'guides' CHECK (category IN ('guides', 'templates', 'legal', 'training', 'policies')),
  file_url TEXT,
  file_type TEXT,
  file_size TEXT,
  target_roles TEXT[] DEFAULT ARRAY['admin', 'member', 'partner'],
  download_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Users can view published resources for their role
CREATE POLICY "users_view_resources" ON public.resources
  FOR SELECT USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = ANY(target_roles)
    )
  );

-- Admins can manage resources
CREATE POLICY "admins_manage_resources" ON public.resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
