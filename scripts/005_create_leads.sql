-- Create leads table

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  project_type TEXT,
  description TEXT,
  location TEXT,
  budget TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  source TEXT DEFAULT 'directory',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Users with leads access can view their own leads
CREATE POLICY "users_view_own_leads" ON public.leads
  FOR SELECT USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.has_leads_access = true
    )
  );

-- Users can update their own leads
CREATE POLICY "users_update_own_leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all leads
CREATE POLICY "admins_manage_leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow inserting leads for any user (from directory)
CREATE POLICY "anyone_insert_leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_user ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
