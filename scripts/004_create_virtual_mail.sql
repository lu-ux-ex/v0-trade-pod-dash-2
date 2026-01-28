-- Create virtual mail table

CREATE TABLE IF NOT EXISTS public.virtual_mail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  mail_type TEXT DEFAULT 'letter' CHECK (mail_type IN ('letter', 'parcel', 'legal', 'package')),
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'scanned', 'forwarded', 'collected')),
  received_date TIMESTAMPTZ DEFAULT NOW(),
  scan_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.virtual_mail ENABLE ROW LEVEL SECURITY;

-- Users with virtual mail access can view their own mail
CREATE POLICY "users_view_own_mail" ON public.virtual_mail
  FOR SELECT USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.has_virtual_mail = true
    )
  );

-- Admins can view and manage all mail
CREATE POLICY "admins_manage_mail" ON public.virtual_mail
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_mail_user ON public.virtual_mail(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_status ON public.virtual_mail(status);
