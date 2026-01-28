-- Create profiles table with role-based access
-- Roles: 'admin', 'member', 'partner'

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'partner')),
  membership_type TEXT DEFAULT 'basic' CHECK (membership_type IN ('basic', 'professional', 'enterprise')),
  -- Feature access flags
  has_virtual_mail BOOLEAN DEFAULT false,
  has_leads_access BOOLEAN DEFAULT false,
  has_directory_listing BOOLEAN DEFAULT true,
  -- Profile details
  trade_type TEXT,
  bio TEXT,
  website TEXT,
  service_areas TEXT[],
  services TEXT[],
  avatar_url TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  profile_completed BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins can see all profiles
CREATE POLICY "admins_select_all_profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Users can see their own profile
CREATE POLICY "users_select_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Members and Partners can view directory listings (limited fields handled in app)
CREATE POLICY "members_view_directory" ON public.profiles
  FOR SELECT USING (
    has_directory_listing = true 
    AND is_active = true
  );

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "admins_update_all_profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Only admins can insert profiles (for creating new members)
CREATE POLICY "admins_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow insert for new users via trigger (service role)
CREATE POLICY "service_role_insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, must_change_password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'member'),
    COALESCE((NEW.raw_user_meta_data ->> 'must_change_password')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
