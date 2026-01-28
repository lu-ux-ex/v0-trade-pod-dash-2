-- Add accreditations column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS accreditations TEXT[] DEFAULT '{}';

-- Add portfolio_photos column for the Photos tab
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS portfolio_photos TEXT[] DEFAULT '{}';

-- Add location column (separate from trade_type)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;
