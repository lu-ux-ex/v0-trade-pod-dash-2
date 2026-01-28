-- Update la@tradepod.uk to have admin role
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'la@tradepod.uk';
