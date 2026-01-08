-- Fix for Registration RLS Error
-- Run this script in your Supabase SQL Editor

-- 1. Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    -- Extract metadata from the auth.users table
    -- Default to 'User' and 'buyer' if missing to strictly prevent errors
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update RLS policies to be safe (optional but recommended)
-- Ensure the insert policy allows the trigger to work (SECURITY DEFINER handles this usually, but good to be clean)
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- We don't strictly need an INSERT policy for users anymore since the trigger handles it with system privileges,
-- but we keep SELECT and UPDATE for the user themselves.
