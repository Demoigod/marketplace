-- Quick verification script for Post Item feature
-- Run this in Supabase SQL Editor to check your setup

-- 1. Check if images column exists in market_listings
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'market_listings' 
AND column_name IN ('images', 'image_url', 'seller_id', 'status');

-- 2. Check storage bucket exists
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
WHERE name = 'listing-images';

-- 3. Check storage policies
SELECT 
    name,
    definition,
    command
FROM storage.policies 
WHERE bucket_id = 'listing-images';

-- 4. Test if you can insert a listing (replace with your actual user ID)
-- First, get your user ID:
SELECT id, email FROM auth.users LIMIT 1;

-- Then try a test insert (REPLACE 'your-user-id-here' with actual ID from above):
/*
INSERT INTO market_listings (
    seller_id,
    title,
    description,
    price,
    category,
    images,
    status
) VALUES (
    'your-user-id-here',
    'Test Item',
    'Test description',
    99.99,
    'electronics',
    ARRAY['https://example.com/test.jpg'],
    'active'
) RETURNING *;
*/

-- 5. Check RLS policies on market_listings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'market_listings';
