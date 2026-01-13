-- ============================================================================
-- 🚨 DEFINITIVE FIX: UNBLOCK SIGNUP 🚨
-- ============================================================================
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR
-- This script completely removes all "Public ID" modifications to ensure
-- user registration is no longer blocked.
-- ============================================================================

BEGIN;

-- 1. Drop the foreign key from market_listings FIRST
ALTER TABLE public.market_listings DROP CONSTRAINT IF EXISTS fk_seller_public_id;

-- 2. Drop the column from market_listings 
ALTER TABLE public.market_listings DROP COLUMN IF EXISTS seller_public_id;

-- 3. Drop all constraints from profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_unique;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;

-- 3.5 Drop RLS policies that depend on public_user_id
-- We drop all potential variations to be safe
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public user IDs are readable" ON public.profiles;

-- 4. Drop the triggers
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

-- 5. Drop the functions
DROP FUNCTION IF EXISTS assign_public_user_id() CASCADE;
DROP FUNCTION IF EXISTS generate_public_user_id() CASCADE;

-- 6. Drop the column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS public_user_id;

-- 7. Reset the handle_new_user function to its base version to be safe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'User_' || substr(new.id::text, 1, 8)),
        new.raw_user_meta_data->>'name'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Restore standard RLS policies
-- We drop again right before create to ensure no name collisions
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

COMMIT;

-- ============================================================================
-- ✅ VERIFICATION
-- ============================================================================
-- The following query should return 0 rows (confirming the column is gone)
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'public_user_id';
