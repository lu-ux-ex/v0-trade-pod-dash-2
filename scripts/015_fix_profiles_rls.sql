-- Fix infinite recursion in profiles RLS policies
-- The issue is that policies are checking auth.uid() against the profiles table,
-- which itself triggers the policy check, causing infinite recursion

-- First, drop all existing policies on profiles
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_delete_profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create simple, non-recursive policies
-- Users can always view their own profile (simple id check, no subquery)
CREATE POLICY "users_select_own"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can always update their own profile
CREATE POLICY "users_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow insert for authenticated users (for profile creation)
CREATE POLICY "users_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- For admin access, we'll use a service role in the API instead of RLS
-- This avoids the recursion issue entirely
