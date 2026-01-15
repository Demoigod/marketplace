-- ACCOUNT PROFILE & IDENTITY SYSTEM UPGRADE
-- This script aligns the profiles table with the required data model

-- 1. Add missing columns to profiles table
DO $$
BEGIN
    -- Add first_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;

    -- Add last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;

    -- Add email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;

    -- Add phone_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
    END IF;

    -- Add immutable_user_code (6-digit ID)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'immutable_user_code') THEN
        ALTER TABLE public.profiles ADD COLUMN immutable_user_code TEXT UNIQUE;
    END IF;
END $$;

-- 2. Function to generate a random 6-digit code
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
$$ LANGUAGE plpgsql;

-- 3. Update Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        username, 
        first_name, 
        last_name, 
        full_name,
        email,
        phone_number,
        immutable_user_code
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', 'User_' || substr(new.id::text, 1, 8)),
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''),
        new.email, -- Captured from auth.users email
        new.raw_user_meta_data->>'phone',
        generate_immutable_code() -- Always generate a fresh 6-digit code
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Retroactively populate email and immutable_user_code for existing users if missing
UPDATE public.profiles p
SET 
    email = u.email,
    immutable_user_code = COALESCE(p.immutable_user_code, generate_immutable_code())
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.immutable_user_code IS NULL);

-- 5. Row Level Security refinement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

NOTIFY pgrst, 'reload schema';
