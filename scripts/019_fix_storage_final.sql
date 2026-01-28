-- Fix storage bucket permissions for avatar and photo uploads
-- This script recreates the buckets with proper public access

-- First, ensure the buckets exist and are public
UPDATE storage.buckets SET public = true WHERE id = 'avatars';
UPDATE storage.buckets SET public = true WHERE id = 'photos';

-- If buckets don't exist, create them
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies on avatars bucket
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar read policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

-- Drop all existing policies on photos bucket
DROP POLICY IF EXISTS "Photo upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Photo read policy" ON storage.objects;
DROP POLICY IF EXISTS "Photo update policy" ON storage.objects;
DROP POLICY IF EXISTS "Photo delete policy" ON storage.objects;
DROP POLICY IF EXISTS "photos_upload" ON storage.objects;
DROP POLICY IF EXISTS "photos_read" ON storage.objects;
DROP POLICY IF EXISTS "photos_update" ON storage.objects;
DROP POLICY IF EXISTS "photos_delete" ON storage.objects;

-- Create simple policies that allow authenticated users to manage their files
-- Avatars bucket - authenticated users can do anything
CREATE POLICY "avatars_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- Photos bucket - authenticated users can do anything
CREATE POLICY "photos_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "photos_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'photos');

CREATE POLICY "photos_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'photos');

CREATE POLICY "photos_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'photos');

-- Also allow public/anon users to read (for displaying images)
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'avatars');

CREATE POLICY "photos_public_read" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'photos');
