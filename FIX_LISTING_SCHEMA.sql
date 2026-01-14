-- FINAL SCHEMA SYNC FOR MARKET LISTINGS
-- This script ensures all columns required by the frontend are present.

-- 1. Add missing columns to market_listings
ALTER TABLE public.market_listings 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT;

-- 2. Ensure RLS is correctly set for these columns
-- (Usually automatic, but good to ensure seller_public_id is handled if not already)
-- seller_public_id was added in safe-id-system.sql

-- 3. Backfill images if they exist in the array but not the primary column
UPDATE public.market_listings
SET image_url = images[1]
WHERE image_url IS NULL AND array_length(images, 1) > 0;

-- 4. REFRESH CACHE
-- This is the MOST IMPORTANT STEP to resolve the PostgREST "schema cache" error.
NOTIFY pgrst, 'reload schema';

-- Verification:
-- SELECT id, title, image_url, category, seller_public_id FROM public.market_listings LIMIT 5;
