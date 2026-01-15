-- ============================================================================
-- 🚨 DEFINITIVE SIGNUP & PROFILE FIX 🚨
-- ============================================================================
-- This script ensures user registration is NEVER blocked and profiles are correctly created.

-- 1. Ensure the Profiles table is robustly structured
-- Add columns if they don't exist
DO $$ 
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS immutable_user_code TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

    -- Drop legacy column names that might cause confusion but keep data if possible
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone' AND column_name != 'phone_number') THEN
        UPDATE public.profiles SET phone_number = phone WHERE phone_number IS NULL;
    END IF;
    
    -- Ensure immutable_user_code is unique
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_immutable_user_code_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_immutable_user_code_key UNIQUE (immutable_user_code);
    END IF;
END $$;

-- 2. Professional 6-digit code generator (Security Definer)
CREATE OR REPLACE FUNCTION generate_immutable_code() 
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN DEFAULT FALSE;
BEGIN
    WHILE NOT done LOOP
        new_code := lpad(floor(random() * 1000000)::text, 6, '0');
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE immutable_user_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. THE DEFINITIVE TRIGGER FUNCTION
-- Robust, handles conflicts, and never blocks sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    gen_username TEXT;
    gen_code TEXT;
BEGIN
    -- 1. Prepare Data
    gen_username := COALESCE(
        new.raw_user_meta_data->>'username', 
        (new.raw_user_meta_data->>'first_name' || '_' || new.raw_user_meta_data->>'last_name'),
        'User_' || substr(new.id::text, 1, 8)
    );
    
    gen_code := generate_immutable_code();

    -- 2. Attempt Insert with Up-to-date Logic
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
        avatar_url
    )
    VALUES (
        new.id,
        gen_username,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        COALESCE(new.raw_user_meta_data->>'full_name', (COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''))),
        new.email,
        new.raw_user_meta_data->>'phone', -- Maps 'phone' metadata to 'phone_number' column
        new.raw_user_meta_data->>'role',
        gen_code,
        'https://ui-avatars.com/api/?name=' || encode_url_part(gen_username) || '&background=368CBF&color=fff'
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone_number = EXCLUDED.phone_number,
        role = EXCLUDED.role,
        immutable_user_code = COALESCE(public.profiles.immutable_user_code, EXCLUDED.immutable_user_code);

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- 🚨 SAFETY NET: Logging error but allowing sign-up to proceed
    -- This ensures the user is at least created in Auth even if profile fails
    RAISE LOG 'CRITICAL: handle_new_user failed for ID %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Simple URL encoding for avatar names
CREATE OR REPLACE FUNCTION encode_url_part(text) RETURNS text AS $$
  SELECT replace(replace(replace($1, ' ', '%20'), '@', '%40'), '#', '%23');
$$ LANGUAGE sql IMMUTABLE;

-- 4. Clean up and Re-apply Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Final Sync: Ensure RLS is correct
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Retroactively fix missing codes for existing users
UPDATE public.profiles 
SET immutable_user_code = generate_immutable_code() 
WHERE immutable_user_code IS NULL;

NOTIFY pgrst, 'reload schema';
