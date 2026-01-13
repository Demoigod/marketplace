-- ============================================================================
-- DEBUGGING: Check current state before rollback
-- ============================================================================
-- 1. Check profiles table columns
-- SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles';

-- 2. Check triggers on profiles
-- SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_schema = 'public' AND event_object_table = 'profiles';

-- 3. Check constraints on profiles
-- SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass;

-- ============================================================================
-- ROLLBACK: Remove public_user_id Column Temporarily
-- ============================================================================
-- This will remove the public_user_id column so signups work again
-- We can add it back later with proper setup
-- ============================================================================

-- Step 1: Drop foreign key from market_listings FIRST (it depends on the constraint)
ALTER TABLE public.market_listings DROP CONSTRAINT IF EXISTS fk_seller_public_id;

-- Step 2: Drop the column from market_listings
ALTER TABLE public.market_listings DROP COLUMN IF EXISTS seller_public_id;

-- Step 3: Drop the trigger
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

-- Step 4: Drop the trigger function
DROP FUNCTION IF EXISTS assign_public_user_id();

-- Step 5: Drop the generation function
DROP FUNCTION IF EXISTS generate_public_user_id();

-- Step 6: Drop constraints from profiles (now that dependencies are gone)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_unique;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;

-- Step 7: Drop the column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS public_user_id;

-- ============================================================================
-- ✅ DONE - Signups should work now!
-- ============================================================================
-- The public_user_id feature has been completely removed
-- Your app will work normally without it
-- We can add it back later with a better implementation
-- ============================================================================

-- Verify the column is gone:
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'public_user_id';

-- Expected: 0 rows (column doesn't exist)
