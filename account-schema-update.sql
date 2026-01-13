-- ACCOUNT PROFILE SYSTEM UPDATE
-- Adds detailed fields to the profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update handle_new_user trigger to handle first/last name if available in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, first_name, last_name, phone)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'User_' || substr(new.id::text, 1, 8)),
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
