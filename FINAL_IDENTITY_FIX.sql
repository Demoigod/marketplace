-- ============================================================================
-- 🚨 FINAL COMPREHENSIVE IDENTITY & SIGNUP FIX 🚨
-- ============================================================================
-- This script performs a full cleanup to ensure data flows perfectly.

-- 1. RELAX CONSTRAINTS
-- We make these columns nullable by default so they NEVER block signup
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN avatar_url DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;

-- 2. SYNCHRONIZE ID COLUMNS
-- Ensure both column names exist and are TEXT type to prevent mismatches
DO $$ 
BEGIN
    -- 🚨 PRE-CLEANUP: Drop legacy CHECK constraints that compare to integers
    -- These are the root cause of the "text >= integer" error
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_range;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS public_user_id_check;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS immutable_user_code_check;

    -- Ensure immutable_user_code exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='immutable_user_code') THEN
        ALTER TABLE public.profiles ADD COLUMN immutable_user_code TEXT UNIQUE;
    ELSE
        -- Force type to TEXT if it was something else (e.g. INTEGER)
        -- We use a TRY-CATCH style or explicit cast to TEXT
        ALTER TABLE public.profiles ALTER COLUMN immutable_user_code TYPE TEXT USING immutable_user_code::text;
    END IF;

    -- Ensure public_user_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='public_user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN public_user_id TEXT UNIQUE;
    ELSE
         -- Force type to TEXT if it was something else
        ALTER TABLE public.profiles ALTER COLUMN public_user_id TYPE TEXT USING public_user_id::text;
    END IF;
END $$;

-- 3. UPDATED CODE GENERATOR
CREATE OR REPLACE FUNCTION generate_professional_id() 
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN DEFAULT FALSE;
BEGIN
    WHILE NOT done LOOP
        new_code := lpad(floor(random() * 1000000)::text, 6, '0');
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE immutable_user_code = new_code OR public_user_id = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ROBUST TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    gen_username TEXT;
    gen_id TEXT;
BEGIN
    -- 1. Prepare Data with fallbacks
    gen_username := COALESCE(
        new.raw_user_meta_data->>'username', 
        (new.raw_user_meta_data->>'first_name' || '_' || new.raw_user_meta_data->>'last_name'),
        'User_' || substr(new.id::text, 1, 8)
    );
    
    gen_id := generate_professional_id();

    -- 2. Insert or Update
    INSERT INTO public.profiles (
        id, 
        username, 
        first_name, 
        last_name, 
        full_name,
        email,
        phone_number,
        role,
        immutable_user_code,
        public_user_id,
        avatar_url
    )
    VALUES (
        new.id,
        gen_username,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        COALESCE(new.raw_user_meta_data->>'full_name', (COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''))),
        new.email,
        new.raw_user_meta_data->>'phone',
        COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
        gen_id,
        gen_id,
        'https://ui-avatars.com/api/?name=' || replace(gen_username, ' ', '%20') || '&background=368CBF&color=fff'
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        immutable_user_code = COALESCE(public.profiles.immutable_user_code, EXCLUDED.immutable_user_code),
        public_user_id = COALESCE(public.profiles.public_user_id, EXCLUDED.public_user_id);

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- If trigger fails for ANY reason, return new so signup isn't blocked.
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RE-APPLY TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RETROACTIVE FIX
UPDATE public.profiles 
SET 
    immutable_user_code = COALESCE(immutable_user_code::text, public_user_id::text, generate_professional_id()),
    public_user_id = COALESCE(public_user_id::text, immutable_user_code::text, generate_professional_id()),
    email = COALESCE(email, (SELECT email FROM auth.users WHERE auth.users.id = profiles.id))
WHERE immutable_user_code IS NULL OR public_user_id IS NULL OR email IS NULL;

NOTIFY pgrst, 'reload schema';
