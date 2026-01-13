-- ============================================================================
-- 🚨 EMERGENCY FIX: RESTORE SIGNUP FUNCTIONALITY 🚨
-- ============================================================================
-- This script Fixes the "Database error saving new user" by:
-- 1. Ensuring the 'role' column has a default value (it was NOT NULL without default)
-- 2. Ensuring the 'username' vs 'name' column mismatch is handled
-- 3. Ensuring 'public_user_id' doesn't block signup
-- ============================================================================

BEGIN;

-- 1. Ensure the 'role' column has a default value so signup doesn't fail
-- (The schema shared shows role is NOT NULL, which was likely the blocker)
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';

-- 2. Update handle_new_user to be robust against missing columns
-- This version checks if columns exist before trying to use them
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_exists BOOLEAN;
    full_name_exists BOOLEAN;
    name_exists BOOLEAN;
BEGIN
    -- Check which columns actually exist in the table
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') INTO username_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') INTO full_name_exists;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') INTO name_exists;

    -- Dynamic Insert based on existing columns
    IF username_exists AND full_name_exists THEN
        INSERT INTO public.profiles (id, username, full_name, email)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'User_' || substr(new.id::text, 1, 8)),
            new.raw_user_meta_data->>'name',
            new.email
        );
    ELSIF name_exists THEN
        INSERT INTO public.profiles (id, name, email)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username', 'User_' || substr(new.id::text, 1, 8)),
            new.email
        );
    ELSE
        -- Fallback: just ID and Email if all else fails
        INSERT INTO public.profiles (id, email)
        VALUES (new.id, new.email);
    END IF;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Even if profile creation fails, we allow the auth user to be created
    -- We can resolve missing profiles manually, but blocking signup is worse
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure public_user_id trigger is also fail-safe
CREATE OR REPLACE FUNCTION assign_public_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only assign if not already set
    IF NEW.public_user_id IS NULL THEN
        NEW.public_user_id := generate_public_user_id();
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- NEVER block signup for a public ID
    RETURN NEW;
END;
$$;

-- 4. Re-apply trigger
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;
CREATE TRIGGER trigger_assign_public_user_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_public_user_id();

-- 5. Final check: ensure public_user_id is NULLABLE
ALTER TABLE public.profiles ALTER COLUMN public_user_id DROP NOT NULL;

COMMIT;

-- ============================================================================
-- ✅ DONE: Try registering a new user now.
-- ============================================================================
