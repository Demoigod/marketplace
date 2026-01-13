-- ============================================================================
-- COMPLETE FIX: User Signup Error
-- ============================================================================
-- Run these commands ONE BY ONE in Supabase SQL Editor
-- Check the result of each step before proceeding
-- ============================================================================

-- ============================================================================
-- STEP 1: Check current state
-- ============================================================================
-- Run this first to see what's wrong
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'public_user_id';

-- ============================================================================
-- STEP 2: Drop the NOT NULL constraint if it exists
-- ============================================================================
ALTER TABLE public.profiles
ALTER COLUMN public_user_id DROP NOT NULL;

-- ============================================================================
-- STEP 3: Verify the generation function exists
-- ============================================================================
-- This should return the function definition
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'generate_public_user_id';

-- If it doesn't exist, create it:
CREATE OR REPLACE FUNCTION generate_public_user_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id INTEGER;
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        new_id := floor(random() * 900000 + 100000)::INTEGER;
        
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public_user_id = new_id
        ) THEN
            RETURN new_id;
        END IF;
        
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique public_user_id after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- ============================================================================
-- STEP 4: Create the trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION assign_public_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.public_user_id IS NULL THEN
        NEW.public_user_id := generate_public_user_id();
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 5: Drop and recreate the trigger
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

CREATE TRIGGER trigger_assign_public_user_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_public_user_id();

-- ============================================================================
-- STEP 6: Backfill existing users
-- ============================================================================
UPDATE public.profiles
SET public_user_id = generate_public_user_id()
WHERE public_user_id IS NULL;

-- ============================================================================
-- STEP 7: Verify all users have IDs
-- ============================================================================
SELECT 
    COUNT(*) as total_users,
    COUNT(public_user_id) as users_with_id,
    COUNT(*) - COUNT(public_user_id) as missing_ids
FROM public.profiles;

-- Expected: missing_ids should be 0

-- ============================================================================
-- STEP 8: Add constraints (ONLY if step 7 shows missing_ids = 0)
-- ============================================================================
-- Add NOT NULL constraint
ALTER TABLE public.profiles
ALTER COLUMN public_user_id SET NOT NULL;

-- Add UNIQUE constraint
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_unique UNIQUE (public_user_id);

-- Add CHECK constraint for 6-digit range
ALTER TABLE public.profiles
ADD CONSTRAINT public_user_id_range 
CHECK (public_user_id >= 100000 AND public_user_id <= 999999);

-- ============================================================================
-- STEP 9: Test with a new signup
-- ============================================================================
-- Now try signing up a new user through your app
-- The public_user_id should be automatically assigned

-- ============================================================================
-- VERIFICATION: Check the trigger is working
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_assign_public_user_id';

-- Expected: Should show the trigger exists with BEFORE INSERT timing

-- ============================================================================
-- If signup STILL fails, run this alternative fix:
-- ============================================================================
-- Set a DEFAULT value as a fallback
-- ALTER TABLE public.profiles
-- ALTER COLUMN public_user_id SET DEFAULT (generate_public_user_id());

-- This ensures IDs are assigned even if the trigger doesn't fire
-- ============================================================================
