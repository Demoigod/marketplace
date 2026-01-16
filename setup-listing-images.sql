-- 1. Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for listing-images

-- Allow public access to view images
DROP POLICY IF EXISTS "Public Access Listing Images" ON storage.objects;
CREATE POLICY "Public Access Listing Images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'listing-images' );

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'listing-images'
);

-- Allow users to manage their own uploads
-- Note: This assumes folder structure is userId/filename
DROP POLICY IF EXISTS "Users can manage own listing images" ON storage.objects;
CREATE POLICY "Users can manage own listing images" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
