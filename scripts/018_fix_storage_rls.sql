-- Fix storage bucket RLS policies for avatars and photos

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload to photos bucket
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
