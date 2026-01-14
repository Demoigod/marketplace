-- 1. Ensure all columns exist in public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Relax legacy NOT NULL constraints that might block the trigger
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='name') THEN
        ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;
    END IF;
END $$;
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;

-- 3. Update the handle_new_user trigger function to be extremely robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    gen_username TEXT;
BEGIN
    -- Generate a fallback username
    gen_username := COALESCE(
        new.raw_user_meta_data->>'username', 
        (new.raw_user_meta_data->>'first_name' || '_' || new.raw_user_meta_data->>'last_name'),
        'User_' || substr(new.id::text, 1, 8)
    );

    INSERT INTO public.profiles (
        id, 
        username, 
        first_name, 
        last_name, 
        phone, 
        role,
        full_name,
        avatar_url
    )
    VALUES (
        new.id,
        gen_username,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'role',
        COALESCE(new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name')),
        'https://ui-avatars.com/api/?name=' || gen_username || '&background=368CBF&color=fff'
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- If it fails, we still return the user so registration isn't blocked, 
    -- but we log the error.
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Sync existing tables that might be using profiles
-- Ensure real-time is still active for name change
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.profiles, public.market_listings;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
