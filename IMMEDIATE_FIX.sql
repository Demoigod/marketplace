-- ============================================================================
-- IMMEDIATE FIX - Run this NOW to fix signup
-- ============================================================================
-- This will make public_user_id nullable so signups can work
-- The trigger will still assign IDs automatically
-- ============================================================================

-- Step 1: Make the column nullable (allows signups to proceed)
ALTER TABLE public.profiles
ALTER COLUMN public_user_id DROP NOT NULL;

-- Step 2: Verify the trigger function exists
CREATE OR REPLACE FUNCTION assign_public_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.public_user_id IS NULL THEN
        NEW.public_user_id := (
            SELECT floor(random() * 900000 + 100000)::INTEGER
            FROM generate_series(1, 100)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE public_user_id = floor(random() * 900000 + 100000)::INTEGER
            )
            LIMIT 1
        );
        
        -- Fallback if above fails
        IF NEW.public_user_id IS NULL THEN
            NEW.public_user_id := floor(random() * 900000 + 100000)::INTEGER;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Step 3: Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_assign_public_user_id ON public.profiles;

CREATE TRIGGER trigger_assign_public_user_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_public_user_id();

-- Step 4: Backfill any existing users without IDs
UPDATE public.profiles
SET public_user_id = floor(random() * 900000 + 100000)::INTEGER
WHERE public_user_id IS NULL;

-- ============================================================================
-- ✅ DONE - Try signing up now!
-- ============================================================================
-- The column is now nullable, so signups will work
-- The trigger will automatically assign 6-digit IDs to new users
-- ============================================================================

-- Verification query (run this to check):
SELECT 
    COUNT(*) as total_users,
    COUNT(public_user_id) as users_with_id
FROM public.profiles;
