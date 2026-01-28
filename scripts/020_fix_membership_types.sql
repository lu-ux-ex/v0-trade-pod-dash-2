-- Fix membership type check constraint to match the actual values being used
-- Drop the old constraint and add a new one with correct values

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_membership_type_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_membership_type_check 
  CHECK (membership_type IN ('workspace', 'virtual_office', 'directory', 'basic', 'professional', 'enterprise'));

-- Update existing records that have old values
UPDATE profiles SET membership_type = 'workspace' WHERE membership_type = 'basic';
UPDATE profiles SET membership_type = 'workspace' WHERE membership_type = 'professional';
UPDATE profiles SET membership_type = 'workspace' WHERE membership_type = 'enterprise';
