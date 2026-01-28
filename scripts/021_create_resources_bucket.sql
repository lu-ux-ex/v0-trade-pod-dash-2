-- Create resources storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to read resources
CREATE POLICY "anyone_read_resources" ON storage.objects
FOR SELECT USING (bucket_id = 'resources');

-- Allow admins to upload resources  
CREATE POLICY "admins_upload_resources" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete resources
CREATE POLICY "admins_delete_resources" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resources' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
