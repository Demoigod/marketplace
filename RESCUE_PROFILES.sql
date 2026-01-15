-- ============================================================================
-- 🚨 EMERGENCY PROFILE CREATOR & SYNC 🚨
-- ============================================================================
-- This script ENSURES every user in Auth has a profile record with data.

-- 1. CLEANUP TYPES & CONSTRAINTS AGAIN (Just in case)
DO $$ 
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_check;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS immutable_user_code_check;
    
    -- Ensure columns are TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='immutable_user_code') THEN
        ALTER TABLE public.profiles ALTER COLUMN immutable_user_code TYPE TEXT USING immutable_user_code::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='public_user_id') THEN
        ALTER TABLE public.profiles ALTER COLUMN public_user_id TYPE TEXT USING public_user_id::text;
    END IF;
END $$;

-- 2. CREATE MISSING PROFILES
INSERT INTO public.profiles (
    id, 
    username, 
    first_name, 
    last_name, 
    full_name, 
    email, 
    phone_number, 
    role,
    avatar_url
)
SELECT 
    id,
    COALESCE((raw_user_meta_data::jsonb)->>'username', 'User_' || substr(id::text, 1, 8)),
    (raw_user_meta_data::jsonb)->>'first_name',
    (raw_user_meta_data::jsonb)->>'last_name',
    COALESCE((raw_user_meta_data::jsonb)->>'full_name', (COALESCE((raw_user_meta_data::jsonb)->>'first_name', '') || ' ' || COALESCE((raw_user_meta_data::jsonb)->>'last_name', ''))),
    email,
    (raw_user_meta_data::jsonb)->>'phone',
    COALESCE((raw_user_meta_data::jsonb)->>'role', 'buyer'),
    'https://ui-avatars.com/api/?name=' || COALESCE((raw_user_meta_data::jsonb)->>'username', 'User') || '&background=368CBF&color=fff'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
    email = COALESCE(public.profiles.email, EXCLUDED.email);

-- 3. ENSURE IDS EXIST FOR ALL
UPDATE public.profiles 
SET immutable_user_code = generate_professional_id() 
WHERE immutable_user_code IS NULL;

UPDATE public.profiles 
SET public_user_id = immutable_user_code 
WHERE public_user_id IS NULL;

NOTIFY pgrst, 'reload schema';
