-- Create perks/deals table

CREATE TABLE IF NOT EXISTS public.perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  partner_id UUID REFERENCES public.profiles(id),
  partner_name TEXT NOT NULL,
  discount_value TEXT,
  discount_code TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('tools', 'insurance', 'software', 'services', 'supplies', 'other')),
  terms TEXT,
  valid_until DATE,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  redemption_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.perks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active perks
CREATE POLICY "users_view_perks" ON public.perks
  FOR SELECT USING (is_active = true);

-- Partners can manage their own perks
CREATE POLICY "partners_manage_own_perks" ON public.perks
  FOR ALL USING (
    partner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'partner'
    )
  );

-- Admins can manage all perks
CREATE POLICY "admins_manage_perks" ON public.perks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_perks_category ON public.perks(category);
CREATE INDEX IF NOT EXISTS idx_perks_active ON public.perks(is_active);
