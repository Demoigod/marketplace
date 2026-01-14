-- ULTIMATE RELATIONSHIP & VISIBILITY FIX
-- This script ensures the database structure allows the app to fetch listings with user data.

-- 1. Explicitly link market_listings to profiles
-- This allows the "join" (profiles(...)) to work in Supabase
ALTER TABLE IF EXISTS public.market_listings 
DROP CONSTRAINT IF EXISTS market_listings_seller_id_fkey,
DROP CONSTRAINT IF EXISTS market_listings_user_id_fkey;

-- We link it to public.profiles specifically so Supabase knows the relationship
ALTER TABLE IF EXISTS public.market_listings
ADD CONSTRAINT market_listings_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 2. Double-check RLS policies (Ensure they are broad enough)
DROP POLICY IF EXISTS "Anyone can view listings" ON public.market_listings;
CREATE POLICY "Anyone can view listings" ON public.market_listings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

-- 3. Ensure columns exist (insurance)
ALTER TABLE public.market_listings 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 4. Fill in missing status if any
UPDATE public.market_listings SET status = 'active' WHERE status IS NULL;

-- 5. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- 6. Verification query (run this after):
-- SELECT m.title, p.username FROM public.market_listings m JOIN public.profiles p ON m.seller_id = p.id LIMIT 5;
