-- Add images array to market_listings if it doesn't exist
ALTER TABLE public.market_listings 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for listing-images
-- 1. Anyone can view listing images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'listing-images' );

-- 2. Authenticated users can upload item images
CREATE POLICY "Users can upload listing images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'listing-images'
);

-- 3. Users can update/delete their own listing images (based on path prefixing by user ID)
CREATE POLICY "Users can manage own listing images" 
ON storage.objects FOR ALL 
USING (
    auth.uid()::text = (storage.foldername(name))[1] AND
    bucket_id = 'listing-images'
);
