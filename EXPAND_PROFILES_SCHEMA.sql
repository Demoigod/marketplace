-- 1. Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update the handle_new_user trigger function to capture more metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, first_name, last_name, phone)
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'username', 
            (new.raw_user_meta_data->>'first_name' || '_' || new.raw_user_meta_data->>'last_name'),
            'User_' || substr(new.id::text, 1, 8)
        ),
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Note: Existing users won't have this data until they update their profile 
-- or we manually backfill if metadata exists. For now, this handles all new signups.
