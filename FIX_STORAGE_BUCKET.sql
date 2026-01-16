-- Force the bucket to be public (in case it existed as private)
UPDATE storage.buckets
SET public = true
WHERE id = 'listing-images';

-- Ensure the bucket exists if it didn't
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Re-apply the Public Access policy just to be absolutely sure
DROP POLICY IF EXISTS "Public Access Listing Images" ON storage.objects;
CREATE POLICY "Public Access Listing Images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'listing-images' );

-- Verify the policy for authenticated uploads again
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'listing-images'
);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
