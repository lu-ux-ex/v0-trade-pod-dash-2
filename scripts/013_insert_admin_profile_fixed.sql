-- Insert admin profile for la@tradepod.uk
-- Find the user ID from auth.users and insert profile

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  role,
  membership_type,
  has_virtual_mail,
  has_leads_access,
  has_directory_listing,
  is_active,
  must_change_password,
  profile_completed
)
SELECT 
  id,
  'la@tradepod.uk',
  'TradePod Admin',
  'TradePod',
  'admin',
  'enterprise',
  true,
  true,
  true,
  true,
  true,
  true
FROM auth.users
WHERE email = 'la@tradepod.uk'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  membership_type = 'enterprise',
  has_virtual_mail = true,
  has_leads_access = true,
  has_directory_listing = true,
  is_active = true,
  must_change_password = true;
